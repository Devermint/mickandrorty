import { testingAgents } from "../data";

export async function GET(): Promise<Response> {
    return Response.json(testingAgents);
}
