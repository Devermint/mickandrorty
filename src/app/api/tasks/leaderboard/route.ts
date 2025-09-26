import { NextRequest, NextResponse } from "next/server";
import {
  LeaderboardResponse,
  isLeaderboardResponse,
} from "@/app/types/leaderboard";

export async function GET(request: NextRequest) {
  const authToken = request.headers.get("x-access-token");
  if (!authToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/tasks/leaderboard`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": authToken,
        },
      }
    );

    const payload: unknown = await backendResponse.json();

    if (
      payload &&
      typeof payload === "object" &&
      "weekly" in payload &&
      "monthly" in payload &&
      !("all_time" in payload)
    ) {
      const payloadRecord = payload as Record<string, unknown>;
      payloadRecord["all_time"] = payloadRecord["monthly"];
      delete payloadRecord["monthly"];
    }

    if (!backendResponse.ok) {
      const message =
        typeof payload === "object" && payload !== null && "message" in payload
          ? String(
              (payload as { message?: unknown }).message ?? "An error occurred"
            )
          : "An error occurred";

      return NextResponse.json({ message }, { status: backendResponse.status });
    }

    console.log(payload);
    if (!isLeaderboardResponse(payload)) {
      return NextResponse.json(
        { message: "Invalid leaderboard payload" },
        { status: 502 }
      );
    }

    return NextResponse.json<LeaderboardResponse>(payload);
  } catch (error) {
    console.error("Error proxying to backend:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
