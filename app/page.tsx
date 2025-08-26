import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-3xl font-bold">FunLibs Library</h1>
      <Link href="/dashboard" className="text-blue-600">Go to Dashboard</Link>
    </main>
  );
}
