import { NextResponse } from "next/server";

type PlaceBetPayload = {
  market_id?: string;
  side?: string;
  amount?: number;
};

const parseJson = (text: string): unknown => {
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export async function POST(request: Request) {
  let payload: PlaceBetPayload;
  try {
    payload = (await request.json()) as PlaceBetPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const marketId = payload.market_id;
  const side = (payload.side || "").toLowerCase();
  const amount = Number(payload.amount ?? 0);

  if (!marketId || (side !== "yes" && side !== "no") || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "market_id, side ('yes'|'no'), and amount (>0) are required",
      },
      { status: 400 }
    );
  }

  const authHeader = request.headers.get("auth");
  if (!authHeader) {
    return NextResponse.json(
      { ok: false, message: "Auth header missing" },
      { status: 401 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const endpoint = `${baseUrl.replace(/\/$/, "")}/bets`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Auth: authHeader,
      },
      body: JSON.stringify({
        market_id: marketId,
        side,
        amount,
      }),
    });

    const rawBody = await response.text();
    const parsedBody = parseJson(rawBody);

    if (!response.ok) {
      const status = response.status >= 500 ? 502 : response.status;
      return NextResponse.json(
        { ok: false, message: "Failed to place bet" },
        { status }
      );
    }

    return NextResponse.json(
      typeof parsedBody === "object" && parsedBody !== null
        ? parsedBody
        : { ok: true }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Unable to reach bet service" },
      { status: 502 }
    );
  }
}
