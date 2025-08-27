import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Book from '@/models/Book';

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  await dbConnect();
  const book = await Book.findById(params.id);
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(book);
}

export async function PUT(req: Request, { params }: Params) {
  await dbConnect();
  const data = await req.json();
  const book = await Book.findByIdAndUpdate(params.id, data, { new: true });
  return NextResponse.json(book);
}
