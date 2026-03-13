import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

async function getToken(): Promise<string | null> {
  const store = await cookies();
  const t = store.get("admin_token")?.value;
  return t && t !== "dev-token" ? t : null;
}

/** DELETE /api/media/:filename — proxie la suppression vers AdonisJS */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { filename } = await params;

  const upstream = await fetch(`${API}/api/v1/admin/media/${filename}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (upstream.status === 204) return new NextResponse(null, { status: 204 });

  const body = await upstream.json();
  return NextResponse.json(body, { status: upstream.status });
}
