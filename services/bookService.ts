import Book from '@/models/Book';
import dbConnect from '@/lib/db';

export async function getBooks() {
  await dbConnect();
  return Book.find();
}
