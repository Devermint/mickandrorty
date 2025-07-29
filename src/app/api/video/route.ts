import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "Missing `url` query parameter" },
      { status: 400 }
    );
  }

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json(
      { error: `Upstream fetch failed: ${res.statusText}` },
      { status: 502 }
    );
  }

  const contentType =
    res.headers.get("content-type") || "application/octet-stream";
  const dispositionName = url.split("/").pop() || "download";
  const arrayBuffer = await res.arrayBuffer();

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${dispositionName}"`,
      "Access-Control-Allow-Origin": "*",
    },
  });
}
