import React, { useState } from 'react';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // Status burger menu

  const username = 'NamaPengguna';

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="flex items-center justify-between bg-gray-200 p-4 border-4 border-black">
      {/* Logo di bagian kiri */}
      <div className="text-2xl font-bold">
        <a href="/">Logo</a>
      </div>

      {/* Burger menu untuk tampilan mobile */}
      <div className="md:hidden" onClick={toggleMenu}>
        <div className="w-8 h-1 bg-black mb-1"></div>
        <div className="w-8 h-1 bg-black mb-1"></div>
        <div className="w-8 h-1 bg-black"></div>
      </div>

      {/* Link navigasi */}
      <div
        className={`${
          menuOpen ? 'flex' : 'hidden'
        } absolute top-16 left-0 w-full flex-col items-center bg-gray-200 border-t-4 border-b-4 border-black md:static md:flex md:flex-row md:space-x-6 md:top-0 md:w-auto md:border-none`}
      >
        <a
          href="/"
          className="text-black font-bold px-4 py-2 border-4 border-black bg-white mt-2 md:mt-0"
        >
          Main Page
        </a>
        <a
          href="/events"
          className="text-black font-bold px-4 py-2 border-4 border-black bg-white mt-2 md:mt-0"
        >
          Event List
        </a>
        {isLoggedIn && (
          <>
            <a
              href="/tickets"
              className="text-black font-bold px-4 py-2 border-4 border-black bg-white mt-2 md:mt-0"
            >
              Ticket
            </a>
            <a
              href="/reviews"
              className="text-black font-bold px-4 py-2 border-4 border-black bg-white mt-2 md:mt-0"
            >
              Review
            </a>
          </>
        )}
        {/* Bagian login/register atau nama pengguna */}
        <div className="md:hidden mt-2">
          {isLoggedIn ? (
            <span className="text-black font-bold px-4 py-2 border-4 border-black bg-white">
              {username}
            </span>
          ) : (
            <a
              href="/login"
              className="text-black font-bold px-4 py-2 border-4 border-black bg-white"
            >
              Login/Register
            </a>
          )}
        </div>
      </div>

      {/* Bagian login/register atau nama pengguna di bagian kanan untuk desktop */}
      <div className="hidden md:block">
        {isLoggedIn ? (
          <span className="text-black font-bold px-4 py-2 border-4 border-black bg-white">
            {username}
          </span>
        ) : (
          <a
            href="/login"
            className="text-black font-bold px-4 py-2 border-4 border-black bg-white"
          >
            Login/Register
          </a>
        )}
      </div>
    </nav>
  );
};

export default NavBar;