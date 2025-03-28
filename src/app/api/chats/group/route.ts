import { NextRequest } from "next/server";
import {  testingAgentGroupMap } from "@/app/api/data";

export async function POST(req: NextRequest): Promise<Response> {
    const reqData = await req.json();


    if (reqData === undefined) {
        return new Response("Bad request", { status: 400 });
    }

    const agentId = testingAgentGroupMap[reqData.group];

    // TODO: Group chat id
    return fetch(`https://sui-cluster.xyz/agents/${agentId}/message`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: reqData.message,
                userId: reqData.userId,
                roomId: reqData.roomId,
                userName: reqData.userId,
            }),
        }
    )
}
