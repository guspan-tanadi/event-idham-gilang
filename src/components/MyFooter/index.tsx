"use client";
import React from "react";
import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

function MyFooter() {
  return (
    <footer className="absolute bottom-0 left-0 w-full border-t-4 border-black bg-blue-500 p-4 text-white shadow-lg">
      <div className="container mx-auto flex flex-col items-center justify-between text-center md:flex-row md:text-left">
        {/* Left Section - Logo and Description */}
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-extrabold">MyLogo</h1>
          <p className="mt-2 text-sm">
            Neo-Brutalism inspired web design, bold and functional.
          </p>
        </div>

        {/* Center Section - Navigation Links */}
        <div className="flex flex-col gap-4 font-semibold md:flex-row">
          <Link href="/about">About Us</Link>
          <Link href="/services">Services</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </div>

        {/* Right Section - Social Media Icons */}
        <div className="mt-4 flex gap-4 md:mt-0">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:text-yellow-400"
          >
            <FaFacebook size={24} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:text-yellow-400"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-yellow-400"
          >
            <FaInstagram size={24} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-yellow-400"
          >
            <FaLinkedin size={24} />
          </a>
        </div>
      </div>

      {/* Bottom Section - Copyright */}
      <div className="mt-4 border-t-2 border-black pt-4 text-center text-sm font-semibold">
        © {new Date().getFullYear()} Team1-Idham-Gilang-Guspan. All rights
        reserved.
      </div>
    </footer>
  );
}

export default MyFooter;
