import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <p>Access denied</p>;
  }
  return (
    <main>
      <h1>Admin Area</h1>
      <p>Hello {session.user?.email}</p>
    </main>
  );
}
