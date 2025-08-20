import { Agent } from "@/app/types/agent";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const flaskApiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const response = await fetch(`${flaskApiUrl}/all-agents`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Flask API responded with status: ${response.status}`);
    }

    const agents: Agent[] = await response.json();

    return NextResponse.json(agents, { status: 200 });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}
