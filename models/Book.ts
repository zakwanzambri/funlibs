import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  year: number;
  coverUrl?: string;
  status: string;
}

const BookSchema: Schema<IBook> = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  coverUrl: { type: String },
  status: { type: String, enum: ['available', 'checked-out'], default: 'available' }
});

const Book: Model<IBook> = mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema);
export default Book;
