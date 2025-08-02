require('dotenv').config();
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const i18n = require('i18n');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || 'library.db';
const db = new sqlite3.Database(DB_FILE);

// ensure upload directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

const transporter = nodemailer.createTransport(process.env.SMTP_HOST ? {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
} : { jsonTransport: true });

i18n.configure({
    locales: ['en', 'id'],
    directory: path.join(__dirname, 'locales'),
    defaultLocale: 'en',
    queryParameter: 'lang'
});

const CATEGORIES = ['Fiction', 'Non-fiction', 'Science', 'Biography', 'Other'];
const STATUSES = ['Available', 'Checked Out', 'Reserved'];
const LOAN_DAYS = 14;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'pustaka_secret',
    resave: false,
    saveUninitialized: false
}));
app.use(helmet());
app.use(morgan('combined'));
app.use(i18n.init);
app.use((req, res, next) => {
    res.locals.userId = req.session.userId;
    res.locals.username = req.session.username;
    res.locals.role = req.session.role;
    res.locals.error = req.session.error;
    res.locals.locale = req.getLocale();
    delete req.session.error;
    next();
});

// initialize database tables
const bookSql = `CREATE TABLE IF NOT EXISTS books(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER,
    genre TEXT,
    isbn TEXT,
    status TEXT DEFAULT 'Available',
    image TEXT,
    description TEXT
);`;

const userSql = `CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    contact TEXT,
    role TEXT DEFAULT 'Member',
    verified INTEGER DEFAULT 0,
    verify_token TEXT,
    reset_token TEXT
);`;

const borrowSql = `CREATE TABLE IF NOT EXISTS borrows(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    book_id INTEGER,
    due_date TEXT,
    returned INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(book_id) REFERENCES books(id)
);`;

const reservationSql = `CREATE TABLE IF NOT EXISTS reservations(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    book_id INTEGER UNIQUE,
    created_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(book_id) REFERENCES books(id)
);`;

const reviewSql = `CREATE TABLE IF NOT EXISTS reviews(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    reviewer TEXT,
    rating INTEGER,
    comment TEXT,
    FOREIGN KEY(book_id) REFERENCES books(id)
);`;

const logSql = `CREATE TABLE IF NOT EXISTS logs(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    created_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);`;

db.serialize(() => {
    db.run(bookSql);
    db.run(userSql);
    db.run(borrowSql);
    db.run("ALTER TABLE borrows ADD COLUMN due_date TEXT", () => {});
    db.run(reservationSql);
    db.run(reviewSql);
    db.run(logSql);

    // seed default admin account
    const adminHash = bcrypt.hashSync('admin123', 10);
    db.get('SELECT id FROM users WHERE username=?', ['admin'], (err, row) => {
        if (err) return console.error(err);
        if (!row) {
            db.run('INSERT INTO users(username, password, role, verified) VALUES (?, ?, ?, 1)',
                ['admin', adminHash, 'Librarian']);
        }
    });
});

function checkAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

function checkRole(role) {
    return function(req, res, next) {
        if (req.session.role === role) return next();
        res.status(403).send('Forbidden');
    };
}

function log(userId, action) {
    if (!userId) return;
    db.run('INSERT INTO logs(user_id, action, created_at) VALUES (?, ?, ?)', [userId, action, new Date().toISOString()]);
}

function checkDueDates() {
    const soon = new Date(Date.now() + 24*60*60*1000).toISOString();
    const sql = `SELECT borrows.due_date, users.email, users.username, books.title
                 FROM borrows JOIN users ON users.id = borrows.user_id
                 JOIN books ON books.id = borrows.book_id
                 WHERE borrows.returned=0 AND borrows.due_date <= ?`;
    db.all(sql, [soon], (err, rows) => {
        if (err) return;
        rows.forEach(r => {
            transporter.sendMail({
                to: r.email,
                from: process.env.SMTP_USER || 'noreply@example.com',
                subject: `Book due soon: ${r.title}`,
                text: `Hi ${r.username}, the book "${r.title}" is due on ${r.due_date}.`
            });
        });
    });
}
setInterval(checkDueDates, 60*60*1000);

// routes
app.get('/', (req, res) => {
    const { q = '', genre = '', status = '' } = req.query;
    let sql = 'SELECT * FROM books WHERE 1=1';
    const params = [];
    if (q) {
        sql += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
        params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (genre) {
        sql += ' AND genre=?';
        params.push(genre);
    }
    if (status) {
        sql += ' AND status=?';
        params.push(status);
    }
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).send(err.toString());
        res.render('index', { books: rows, query: q, genre, status, categories: CATEGORIES, statuses: STATUSES });
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, password, email, contact } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(20).toString('hex');
    db.run('INSERT INTO users(username, password, email, contact, verify_token) VALUES (?, ?, ?, ?, ?)',
        [username, hash, email, contact, verifyToken], err => {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                req.session.error = 'Username already taken';
                return res.redirect('/register');
            }
            return res.status(500).send(err.toString());
        }
        const verifyUrl = `${req.protocol}://${req.get('host')}/verify/${verifyToken}`;
        transporter.sendMail({
            to: email,
            from: process.env.SMTP_USER || 'noreply@example.com',
            subject: 'Verify your PustakaPro account',
            text: `Hi ${username}, please verify your account by visiting: ${verifyUrl}`
        });
        req.session.error = 'Registration successful. Check your email for a verification link.';
        res.redirect('/login');
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username=?', [username], async (err, user) => {
        if (err) return res.status(500).send(err.toString());
        if (!user) {
            req.session.error = 'Invalid credentials';
            return res.redirect('/login');
        }
        const ok = await bcrypt.compare(password, user.password);
        if (ok) {
            if (!user.verified) {
                req.session.error = 'Please verify your email before logging in.';
                return res.redirect('/login');
            }
            req.session.userId = user.id;
            req.session.username = user.username;
            req.session.role = user.role;
            log(user.id, 'login');
            return res.redirect('/');
        }
        req.session.error = 'Invalid credentials';
        res.redirect('/login');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/profile', checkAuth, (req, res) => {
    db.get('SELECT username, email, contact, role, verified FROM users WHERE id=?', [req.session.userId], (err, user) => {
        if (err) return res.status(500).send(err.toString());
        res.render('profile', { user });
    });
});

app.get('/dashboard', checkAuth, (req, res) => {
    db.all('SELECT books.*, borrows.due_date FROM borrows JOIN books ON books.id=borrows.book_id WHERE borrows.user_id=? AND borrows.returned=0',
        [req.session.userId], (err, rows) => {
            if (err) return res.status(500).send(err.toString());
            rows.forEach(r => {
                const d = new Date(r.due_date);
                const diff = Math.ceil((Date.now() - d.getTime())/86400000);
                r.overdue = diff > 0;
                r.fine = r.overdue ? diff : 0;
            });
            db.all('SELECT books.* FROM reservations JOIN books ON books.id=reservations.book_id WHERE reservations.user_id=?',
                [req.session.userId], (err2, resRows) => {
                    if (err2) return res.status(500).send(err2.toString());
                    res.render('dashboard', { books: rows, reservations: resRows });
                });
        });
});

app.get('/members', checkAuth, checkRole('Librarian'), (req, res) => {
    db.all('SELECT id, username, email, contact, role FROM users', (err, rows) => {
        if (err) return res.status(500).send(err.toString());
        res.render('members', { members: rows });
    });
});

app.get('/verify/:token', (req, res) => {
    const t = req.params.token;
    db.run('UPDATE users SET verified=1, verify_token=NULL WHERE verify_token=?', [t], function(err) {
        if (err || this.changes === 0) return res.status(400).send('Invalid token');
        res.send('Email verified. You may now log in.');
    });
});

app.get('/reset', (req, res) => {
    res.render('reset');
});

app.post('/reset', (req, res) => {
    const { email } = req.body;
    const token = crypto.randomBytes(20).toString('hex');
    db.run('UPDATE users SET reset_token=? WHERE email=?', [token, email], function(err) {
        if (err || this.changes === 0) return res.status(400).send('Email not found');
        res.send(`Password reset link: /reset/${token}`);
    });
});

app.get('/reset/:token', (req, res) => {
    res.render('newpassword', { token: req.params.token });
});

app.post('/reset/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    db.run('UPDATE users SET password=?, reset_token=NULL WHERE reset_token=?', [hash, token], function(err) {
        if (err || this.changes === 0) return res.status(400).send('Invalid token');
        res.send('Password updated.');
    });
});

app.get('/add', checkAuth, checkRole('Librarian'), (req, res) => {
    res.render('add', { categories: CATEGORIES, statuses: STATUSES });
});

app.post('/add', checkAuth, checkRole('Librarian'), upload.single('image'), (req, res) => {
    const { title, author, year, genre, isbn, status, description } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : '';
    db.run('INSERT INTO books(title, author, year, genre, isbn, status, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [title, author, year, genre, isbn, status, image, description],
        (err) => {
            if (err) return res.status(500).send(err.toString());
            res.redirect('/');
        });
});

app.get('/edit/:id', checkAuth, checkRole('Librarian'), (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).send(err.toString());
        res.render('edit', { book: row, categories: CATEGORIES, statuses: STATUSES });
    });
});

app.post('/edit/:id', checkAuth, checkRole('Librarian'), upload.single('image'), (req, res) => {
    const id = req.params.id;
    const { title, author, year, genre, isbn, status, description, currentImage } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : currentImage;
    db.run('UPDATE books SET title=?, author=?, year=?, genre=?, isbn=?, status=?, image=?, description=? WHERE id=?',
        [title, author, year, genre, isbn, status, image, description, id],
        (err) => {
            if (err) return res.status(500).send(err.toString());
            res.redirect('/');
        });
});

app.post('/delete/:id', checkAuth, checkRole('Librarian'), (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM books WHERE id=?', [id], (err) => {
        if (err) return res.status(500).send(err.toString());
        res.redirect('/');
    });
});

app.get('/borrow/:id', checkAuth, (req, res) => {
    const id = req.params.id;
    db.get('SELECT status FROM books WHERE id=?', [id], (err, book) => {
        if (err || !book) return res.status(404).render('404');
        if (book.status === 'Checked Out') return res.redirect('/');
        if (book.status === 'Reserved') {
            db.get('SELECT user_id FROM reservations WHERE book_id=?', [id], (e2, r) => {
                if (e2 || !r || r.user_id !== req.session.userId) return res.redirect('/');
                db.run('DELETE FROM reservations WHERE book_id=?', [id]);
            });
        }
        const due = new Date();
        due.setDate(due.getDate() + LOAN_DAYS);
        db.run('UPDATE books SET status="Checked Out" WHERE id=?', [id]);
        db.run('INSERT INTO borrows(user_id, book_id, due_date) VALUES (?, ?, ?)', [req.session.userId, id, due.toISOString()]);
        log(req.session.userId, 'borrow ' + id);
        res.redirect('/dashboard');
    });
});

app.get('/reserve/:id', checkAuth, (req, res) => {
    const id = req.params.id;
    db.get('SELECT status FROM books WHERE id=?', [id], (err, book) => {
        if (err || !book) return res.status(404).render('404');
        if (book.status === 'Reserved') return res.redirect('/');
        db.get('SELECT * FROM reservations WHERE book_id=?', [id], (e2, r) => {
            if (e2 || r) return res.redirect('/');
            const now = new Date().toISOString();
            db.run('INSERT INTO reservations(user_id, book_id, created_at) VALUES (?, ?, ?)', [req.session.userId, id, now], err3 => {
                if (!err3) db.run('UPDATE books SET status="Reserved" WHERE id=?', [id]);
                log(req.session.userId, 'reserve ' + id);
                res.redirect('/dashboard');
            });
        });
    });
});

app.get('/return/:id', checkAuth, (req, res) => {
    const id = req.params.id;
    db.get('SELECT user_id FROM reservations WHERE book_id=?', [id], (err, r) => {
        const newStatus = r ? 'Reserved' : 'Available';
        db.run('UPDATE books SET status=? WHERE id=?', [newStatus, id]);
        db.run('UPDATE borrows SET returned=1 WHERE user_id=? AND book_id=? AND returned=0', [req.session.userId, id]);
        log(req.session.userId, 'return ' + id);
        res.redirect('/dashboard');
    });
});

app.get('/book/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM books WHERE id=?', [id], (err, book) => {
        if (err || !book) return res.status(404).render('404');
        db.all('SELECT * FROM reviews WHERE book_id=?', [id], (err2, reviews) => {
            if (err2) return res.status(500).send(err2.toString());
            const avg = reviews.length ? (reviews.reduce((a,r)=>a+r.rating,0)/reviews.length).toFixed(1) : null;
            res.render('book', { book, reviews, avg });
        });
    });
});

app.post('/book/:id/review', (req, res) => {
    const id = req.params.id;
    const { reviewer, rating, comment } = req.body;
    db.run('INSERT INTO reviews(book_id, reviewer, rating, comment) VALUES (?, ?, ?, ?)', [id, reviewer, rating, comment], err => {
        if (err) return res.status(500).send(err.toString());
        res.redirect(`/book/${id}`);
    });
});

app.get('/reports', checkAuth, checkRole('Librarian'), (req, res) => {
    db.get('SELECT COUNT(*) AS c FROM books', (err, b) => {
        if (err) return res.status(500).send(err.toString());
        db.get('SELECT COUNT(*) AS c FROM users', (err2, u) => {
            if (err2) return res.status(500).send(err2.toString());
            db.get('SELECT COUNT(*) AS c FROM borrows WHERE returned=0', (err3, br) => {
                if (err3) return res.status(500).send(err3.toString());
                db.get('SELECT COUNT(*) AS c FROM borrows WHERE returned=0 AND due_date < ?', [new Date().toISOString()], (err4, od) => {
                    if (err4) return res.status(500).send(err4.toString());
                    res.render('reports', { stats: { books: b.c, users: u.c, borrowed: br.c, overdue: od.c } });
                });
            });
        });
    });
});

app.get('/reports/popular', checkAuth, checkRole('Librarian'), (req, res) => {
    db.all('SELECT books.title, COUNT(borrows.id) AS count FROM books LEFT JOIN borrows ON books.id = borrows.book_id GROUP BY books.id ORDER BY count DESC', (err, rows) => {
        if (err) return res.status(500).send(err.toString());
        res.render('popular', { books: rows });
    });
});

app.get('/reports/overdue', checkAuth, checkRole('Librarian'), (req, res) => {
    const now = new Date().toISOString();
    db.all('SELECT books.title, users.username, borrows.due_date FROM borrows JOIN books ON books.id = borrows.book_id JOIN users ON users.id = borrows.user_id WHERE borrows.returned=0 AND borrows.due_date < ?', [now], (err, rows) => {
        if (err) return res.status(500).send(err.toString());
        rows.forEach(r => {
            const d = new Date(r.due_date);
            r.days = Math.ceil((Date.now() - d.getTime())/86400000);
        });
        res.render('overdue', { items: rows });
    });
});

app.get('/reports/activity', checkAuth, checkRole('Librarian'), (req, res) => {
    db.all('SELECT logs.action, logs.created_at, users.username FROM logs LEFT JOIN users ON users.id = logs.user_id ORDER BY logs.created_at DESC LIMIT 100', (err, rows) => {
        if (err) return res.status(500).send(err.toString());
        res.render('activity', { logs: rows });
    });
});

app.get('/reports/export/:format', checkAuth, checkRole('Librarian'), (req, res) => {
    db.all('SELECT title, author, status FROM books', (err, rows) => {
        if (err) return res.status(500).send(err.toString());
        if (req.params.format === 'csv') {
            const csv = ['Title,Author,Status', ...rows.map(r => `${r.title},${r.author},${r.status}`)].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="books.csv"');
            res.send(csv);
        } else if (req.params.format === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="books.pdf"');
            const doc = new PDFDocument();
            doc.pipe(res);
            doc.fontSize(18).text('Books Report', { align: 'center' });
            doc.moveDown();
            rows.forEach(r => doc.fontSize(12).text(`${r.title} - ${r.author} (${r.status})`));
            doc.end();
        } else {
            res.status(400).send('Unknown format');
        }
    });
});

// API endpoints
app.get('/api/books', (req, res) => {
    db.all('SELECT * FROM books', (err, rows) => {
        if (err) return res.status(500).json({ error: err.toString() });
        res.json(rows);
    });
});

app.get('/api/books/:id', (req, res) => {
    db.get('SELECT * FROM books WHERE id=?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.toString() });
        if (!row) return res.status(404).json({ error: 'Not found' });
        res.json(row);
    });
});

// backup and restore
app.get('/backup', checkAuth, checkRole('Librarian'), (req, res) => {
    const backupFile = DB_FILE + '.bak';
    fs.copyFile(DB_FILE, backupFile, err => {
        if (err) return res.status(500).send(err.toString());
        res.download(backupFile);
    });
});

app.post('/restore', checkAuth, checkRole('Librarian'), (req, res) => {
    const backupFile = DB_FILE + '.bak';
    fs.copyFile(backupFile, DB_FILE, err => {
        if (err) return res.status(500).send(err.toString());
        res.send('Restore complete');
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404');
});

// error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server error');
});

app.listen(PORT, () => console.log(`PustakaPro running on port ${PORT}`));
