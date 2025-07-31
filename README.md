# PustakaPro

PustakaPro is a lightweight library management web application built with **Node.js**, **Express**, and **SQLite**. It offers a minimal interface to keep track of your books.

## Features

- View all stored books
- Add new books with title, author and optional publication year
- Edit or delete existing entries
- Simple EJS views and CSS for quick customization
- Production middleware for logging and security

## Requirements

- [Node.js](https://nodejs.org/) 18 or later

## Getting Started

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and adjust settings if needed.

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
- `public/style.css` – basic styling

Additional production middleware includes logging with **morgan** and security headers via **helmet**. A simple 404 page and error handler are also provided.
