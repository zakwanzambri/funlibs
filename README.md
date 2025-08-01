# PustakaPro

PustakaPro is a lightweight library management web application built with **Node.js**, **Express**, and **SQLite**. It offers a minimal interface to keep track of your books.

## Features

- View your entire book collection
- Add books with title, author, year, genre, ISBN and description
- Categories such as Fiction, Non-fiction and Science
- Availability status (Available, Checked Out, Reserved)
- Optional book cover images
- Optional long descriptions for each book
- Detailed pages display cover images, full descriptions and average rating, plus a form to submit reviews
- Search and filter by keyword, genre and status
- Readers can leave reviews with 1-5 star ratings
- Register and log in with passwords hashed by **bcrypt**
- Session-based authentication to edit or delete entries with friendly error messages
- Navigation displays the logged in user name
- Modern EJS interface with navigation and styling
- Environment driven configuration with `.env`
- Production middleware for logging, security headers and error pages
- Custom 404 page for missing routes

## Requirements

- [Node.js](https://nodejs.org/) 18 or later

## Getting Started

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and adjust settings if needed.
Set `SESSION_SECRET` to any string for securing sessions.

Start the server:

```bash
npm start
```

The application defaults to `http://localhost:3000`. Use the `PORT` and `DB_FILE` variables in `.env` to customize.

## Database

The first run will create a SQLite database file specified by `DB_FILE` (default `library.db`) if one does not already exist. This file is ignored by Git via `.gitignore`.

## Project Structure

- `app.js` – main Express application
- `views/` – EJS templates for the pages
- `public/style.css` – modern styling

Additional production middleware includes logging with **morgan** and security headers via **helmet**. A simple 404 page and error handler are also provided.
