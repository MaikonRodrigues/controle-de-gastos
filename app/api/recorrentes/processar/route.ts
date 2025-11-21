// app/api/recorrentes/processar/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { processarRecorrencias } from "../../../utils/processarRecorrencias";


export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await processarRecorrencias(Number(session.user.id));
  return NextResponse.json({ status: "OK" });
}
