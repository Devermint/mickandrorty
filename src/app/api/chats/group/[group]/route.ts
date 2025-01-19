import { NextRequest } from "next/server";
import {  testingChats } from "@/app/api/data";

export async function GET(req: NextRequest, { params }: { params: Promise<{ group: number }>  }): Promise<Response> {
    const { group } = await params;
    console.log(group);

    const chats = [...testingChats]
    chats[0].sender = "Mick Zanches";

    return Response.json(chats);
}
