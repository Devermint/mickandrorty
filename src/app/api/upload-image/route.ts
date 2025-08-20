import { NextResponse } from "next/server";

const MAX_BYTES = 5_000_000;
const MIME_OK = new Set(["image/jpeg", "image/png", "image/webp"]);

function ensureFilenameWithExt(file: File): string {
  const name = (file as any).name as string | undefined;
  if (name && name.includes(".")) return name;

  const ext =
    file.type === "image/png"
      ? ".png"
      : file.type === "image/webp"
      ? ".webp"
      : ".jpg";
  return `upload${ext}`;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }
    if (!MIME_OK.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported content-type: ${file.type}` },
        { status: 415 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large (>${MAX_BYTES} bytes)` },
        { status: 413 }
      );
    }

    const filename = ensureFilenameWithExt(file);

    const ab = await file.arrayBuffer();
    const blob = new Blob([ab], { type: file.type });
    const outgoing = new FormData();
    outgoing.append("file", blob, filename);

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/upload`;

    const resp = await fetch(backendUrl, {
      method: "POST",
      body: outgoing,
    });

    const ct = resp.headers.get("content-type") ?? "application/json";
    const text = await resp.text();
    console.log(text);
    return new NextResponse(text, {
      status: resp.status,
      headers: { "content-type": ct },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Upload failed" },
      { status: 500 }
    );
  }
}
