const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database('library.db');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

// initialize database table
const initSql = `CREATE TABLE IF NOT EXISTS books(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER
);`;

db.run(initSql);

// routes
app.get('/', (req, res) => {
    db.all('SELECT * FROM books', [], (err, rows) => {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PustakaPro running on port ${PORT}`));
