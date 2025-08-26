import {NextResponse} from 'next/server';
import dbConnect from '@/lib/db';
import Book from '@/models/Book';

export async function GET(_req: Request, {params}:{params:{id:string}}) {
  await dbConnect();
  const book = await Book.findById(params.id);
  return NextResponse.json(book);
}

export async function PUT(req: Request, {params}:{params:{id:string}}) {
  await dbConnect();
  const data = await req.json();
  const book = await Book.findByIdAndUpdate(params.id, data, {new:true});
  return NextResponse.json(book);
}

export async function DELETE(_req: Request, {params}:{params:{id:string}}) {
  await dbConnect();
  await Book.findByIdAndDelete(params.id);
  return NextResponse.json({success:true});
}
