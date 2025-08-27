# Next.js Application Setup

This repository contains a starter stack for building applications with [Next.js](https://nextjs.org/). It uses NextAuth for authentication and MongoDB for persistence.

## Installation

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and provide values for `MONGODB_URI`, `NEXTAUTH_SECRET`, `EMAIL_SERVER`, `EMAIL_FROM`, and any other required variables.

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Building

Create an optimized production build:

```bash
npm run build
```

Run the production build locally:

```bash
npm start
```

## Deployment

### Deploying to Vercel

1. Push this project to a Git repository (GitHub, GitLab, etc.).
2. Sign in to [Vercel](https://vercel.com) and import the repository.
3. Add the required environment variables in the Vercel dashboard.
4. Click **Deploy**. Vercel will build the project and provide a deployment URL.
5. Subsequent pushes to your main branch will trigger automatic redeployments.

Alternatively, you can deploy using the Vercel CLI:

```bash
npm install -g vercel
vercel
```

## Scripts

- `npm run dev` – start the development server.
- `npm run build` – build the application for production.
- `npm start` – run the production server.

## Usage

Use `npm run dev` during development, then `npm run build` followed by `npm start` for production environments. Deployments to Vercel will automatically run the build and start commands.
