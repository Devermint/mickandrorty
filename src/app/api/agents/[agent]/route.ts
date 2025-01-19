import { NextRequest } from "next/server";
import { testingAgents } from "../../data";

export async function GET(req: NextRequest, { params }: { params: Promise<{ agent: number }>  }): Promise<Response> {
    const { agent } = await params;
    const agentObject = testingAgents.find((a) => {
        return a.id == agent;
    });

    if (!agentObject) {
        return new Response("Agent not found", { status: 404 });
    }

    return Response.json(agentObject);
}
