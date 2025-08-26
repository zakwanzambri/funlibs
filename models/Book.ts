import {Schema, model, models} from 'mongoose';

const BookSchema = new Schema({
  title: {type: String, required: true},
  author: {type: String, required: true},
  description: String,
  coverUrl: String,
  copies: {type: Number, default: 1}
},{timestamps:true});

export default models.Book || model('Book', BookSchema);
