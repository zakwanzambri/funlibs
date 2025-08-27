import Link from 'next/link';
import dbConnect from '@/lib/db';
import Book from '@/models/Book';

export default async function BooksPage() {
  await dbConnect();
  const books = await Book.find().lean();
  return (
    <div>
      <h1>Books</h1>
      <Link href="/books/new">Add Book</Link>
      <ul>
        {books.map((book: any) => (
          <li key={book._id}>
            <Link href={`/books/${book._id}`}>{book.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
