import { NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{ faId: string }>;
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

export async function GET(request: Request, context: RouteParams) {
  const { faId } = await context.params;

  if (!faId) {
    return NextResponse.json(
      { ok: false, message: "Agent id is required" },
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
  const endpoint = `${baseUrl.replace(/\/$/, "")}/bets/fa/${encodeURIComponent(
    faId
  )}`;

  try {
    const response = await fetch(endpoint, {
      headers: {
        Auth: authHeader,
      },
    });

    const rawBody = await response.text();
    const parsedBody = parseJson(rawBody);

    if (!response.ok) {
      const status = response.status >= 500 ? 502 : response.status;
      return NextResponse.json(
        { ok: false, message: "Failed to load bets" },
        { status }
      );
    }

    if (Array.isArray(parsedBody)) {
      return NextResponse.json(parsedBody, { status: 200 });
    }

    if (parsedBody && typeof parsedBody === "object") {
      return NextResponse.json(parsedBody, { status: 200 });
    }

    return NextResponse.json([], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: "Unable to reach bet service" },
      { status: 502 }
    );
  }
}
