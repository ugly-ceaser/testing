"use client";
import { useState } from "react";

export default function AdminRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    wallet: "",
    secret: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Admin registered successfully.");
        setForm({ name: "", email: "", password: "", wallet: "", secret: "" });
      } else {
        setMessage(data?.error || "Registration failed.");
      }
    } catch (err) {
      setMessage("An error occurred. Please try again.");
    }
    setLoading(false);
  };
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Admin Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="wallet"
          placeholder="Wallet Address"
          value={form.wallet}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="secret"
          placeholder="Admin Secret"
          value={form.secret}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register Admin"}
        </button>
      </form>
      {message && (
        <div className="mt-4 text-center text-sm text-red-600">{message}</div>
      )}
    </div>
  );
}
