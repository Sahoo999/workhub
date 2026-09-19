import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <Link href="/">WorkHub</Link>

      <div>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
        <Link href="/dashboard">Dashboard</Link>
      </div>
    </nav>
  );
}