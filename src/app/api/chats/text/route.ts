import { NextRequest } from "next/server";

export async function POST(req: NextRequest): Promise<Response> {
    const reqData = await req.json();


    if (reqData === undefined) {
        return new Response("Bad request", { status: 400 });
    }

    return fetch(`https://sui-cluster.xyz/agents/${reqData.agent}/message`,
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
