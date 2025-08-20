import { NextRequest, NextResponse } from "next/server";
import type { Agent } from "@/app/types/agent";

export async function GET(
    _req: NextRequest,
    ctx: { params: Promise<{ faId: string }> }
) {
    const { faId } = await ctx.params;
    const id = faId?.trim();

    if (!id) {
        return NextResponse.json({ error: "faId is required" }, { status: 400 });
    }

    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const url = `${base}/agent?fa_id=${encodeURIComponent(id)}`;

    const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        return NextResponse.json(
            { error: `Backend responded with ${res.status}` },
            { status: res.status }
        );
    }

    const agent: Agent = await res.json();
    return NextResponse.json(agent, { status: 200 });
}
