import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await context.params;
  const normalizedId = agentId?.trim();

  if (!normalizedId) {
    return NextResponse.json(
      { error: "agentId is required" },
      { status: 400 }
    );
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  try {
    const backendResponse = await fetch(
      `${BACKEND_BASE_URL}/agents/${encodeURIComponent(normalizedId)}`,
      {
        method: "PATCH",
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
    console.error("Agent update proxy failed", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}
