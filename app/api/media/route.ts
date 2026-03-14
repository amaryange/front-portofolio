import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

async function getToken(): Promise<string | null> {
  const store = await cookies();
  const t = store.get("admin_token")?.value;
  return t && t !== "dev-token" ? t : null;
}

/** POST /api/media — proxie l'upload vers AdonisJS */
export async function POST(req: NextRequest) {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Passer le body brut pour préserver les types MIME du multipart
  const upstream = await fetch(`${API}/api/v1/admin/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": req.headers.get("content-type") ?? "",
    },
    body: req.body,
    duplex: "half",
  } as RequestInit);

  const body = await upstream.json();
  return NextResponse.json(body, { status: upstream.status });
}
