// register.tsx
"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { z } from "zod";

// Import the schema and type
import { registerSchema, RegisterFormData } from "../../../schema/userSchema";

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    password: "",
    email: "",
    fullname: "",
  });
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear the error message for the current field
    setFormErrors({
      ...formErrors,
      [e.target.name]: "",
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate form data using Zod schema imported from userSchema.ts
      const validatedData = registerSchema.parse(formData);

      console.log("Registering:", validatedData);

      const dataToSend = {
        ...validatedData,
        role: "USER",
      };

      await axios.post("api/auth/register", dataToSend);
      // After successful registration, redirect to "/login"
      router.push("/auth/login");
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Map Zod errors to form field errors
        const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
        error.errors.forEach((err) => {
          const fieldName = err.path[0] as keyof RegisterFormData;
          fieldErrors[fieldName] = err.message;
        });
        setFormErrors(fieldErrors);
      } else {
        console.error("Unexpected error:", error);
        // Handle unexpected errors appropriately
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-yellow-200 via-red-200 to-pink-200">
      {/* Left Side with Content */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Join Us Today!
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Create an account to enjoy all the features of our platform.
          </p>
          {/* Add any illustrative image if needed */}
        </div>
      </div>

      {/* Right Side with Register Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="bg-white border-4 border-black shadow-2xl p-6 max-w-sm w-full text-center transform hover:-translate-y-2 transition-transform duration-300">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            Register
          </h1>
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label
                htmlFor="fullname"
                className="block text-lg font-bold text-black"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                className={`w-full mt-2 p-2 border-2 ${
                  formErrors.fullname ? "border-red-500" : "border-black"
                } bg-gray-100 text-gray-900 shadow-xl transform hover:-translate-y-1 transition-transform duration-300`}
              />
              {formErrors.fullname && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.fullname}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-lg font-bold text-black"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full mt-2 p-2 border-2 ${
                  formErrors.username ? "border-red-500" : "border-black"
                } bg-gray-100 text-gray-900 shadow-xl transform hover:-translate-y-1 transition-transform duration-300`}
              />
              {formErrors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.username}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-lg font-bold text-black"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full mt-2 p-2 border-2 ${
                  formErrors.email ? "border-red-500" : "border-black"
                } bg-gray-100 text-gray-900 shadow-xl transform hover:-translate-y-1 transition-transform duration-300`}
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-lg font-bold text-black"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full mt-2 p-2 border-2 ${
                  formErrors.password ? "border-red-500" : "border-black"
                } bg-gray-100 text-gray-900 shadow-xl transform hover:-translate-y-1 transition-transform duration-300`}
              />
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gray-900 text-white font-bold border-2 border-black shadow-xl transform hover:-translate-y-1 transition-transform duration-300"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;