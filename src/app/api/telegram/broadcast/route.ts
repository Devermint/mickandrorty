import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TELEGRAM_BROADCAST_PATH = "/telegram/broadcast";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${BACKEND_BASE_URL}${TELEGRAM_BROADCAST_PATH}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const contentType =
      backendResponse.headers.get("content-type") ?? "application/json";
    const text = await backendResponse.text();

    return new NextResponse(text, {
      status: backendResponse.status,
      headers: { "content-type": contentType },
    });
  } catch (error) {
    console.error("Telegram broadcast proxy failed", error);
    return NextResponse.json(
      { error: "Failed to broadcast telegram post" },
      { status: 500 }
    );
  }
}
