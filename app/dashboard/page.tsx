import StatsChart from '@/components/dashboard/StatsChart';
import dbConnect from '@/lib/db';
import Borrow from '@/models/Borrow';

export default async function Dashboard() {
  await dbConnect();
  const borrows = await Borrow.find();
  const stats: Record<string, number> = {};
  borrows.forEach((b: any) => {
    const month = b.borrowDate.toISOString().substring(0,7);
    stats[month] = (stats[month] || 0) + 1;
  });
  const labels = Object.keys(stats);
  const data = Object.values(stats);
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <StatsChart labels={labels} data={data.map((n:any)=>Number(n))} />
    </div>
  );
}
