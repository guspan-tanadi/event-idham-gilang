"use client";
import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Added loading state

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    console.log("Login Attempt:", { email, password });
    setLoading(true); // Start loading

    try {
      const response = await axios.post("api/auth/login", {
        email,
        password,
      });
      console.log("Response:", response);

      const { access_token: accessToken, user } = response.data.data;
      const role = user.role;

      // Store tokens and user info in cookies
      Cookies.set("access_token", accessToken, { expires: 1 / 24, path: "/" });
      Cookies.set("user_info", JSON.stringify(user), { expires: 1 / 24, path: "/" });

      console.log("User Role:", role);
      if (role === "USER") {
        await router.push("/?redirected=true")
      } else if (role === "ADMIN") {
        router.push("/admin");
      } else {
        console.error("Unknown role:", role);
      }
    } catch (error) {
      // Handle different error responses
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 500) {
          setErrorMessage("Server error (500). Please try again later.");
        } else if (error.response.status === 503) {
          setErrorMessage("Service unavailable (503). Please try again later.");
        } else if (error.response.status === 401) {
          setErrorMessage("Invalid email or password.");
        } else {
          setErrorMessage("An error occurred. Please try again.");
        }
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
      console.error("Error logging in:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-yellow-200 via-red-200 to-pink-200">
      {/* Left Side with Login Component */}
      <div className="flex w-full md:w-1/2 flex-col items-center justify-center p-6">
        {loading ? (
          // Loading Indicator
          <div className="w-full max-w-sm text-center">
            <div className="loader mb-4"></div>
            <p className="text-lg font-bold text-gray-900">Logging in, please wait...</p>
          </div>
        ) : (
          // Login Form
          <>
            <div className="w-full max-w-sm transform border-4 border-black bg-white p-6 text-center shadow-2xl transition-transform duration-300 hover:-translate-y-2">
              <h1 className="mb-4 text-3xl font-extrabold text-gray-900">Login</h1>
              {errorMessage && (
                <p className="mb-4 text-sm text-red-600">{errorMessage}</p>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-lg font-bold text-black">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full transform border-2 border-black bg-gray-100 p-2 text-gray-900 shadow-xl transition-transform duration-300 hover:-translate-y-1"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-lg font-bold text-black">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 w-full transform border-2 border-black bg-gray-100 p-2 text-gray-900 shadow-xl transition-transform duration-300 hover:-translate-y-1"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full transform border-2 border-black bg-gray-900 py-2 font-bold text-white shadow-xl transition-transform duration-300 hover:-translate-y-1"
                  disabled={loading} // Disable button when loading
                >
                  Login
                </button>
              </form>
            </div>
            <div>
              <h2 className="p-5 text-center font-extrabold text-black">
                DON&apos;T HAVE AN ACCOUNT?{" "}
                <a className="text-blue-600" href="/auth/register">
                  SIGN UP NOW!
                </a>
              </h2>
            </div>
          </>
        )}
      </div>
      {/* Right Side with Welcome Message */}
      <div className="hidden md:flex w-1/2 items-center justify-center p-6">
        <div className="px-6 text-center">
          <h2 className="mb-4 text-4xl font-extrabold text-gray-900">Welcome Back!</h2>
          <p className="mb-6 text-lg text-gray-700">Access your account and explore your event.</p>
        </div>
      </div>
    </div>
  );
}

export default Page;