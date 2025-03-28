import { testingChats } from "@/app/api/data";

export async function GET(): Promise<Response> {

    const chats = [...testingChats]
    chats[0].sender = "Mick Zanches";

    return Response.json(chats);
}
