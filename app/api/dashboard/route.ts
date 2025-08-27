import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';

function queryAll(db: sqlite3.Database, sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function queryGet(db: sqlite3.Database, sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export async function GET() {
  const db = new sqlite3.Database(process.env.DB_FILE || 'library.db');

  await queryAll(db, `CREATE TABLE IF NOT EXISTS borrowings(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    due_date TEXT NOT NULL,
    returned_at TEXT,
    FOREIGN KEY(book_id) REFERENCES books(id)
  );`);

  const mostBorrowed = await queryAll(
    db,
    `SELECT b.title AS title, COUNT(br.id) AS count
     FROM borrowings br
     JOIN books b ON br.book_id = b.id
     GROUP BY br.book_id
     ORDER BY count DESC
     LIMIT 5`
  );

  const overdue = await queryGet(
    db,
    `SELECT COUNT(*) AS count FROM borrowings
     WHERE returned_at IS NULL AND date(due_date) < date('now')`
  );

  const totalBooks = await queryGet(db, `SELECT COUNT(*) AS count FROM books`);
  const totalBorrowings = await queryGet(db, `SELECT COUNT(*) AS count FROM borrowings`);

  const borrowTrend = await queryAll(
    db,
    `SELECT strftime('%Y-%m', due_date) AS month, COUNT(*) AS count
     FROM borrowings
     GROUP BY month
     ORDER BY month`
  );

  db.close();

  return NextResponse.json({
    mostBorrowed,
    overdueCount: overdue?.count ?? 0,
    totalBooks: totalBooks?.count ?? 0,
    totalBorrowings: totalBorrowings?.count ?? 0,
    borrowTrend
  });
}
