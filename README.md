# FunLibs

FunLibs is a Library Management System built with **Next.js 14** (App Router), **TypeScript**, **TailwindCSS**, and **MongoDB**. It supports authentication with NextAuth, multi-language (EN/BM) with next-intl, book CRUD with image cover, borrow/return workflow with automatic due dates and fine calculation, analytics dashboard powered by Chart.js, and email notifications via SMTP. The UI is responsive, dark mode enabled, and ready to deploy on Vercel.

## Features

- 🔐 Authentication with roles (Admin, Staff, Student) using NextAuth.js
- 📚 Book management (create, update, delete, upload cover via drag & drop)
- 🔄 Borrow & Return with automatic due date and fine calculation
- 📊 Analytics dashboard using Chart.js
- 🌐 Multi-language support (English & Bahasa Melayu) using next-intl
- ✉️ Email notifications for due dates and fines using SMTP (Nodemailer)
- 🎨 Modern responsive design with TailwindCSS and dark mode
- ♻️ Reusable UI components (Button, Modal, Table, Form)
- 📁 Modular folder structure (components, services, utils)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set the environment variables.

3. Run the development server:

```bash
npm run dev
```

Open <http://localhost:3000> in your browser.

## Project Structure

- `app/` – Next.js App Router pages and API routes
- `components/` – Reusable UI components
- `models/` – Mongoose models
- `services/` – Data access helpers
- `utils/` – Utility functions (mailer, date helpers)
- `messages/` – Localization files
- `public/` – Static assets

## Deployment

The project is configured for deployment on [Vercel](https://vercel.com/). Push to a GitHub repository and import into Vercel, or use the `vercel` CLI.

## License

MIT
