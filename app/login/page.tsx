"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Controle de Finanças
        </h1>

        <h2 className="text-lg text-center text-gray-500 mb-8">
          Acesse sua conta
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Seu e-mail"
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-blue-600 text-white p-3 rounded-xl text-lg font-semibold shadow-md hover:bg-blue-700 transition">
            Entrar
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-gray-500">Não tem conta?</p>
          <button
            onClick={() => router.push("/register")}
            className="mt-2 inline-block bg-gray-900 text-white px-5 py-2 rounded-xl shadow hover:bg-black transition font-medium"
          >
            Criar conta
          </button>
        </div>
      </div>
    </div>
  );
}
