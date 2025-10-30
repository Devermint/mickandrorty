import { NextResponse } from "next/server";
import type { MarketsResponse } from "@/app/types/market";

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

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const endpoint = `${baseUrl.replace(/\/$/, "")}/markets`;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    const rawBody = await response.text();
    const parsedBody = parseJson(rawBody);

    if (!response.ok) {
      const status = response.status >= 500 ? 502 : response.status;
      return NextResponse.json({ message: "Failed to fetch markets" }, { status });
    }

    return NextResponse.json(parsedBody as MarketsResponse);
  } catch (error) {
    console.error("Error fetching markets:", error);

    const isNetworkError = error instanceof TypeError;
    const status = isNetworkError ? 502 : 500;

    return NextResponse.json({ message: "Unable to retrieve markets" }, { status });
  }
}
