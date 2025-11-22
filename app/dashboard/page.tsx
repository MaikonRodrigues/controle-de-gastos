import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

import {
  getDashboardData,
  DashboardData,
  DashboardAccount,
  DashboardCard,
} from "./getDashboardData";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const data: DashboardData = await getDashboardData(Number(session.user.id));

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">

      {/* ===== SIDEBAR ===== */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-800 p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-10">Finanças</h1>

        <nav className="space-y-3">
          <SidebarLink label="Dashboard" href="/dashboard" icon="📊" />
          <SidebarLink label="Novo Deposito" href="/nova-entrada" icon="➕" />
          <SidebarLink label="Novo Gasto" href="/nova-saida" icon="➕" />
          <SidebarLink label="Contas" href="/contas" icon="🏦" />
          <SidebarLink label="Cartões" href="/cartoes" icon="💳" />
          <SidebarLink label="Recorrentes" href="/recorrentes" icon="🔁" />
          <SidebarLink label="Categorias" href="/categorias" icon="🏷️" /> {/* ✅ novo */}
        </nav>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Visão Geral</h1>

          {/* MENU DE AÇÕES RÁPIDAS */}
          <div className="relative">
            <details className="group">
              <summary className="flex items-center gap-2 px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer select-none shadow">
                ⚡ Ações Rápidas
                <span className="ml-1 text-sm text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="absolute z-10 mt-2 w-52 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-2 space-y-2 right-0">
                <DropdownLink href="/nova-entrada" icon="➕" label="Novo Deposito" color="text-green-400" />
                <DropdownLink href="/nova-saida" icon="➕" label="Novo Gasto" color="text-red-400" />
                <DropdownLink href="/contas" icon="🏦" label="Contas" color="text-blue-400" />
                <DropdownLink href="/cartoes" icon="💳" label="Cartões" color="text-purple-400" />
                <DropdownLink href="/recorrentes" icon="🔁" label="Recorrentes" color="text-purple-400" />
                <DropdownLink href="/categorias" icon="🏷️" label="Categorias" color="text-yellow-400" />
              </div>
            </details>
          </div>
        </div>

        {/* ===== GRID 4x4 ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card title="Saldo Geral" value={data.saldoGeral} color="blue" icon="💰" />
          <Card title="Saldo em Contas" value={data.totalEmContas} color="green" icon="🏦" />
          <Card title="Faturas (Mês)" value={data.totalFaturas} color="red" icon="💳" />
          <Card title="Recorrentes" value={data.totalRecorrentes} color="yellow" icon="🔁" />
        </div>

        {/* ===== CONTAS ===== */}
        <Section title="Contas" icon="🏦">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.accounts.map((acc: DashboardAccount) => (
              <div key={acc.id} className="p-5 bg-gray-800 rounded-xl shadow border border-gray-700">
                <h2 className="text-lg font-bold">{acc.name}</h2>
                <p className="text-2xl font-bold text-green-400 mt-3">
                  {acc.saldo.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ===== CARTÕES ===== */}
        <Section title="Cartões" icon="💳">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.cards.map((card: DashboardCard) => (
              <div key={card.id} className="p-5 bg-gray-800 rounded-xl shadow border border-gray-700">
                <h2 className="text-lg font-bold">{card.name}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Limite:{" "}
                  {card.limit.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
                <p className="text-2xl font-bold text-red-400 mt-3">
                  {card.fatura.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
            ))}
          </div>
        </Section>
       
        {/* ===== RECORRENTES ===== */}
        <Section title="Gastos Recorrentes" icon="🔁">
          <div className="space-y-3">
            {data.recurring.map((r: any) => {
              const parcelaAtual = getParcelaAtual(r);

              return (
                <div
                  key={r.id}
                  className="p-4 bg-gray-800 rounded-xl shadow border border-gray-700 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold">{r.title}</p>

                    {/* Tipo de destino */}
                    <p className="text-gray-500 text-sm mt-1">
                      {r.cardId
                        ? `Cartão`
                        : r.accountId
                          ? `Conta`
                          : "Geral"}
                    </p>

                    {/* Parcelas */}
                    <p className="text-gray-400 text-sm mt-1">
                      {r.recurrenceMode === "infinite" && "Todo mês"}

                      {r.recurrenceMode === "installments" &&
                        `Parcela ${parcelaAtual} / ${r.installments}`}
                    </p>
                  </div>

                  {/* Valor */}
                  <span className="font-bold text-yellow-400 text-lg">
                    {r.amount.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>

      </main>
    </div>
  );
}

/* =====================================================================
   COMPONENTES GLOBAIS
===================================================================== */

function SidebarLink({ label, href, icon }: any) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
    >
      <span>{icon}</span> {label}
    </a>
  );
}

function DropdownLink({
  href,
  icon,
  label,
  color = "text-white",
}: {
  href: string;
  icon: string;
  label: string;
  color?: string;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition ${color}`}
    >
      <span>{icon}</span> {label}
    </a>
  );
}

function Card({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: "blue" | "green" | "red" | "yellow";
  icon: string;
}) {
  const colors: any = {
    blue: "text-blue-400 border-blue-400",
    green: "text-green-400 border-green-400",
    red: "text-red-400 border-red-400",
    yellow: "text-yellow-400 border-yellow-400",
  };

  return (
    <div className={`bg-gray-800 p-6 rounded-xl shadow border ${colors[color]}`}>
      <h3 className="text-gray-400 font-medium flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <p className="text-3xl font-bold mt-3">
        {value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>
    </div>
  );
}

function getParcelaAtual(r: any) {
  if (r.recurrenceMode === "infinite") return null;

  const start = new Date(r.startDate);
  const now = new Date();

  const diff =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth()) +
    1;

  if (diff < 1) return 1;
  if (diff > r.installments) return r.installments;

  return diff;
}


function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: any;
}) {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}
