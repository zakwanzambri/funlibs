require('dotenv').config();
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || 'library.db';
const db = new sqlite3.Database(DB_FILE);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(morgan('combined'));

// initialize database table
const initSql = `CREATE TABLE IF NOT EXISTS books(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER
);`;

db.run(initSql, (err) => {
    if (err) console.error('Failed to initialize database', err);
});

// initialize borrows table
const borrowSql = `CREATE TABLE IF NOT EXISTS borrows(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER,
    user_id TEXT,
    borrowDate TEXT,
    dueDate TEXT,
    returnDate TEXT,
    fine REAL DEFAULT 0
);`;

db.run(borrowSql, (err) => {
    if (err) console.error('Failed to initialize borrows table', err);
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

// borrow management routes
app.use('/api/borrows', require('./app/api/borrows'));
app.use('/borrows', require('./app/borrows'));

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
