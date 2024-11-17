"use client";
import React from "react";
import Link from "next/link";

type NavbarProps = {
  user: { fullname: string } | null;
  onLogout: () => void;
  isMenuOpen: boolean;
  toggleMenu: () => void;
};

function MyNavbar({ user, onLogout, isMenuOpen, toggleMenu }: NavbarProps) {
  return (
    <nav className="absolute left-0 top-0 z-50 w-full bg-blue-500 p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-white">
          <Link href="/">MyTicket</Link>
        </div>

        {/* Menu for larger screens */}
        <div className="hidden gap-8 font-semibold text-white md:flex">
          <Link href="/">Main Page</Link>
        </div>

        {/* Right Side */}
        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <span className="text-white">Hello, {user.fullname}</span>
              <button className="text-white" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-white">
                Login
              </Link>
              <Link href="/auth/register" className="text-white">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Burger Menu Button */}
        <button className="text-white md:hidden" onClick={toggleMenu}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mt-4 flex flex-col items-center gap-4 font-semibold text-white md:hidden">
          <Link href="/">Main Page</Link>
          <Link href="/event-list">Event List</Link>
          {user ? (
            <>
              <span>Hello, {user.fullname}</span>
              <Link href="/ticket">Tickets</Link>
              <Link href="/review">Review</Link>
              <button onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default MyNavbar;
