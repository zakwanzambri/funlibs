import {NextResponse} from 'next/server';
import dbConnect from '@/lib/db';
import Book from '@/models/Book';

export async function GET() {
  await dbConnect();
  const books = await Book.find();
  return NextResponse.json(books);
}

export async function POST(req: Request) {
  await dbConnect();
  const data = await req.json();
  const book = await Book.create(data);
  return NextResponse.json(book);
}
