import {NextResponse} from 'next/server';
import dbConnect from '@/lib/db';
import Borrow from '@/models/Borrow';
import {addDays} from '@/utils/dates';

export async function POST(req: Request) {
  await dbConnect();
  const {userId, bookId, days} = await req.json();
  const dueDate = addDays(new Date(), days || 7);
  const borrow = await Borrow.create({user: userId, book: bookId, dueDate});
  return NextResponse.json(borrow);
}

export async function PUT(req: Request) {
  await dbConnect();
  const {id} = await req.json();
  const borrow = await Borrow.findById(id);
  if (!borrow) return NextResponse.json({error: 'Not found'}, {status: 404});
  borrow.returnDate = new Date();
  if (borrow.returnDate > borrow.dueDate) {
    const diff = Math.ceil((borrow.returnDate.getTime() - borrow.dueDate.getTime()) / (1000*60*60*24));
    borrow.fine = diff * 1; // 1 currency per day
  }
  await borrow.save();
  return NextResponse.json(borrow);
}
