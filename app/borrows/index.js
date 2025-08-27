const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

const DB_FILE = process.env.DB_FILE || 'library.db';
const DAILY_RATE = parseFloat(process.env.DAILY_RATE || '1');
const db = new sqlite3.Database(DB_FILE);

// list borrows
router.get('/', (req, res) => {
  db.all('SELECT * FROM borrows', [], (err, rows) => {
    if (err) return res.status(500).send(err.toString());
    res.render('borrows', { borrows: rows });
  });
});

// handle borrow from form
router.post('/borrow', (req, res) => {
  const { bookId, userId } = req.body;
  if (!bookId || !userId) return res.status(400).send('bookId and userId required');
  const borrowDate = new Date();
  const dueDate = new Date(borrowDate);
  dueDate.setDate(dueDate.getDate() + 14);
  db.run(
    'INSERT INTO borrows(book_id, user_id, borrowDate, dueDate, returnDate, fine) VALUES (?,?,?,?,?,?)',
    [bookId, userId, borrowDate.toISOString(), dueDate.toISOString(), null, 0],
    err => {
      if (err) return res.status(500).send(err.toString());
      res.redirect('/borrows');
    }
  );
});

// handle return from form
router.post('/return/:id', (req, res) => {
  const id = req.params.id;
  const returnDate = new Date();
  db.get('SELECT dueDate FROM borrows WHERE id=?', [id], (err, row) => {
    if (err) return res.status(500).send(err.toString());
    if (!row) return res.status(404).send('Borrow record not found');
    const dueDate = new Date(row.dueDate);
    const daysLate = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
    const fine = daysLate > 0 ? daysLate * DAILY_RATE : 0;
    db.run(
      'UPDATE borrows SET returnDate=?, fine=? WHERE id=?',
      [returnDate.toISOString(), fine, id],
      err2 => {
        if (err2) return res.status(500).send(err2.toString());
        res.redirect('/borrows');
      }
    );
  });
});

module.exports = router;
