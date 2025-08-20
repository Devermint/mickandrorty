import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { txHash } = body;

    const response = await fetch(
      `${process.env.BACKEND_BASE_URL}/create-agent-from-tx`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_hash: txHash,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`Backend error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Agent finalize error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Failed to finalize agent", details: errorMessage },
      { status: 500 }
    );
  }
}
