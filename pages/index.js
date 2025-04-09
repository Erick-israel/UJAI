import Link from "next/link";

export default function Home() {
  return (
    <div style={{ height: "100vh", backgroundColor: "#1a1a1a", color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Welcome</h1>
      <Link href="/login" style={{ textDecoration: "underline", color: "white", marginBottom: "1rem" }}>Login</Link>
      <Link href="/register" style={{ textDecoration: "underline", color: "white" }}>Register</Link>
    </div>
  );
}