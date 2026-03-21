"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          SmartConsumer
        </Link>
        <div className="navbar-links">
          <Link href="/" className={`navbar-link ${pathname === "/" ? "active" : ""}`}>
            Home
          </Link>
          <Link href="/about" className={`navbar-link ${pathname === "/about" ? "active" : ""}`}>
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}