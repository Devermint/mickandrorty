import { testingGroupChats } from "@/app/api/data";

export async function GET(): Promise<Response> {
    return Response.json(testingGroupChats);
}
