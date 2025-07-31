# PustakaPro

PustakaPro is a lightweight library management web application built with **Node.js**, **Express**, and **SQLite**. It offers a minimal interface to keep track of your books.

## Features

- View all stored books
- Add new books with title, author and optional publication year
- Edit or delete existing entries
- Simple EJS views and CSS for quick customization

## Requirements

- [Node.js](https://nodejs.org/) 18 or later

## Getting Started

Install dependencies:

```bash
npm install
```

Start the server:

```bash
node app.js
```

By default the application runs on `http://localhost:3000`. Set the `PORT` environment variable to use a different port.

## Database

The first run will create an `library.db` SQLite database file in the project directory if one does not already exist. This file is ignored by Git via `.gitignore`.

## Project Structure

- `app.js` – main Express application
- `views/` – EJS templates for the pages
- `public/style.css` – basic styling

Feel free to extend the project with additional features such as search or user accounts.
