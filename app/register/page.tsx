"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: any) {
    e.preventDefault();

    await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-300">
        
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-900">
          Criar Conta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            placeholder="Seu nome"
            className="w-full border border-gray-400 p-3 rounded-xl 
                       text-gray-900 placeholder-gray-600 
                       focus:ring-2 focus:ring-green-600 transition"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Seu e-mail"
            className="w-full border border-gray-400 p-3 rounded-xl 
                       text-gray-900 placeholder-gray-600
                       focus:ring-2 focus:ring-green-600 transition"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full border border-gray-400 p-3 rounded-xl 
                       text-gray-900 placeholder-gray-600 
                       focus:ring-2 focus:ring-green-600 transition"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-green-600 text-white p-3 rounded-xl text-lg font-semibold shadow hover:bg-green-700 transition">
            Registrar
          </button>
        </form>

        <div className="text-center mt-8">
          <button
            onClick={() => router.push("/login")}
            className="text-gray-700 underline hover:text-black transition font-medium"
          >
            Já tenho uma conta
          </button>
        </div>
      </div>
    </div>
  );
}
