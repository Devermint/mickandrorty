import { NextRequest, NextResponse } from "next/server";
import { fal, QueueStatus } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!process.env.FAL_API_KEY) {
      return NextResponse.json(
        { error: "FAL API key is not configured" },
        { status: 500 }
      );
    }
    if (!prompt)
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );

    const job = await fal.queue.submit("fal-ai/hunyuan-video", {
      input: {
        prompt,
        aspect_ratio: "16:9",
        resolution: "720p",
        num_frames: "129",
        num_inference_steps: 30,
      },
    });

    return NextResponse.json({ jobId: job.request_id });
  } catch (error) {
    console.error("Video generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate video" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("id");
  if (!jobId) return new Response("Missing jobId", { status: 400 });

  const handle = await fal.queue.streamStatus("fal-ai/hunyuan-video", {
    requestId: jobId,
    logs: true,
  });

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const safeEnqueue = (obj: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)
          );
        } catch {
          closed = true;
        }
      };

      const cleanup = () => {
        if (closed) return;
        closed = true;
        try {
          // @ts-ignore fal handle may support remove/close; guard both
          handle?.off?.("data", onData);
          // @ts-ignore
          handle?.close?.();
        } catch {}
        try {
          controller.close();
        } catch {}
      };

      const onData = (status: QueueStatus) => {
        if (closed) return;
        if (status.status !== "IN_PROGRESS") return;
        const logs = status.logs ?? [];
        if (logs.length > 0) {
          // last log as progress
          safeEnqueue({
            status: "IN_PROGRESS",
            requestId: jobId,
            progress: logs[logs.length - 1].message,
          });
        }
      };

      // Subscribe to updates
      handle.on("data", onData);

      // Abort handling (client disconnected / route change / Fast Refresh)
      const onAbort = () => cleanup();
      request.signal.addEventListener("abort", onAbort);

      try {
        // Wait for job to finish
        await handle.done();

        if (!closed) {
          const result = await fal.queue.result("fal-ai/hunyuan-video", {
            requestId: jobId,
          });
          safeEnqueue({
            status: "COMPLETED",
            requestId: jobId,
            videoUrl: result.data.video?.url,
          });
        }
      } catch (e) {
        if (!closed) {
          safeEnqueue({
            status: "ERROR",
            requestId: jobId,
            error: "stream failed",
          });
        }
      } finally {
        cleanup();
      }
    },
    cancel() {
      closed = true;
      // @ts-ignore
      handle?.off?.("data", onData);
      // @ts-ignore
      handle?.close?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
