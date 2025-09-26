import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-access-token");
  const body = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/telegram/callback`;
    console.log("Backend URL:", backendUrl);
    const backendResponse = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      body: JSON.stringify(body),
    });

    const responseText = await backendResponse.text();
    console.log("Backend response status:", backendResponse.status);
    console.log("Backend response text:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse backend response as JSON:", parseError);
      console.error("Response was:", responseText);
      return NextResponse.json(
        { error: "Invalid response from backend" },
        { status: 502 }
      );
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: data.message || "Backend error" },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying to backend:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
