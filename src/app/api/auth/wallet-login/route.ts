import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/wallet-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const text = await backendResponse.text();

    try {
      const data = JSON.parse(text);
      if (!backendResponse.ok) {
        return NextResponse.json({ message: data.message || 'An error occurred' }, { status: backendResponse.status });
      }
      return NextResponse.json(data);
    } catch (e) {
      return new NextResponse(text, { status: backendResponse.status });
    }
  } catch (error) {
    console.error('Error proxying to backend:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
