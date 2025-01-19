import { NextRequest } from "next/server";
import { testingAgents } from "../data";

export async function GET(req: NextRequest): Promise<Response> {
    return Response.json(testingAgents);
}
