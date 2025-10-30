import { NextResponse } from "next/server";
import type { MarketsResponse } from "@/app/types/market";

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

export async function GET(_: Request, context: RouteParams) {
  const { faId } = await context.params;

  if (!faId) {
    return NextResponse.json(
      { message: "Agent id is required" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const endpoint = `${baseUrl.replace(/\/$/, "")}/markets/fa/${encodeURIComponent(
    faId
  )}`;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    const rawBody = await response.text();
    const parsedBody = parseJson(rawBody);

    if (!response.ok) {
      const status = response.status >= 500 ? 502 : response.status;
      return NextResponse.json(
        { message: "Failed to fetch markets" },
        { status }
      );
    }

    return NextResponse.json(parsedBody as MarketsResponse);
  } catch (error) {
    console.error("Error fetching markets for agent:", error);
    return NextResponse.json(
      { message: "Unable to retrieve markets" },
      { status: 502 }
    );
  }
}
