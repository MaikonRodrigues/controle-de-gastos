import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Se NÃO estiver logado → redireciona para login
  if (!session) {
    redirect("/login");
  }

  // Se estiver logado → redireciona para dashboard
  redirect("/dashboard");
}
