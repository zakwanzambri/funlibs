import {Schema, model, models, Types} from 'mongoose';

const BorrowSchema = new Schema({
  user: {type: Types.ObjectId, ref: 'User', required: true},
  book: {type: Types.ObjectId, ref: 'Book', required: true},
  borrowDate: {type: Date, default: Date.now},
  dueDate: {type: Date, required: true},
  returnDate: Date,
  fine: {type: Number, default: 0}
},{timestamps:true});

export default models.Borrow || model('Borrow', BorrowSchema);
