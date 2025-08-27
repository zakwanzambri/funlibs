import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Charts from './Charts';

async function getData() {
  const res = await fetch('http://localhost:3000/api/dashboard', {
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  return res.json();
}

export default async function DashboardPage() {
  const role = cookies().get('role')?.value;
  if (role !== 'admin' && role !== 'staff') {
    redirect('/');
  }

  const data = await getData();

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats">
        <div className="card">
          <h2>Total Books</h2>
          <p>{data.totalBooks}</p>
        </div>
        <div className="card">
          <h2>Total Borrowings</h2>
          <p>{data.totalBorrowings}</p>
        </div>
        <div className="card">
          <h2>Overdue Books</h2>
          <p>{data.overdueCount}</p>
        </div>
      </div>
      <Charts data={data} />
    </div>
  );
}
