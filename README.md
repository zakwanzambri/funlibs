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
- User profiles store email and contact information
- Registration emails a verification link that must be confirmed before login
- Password reset flow via unique links
- Dashboard shows the books each user has borrowed
- Book checkout and return with 14 day due dates
- Overdue tracking and daily fines
- Reserve books that are checked out
- Librarian view of all members
- Roles for Librarian, Member and Guest control access
- Modern EJS interface with navigation and styling
- Reusable navigation bar and responsive layout for a consistent experience on mobile and desktop
- Environment driven configuration with `.env`
- Production middleware for logging, security headers and error pages
- Custom 404 page for missing routes
- Library statistics dashboard for librarians
- Reports on book popularity and overdue items
- User activity logs for auditing
- JSON API endpoints for mobile integration
- Upload book cover images directly
- Email reminders for upcoming due dates
- Backup and restore the SQLite database
- Multi-language interface (English and Indonesian)

## Requirements

- [Node.js](https://nodejs.org/) 18 or later

## Getting Started

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env` and adjust settings if needed.
Set `SESSION_SECRET` to any string for securing sessions.
Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` to enable email notifications.

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
