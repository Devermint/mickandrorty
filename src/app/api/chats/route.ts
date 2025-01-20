import { testingGroupChats } from "@/app/api/data";
import { NextRequest } from "next/server";

export async function GET(): Promise<Response> {
    return Response.json(testingGroupChats);
}
