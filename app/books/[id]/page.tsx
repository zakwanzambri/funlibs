import Link from 'next/link';
import dbConnect from '@/lib/db';
import Book from '@/models/Book';

interface Params {
  params: { id: string };
}

export default async function BookDetailPage({ params }: Params) {
  await dbConnect();
  const book = await Book.findById(params.id).lean();
  if (!book) return <div>Book not found</div>;
  return (
    <div>
      <h1>{book.title}</h1>
      <p>{book.author}</p>
      <p>{book.year}</p>
      {book.coverUrl && <img src={book.coverUrl} alt={book.title} width={200} />}
      <p>Status: {book.status}</p>
      <Link href={`/books/${book._id}/edit`}>Edit</Link>
    </div>
  );
}
