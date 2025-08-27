import dbConnect from '@/lib/db';
import Book from '@/models/Book';
import BookForm from '@/components/BookForm';

interface Params {
  params: { id: string };
}

export default async function EditBookPage({ params }: Params) {
  await dbConnect();
  const book = await Book.findById(params.id).lean();
  if (!book) return <div>Book not found</div>;
  return (
    <div>
      <h1>Edit Book</h1>
      <BookForm book={book} />
    </div>
  );
}
