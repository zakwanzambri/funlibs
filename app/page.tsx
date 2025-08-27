import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  return (
    <main>
      <h1>Welcome to FunLibs</h1>
      {session ? <p>Signed in as {session.user?.email}</p> : <p>You are not signed in.</p>}
    </main>
  );
}
