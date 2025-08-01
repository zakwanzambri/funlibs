require('dotenv').config();
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || 'library.db';
const db = new sqlite3.Database(DB_FILE);

const CATEGORIES = ['Fiction', 'Non-fiction', 'Science', 'Biography', 'Other'];
const STATUSES = ['Available', 'Checked Out', 'Reserved'];

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
app.use((req, res, next) => {
    res.locals.userId = req.session.userId;
    res.locals.username = req.session.username;
    res.locals.error = req.session.error;
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
    password TEXT NOT NULL
);`;

const reviewSql = `CREATE TABLE IF NOT EXISTS reviews(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    reviewer TEXT,
    rating INTEGER,
    comment TEXT,
    FOREIGN KEY(book_id) REFERENCES books(id)
);`;

db.serialize(() => {
    db.run(bookSql);
    db.run(userSql);
    db.run(reviewSql);
});

function checkAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
}

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
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users(username, password) VALUES (?, ?)', [username, hash], err => {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                req.session.error = 'Username already taken';
                return res.redirect('/register');
            }
            return res.status(500).send(err.toString());
        }
        req.session.error = 'Registration successful. Please log in.';
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
            req.session.userId = user.id;
            req.session.username = user.username;
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

app.get('/add', checkAuth, (req, res) => {
    res.render('add', { categories: CATEGORIES, statuses: STATUSES });
});

app.post('/add', checkAuth, (req, res) => {
    const { title, author, year, genre, isbn, status, image, description } = req.body;
    db.run('INSERT INTO books(title, author, year, genre, isbn, status, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [title, author, year, genre, isbn, status, image, description],
        (err) => {
            if (err) return res.status(500).send(err.toString());
            res.redirect('/');
        });
});

app.get('/edit/:id', checkAuth, (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).send(err.toString());
        res.render('edit', { book: row, categories: CATEGORIES, statuses: STATUSES });
    });
});

app.post('/edit/:id', checkAuth, (req, res) => {
    const id = req.params.id;
    const { title, author, year, genre, isbn, status, image, description } = req.body;
    db.run('UPDATE books SET title=?, author=?, year=?, genre=?, isbn=?, status=?, image=?, description=? WHERE id=?',
        [title, author, year, genre, isbn, status, image, description, id],
        (err) => {
            if (err) return res.status(500).send(err.toString());
            res.redirect('/');
        });
});

app.post('/delete/:id', checkAuth, (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM books WHERE id=?', [id], (err) => {
        if (err) return res.status(500).send(err.toString());
        res.redirect('/');
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
