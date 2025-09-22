import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authToken = request.headers.get("x-access-token");
  if (!authToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendResponse = await fetch(`${process.env.FLASK_BACKEND_URL}/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': authToken,
      },
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json({ message: data.message || 'An error occurred' }, { status: backendResponse.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to backend:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
