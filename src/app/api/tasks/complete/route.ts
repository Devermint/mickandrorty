import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const authToken = request.headers.get("x-access-token");
  if (!authToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': authToken,
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json({ message: data.message || 'An error occurred' }, { status: backendResponse.status });
    }

    // *** THIS IS THE REQUIRED FIX ***
    // 1. Create a response to send back to the client
    const response = NextResponse.json(data);

    // 2. Get the Set-Cookie header from the Python backend's response
    const sessionCookie = backendResponse.headers.get('Set-Cookie');

    // 3. If the cookie exists, forward it to the client's browser
    if (sessionCookie) {
      response.headers.set('Set-Cookie', sessionCookie);
    }

    return response;

  } catch (error) {
    console.error('Error proxying to backend:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}