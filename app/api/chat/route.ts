import { NextRequest, NextResponse } from "next/server";

const EDGE_FUNCTION_URL = process.env.EDGE_FUNCTION_URL!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Edge function error: ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
