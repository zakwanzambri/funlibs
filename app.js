require('dotenv').config();
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const scheduler = require('./lib/scheduler');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || 'library.db';
const db = new sqlite3.Database(DB_FILE);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.use(morgan('combined'));

// initialize database tables
const initSql = `CREATE TABLE IF NOT EXISTS books(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER
);`;

const borrowSql = `CREATE TABLE IF NOT EXISTS borrows(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bookId INTEGER NOT NULL,
    userEmail TEXT NOT NULL,
    dueDate TEXT NOT NULL,
    locale TEXT DEFAULT 'en',
    fine REAL DEFAULT 0,
    returned INTEGER DEFAULT 0,
    FOREIGN KEY(bookId) REFERENCES books(id)
);`;

db.serialize(() => {
    db.run(initSql);
    db.run(borrowSql);
});

// routes
app.get('/', (req, res) => {
    db.all('SELECT * FROM books', [], (err, rows) => {
        if (err) return res.status(500).send(err.toString());
        res.render('index', { books: rows });
    });
});

// search books
app.get('/search', (req, res) => {
    const q = `%${req.query.q || ''}%`;
    db.all('SELECT * FROM books WHERE title LIKE ? OR author LIKE ?', [q, q], (err, rows) => {
        if (err) return res.status(500).send(err.toString());
        res.render('index', { books: rows });
    });
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', (req, res) => {
    const { title, author, year } = req.body;
    db.run('INSERT INTO books(title, author, year) VALUES (?, ?, ?)',
        [title, author, year],
        (err) => {
            if (err) return res.status(500).send(err.toString());
            res.redirect('/');
        });
});

app.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).send(err.toString());
        res.render('edit', { book: row });
    });
});

app.get('/book/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM books WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).send(err.toString());
        if (!row) return res.status(404).render('404');
        res.render('show', { book: row });
    });
});

app.post('/edit/:id', (req, res) => {
    const id = req.params.id;
    const { title, author, year } = req.body;
    db.run('UPDATE books SET title=?, author=?, year=? WHERE id=?',
        [title, author, year, id],
        (err) => {
            if (err) return res.status(500).send(err.toString());
            res.redirect('/');
        });
});

app.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM books WHERE id=?', [id], (err) => {
        if (err) return res.status(500).send(err.toString());
        res.redirect('/');
    });
});

// borrow a book
app.post('/borrow', (req, res) => {
    const { bookId, userEmail, dueDate, locale } = req.body;
    db.run('INSERT INTO borrows(bookId, userEmail, dueDate, locale) VALUES(?, ?, ?, ?)',
        [bookId, userEmail, dueDate, locale || 'en'], function (err) {
            if (err) return res.status(500).send(err.toString());
            // fetch book title for email templates
            db.get('SELECT title FROM books WHERE id = ?', [bookId], (e2, row) => {
                if (e2) return res.status(500).send(e2.toString());
                scheduler.scheduleBorrowReminder({
                    id: this.lastID,
                    bookId,
                    title: row ? row.title : '',
                    userEmail,
                    dueDate,
                    locale: locale || 'en'
                }, parseInt(process.env.REMINDER_DAYS || '3', 10));
                res.redirect('/');
            });
        });
});

// impose a fine on a borrow
app.post('/borrows/:id/fine', (req, res) => {
    const id = req.params.id;
    const amount = Number(req.body.amount || 0);
    db.get(
        'SELECT b.*, bk.title FROM borrows b JOIN books bk ON b.bookId = bk.id WHERE b.id = ?',
        [id],
        (err, borrow) => {
            if (err) return res.status(500).send(err.toString());
            if (!borrow) return res.status(404).send('Borrow not found');
            db.run('UPDATE borrows SET fine = ? WHERE id = ?', [amount, id], (e2) => {
                if (e2) return res.status(500).send(e2.toString());
                scheduler.scheduleFineNotice({
                    title: borrow.title,
                    userEmail: borrow.userEmail,
                    locale: borrow.locale
                }, amount);
                res.send('Fine imposed');
            });
        }
    );
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
