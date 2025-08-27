require('dotenv').config();
const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || 'library';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

const client = new MongoClient(MONGODB_URI);
let books;

client.connect()
  .then(() => {
    const db = client.db(DB_NAME);
    books = db.collection('books');
    app.listen(PORT, () => console.log(`PustakaPro running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());
app.use(morgan('combined'));

app.get('/', async (req, res) => {
  try {
    const rows = await books.find().toArray();
    res.render('index', { books: rows });
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.get('/search', async (req, res) => {
  const q = req.query.q || '';
  try {
    const rows = await books.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } }
      ]
    }).toArray();
    res.render('index', { books: rows });
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.get('/add', (req, res) => {
  res.render('add');
});

app.post('/add', async (req, res) => {
  const { title, author, year } = req.body;
  try {
    await books.insertOne({ title, author, year: year ? parseInt(year) : undefined });
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.get('/edit/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const row = await books.findOne({ _id: new ObjectId(id) });
    res.render('edit', { book: row });
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.get('/book/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const row = await books.findOne({ _id: new ObjectId(id) });
    if (!row) return res.status(404).render('404');
    res.render('show', { book: row });
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.post('/edit/:id', async (req, res) => {
  const id = req.params.id;
  const { title, author, year } = req.body;
  try {
    await books.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, author, year: year ? parseInt(year) : undefined } }
    );
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.post('/delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await books.deleteOne({ _id: new ObjectId(id) });
    res.redirect('/');
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404');
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server error');
});
