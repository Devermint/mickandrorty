import { NextRequest } from "next/server";
import {  testingAgentGroupMap, testingChats } from "@/app/api/data";
import { redirect } from "next/dist/server/api-utils";

export async function POST(req: NextRequest): Promise<Response> {
    const reqData = await req.json();

    console.log(reqData);

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
