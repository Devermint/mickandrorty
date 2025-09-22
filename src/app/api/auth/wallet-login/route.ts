import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const flaskApiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const body = await request.json();

    const response = await fetch(`${flaskApiUrl}/auth/wallet-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Flask API error (${response.status}):`, errorText);
    }

    if (!response.ok) {
      throw new Error(`Flask API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error with wallet login:", error);
    return NextResponse.json(
      { error: "Failed to process wallet login" },
      { status: 500 }
    );
  }
}
