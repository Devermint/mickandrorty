import { NextRequest, NextResponse } from "next/server";
import { fal, QueueStatus } from "@fal-ai/client";

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!process.env.FAL_API_KEY) {
      return NextResponse.json(
        { error: "FAL API key is not configured" },
        { status: 500 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const job = await fal.queue.submit("fal-ai/hunyuan-video", {
      input: {
        prompt: prompt,
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

  if (!jobId) {
    return new Response("Missing jobId", { status: 400 });
  }

  const handle = await fal.queue.streamStatus("fal-ai/hunyuan-video", {
    requestId: jobId,
    logs: true,
  });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      handle.on("data", async (status: QueueStatus) => {
        if (status.status !== "IN_PROGRESS") {
          return;
        }
        const logs = status.logs ?? [];

        if (logs.length > 0) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                status: status.status,
                requestId: jobId,
                progress: logs[logs.length - 1].message,
              })}\n\n`
            )
          );
        }
      });

      await handle.done();

      const result = await fal.queue.result("fal-ai/hunyuan-video", {
        requestId: jobId,
      });

      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            status: "COMPLETED",
            requestId: jobId,
            videoUrl: result.data.video?.url,
          })}\n\n`
        )
      );

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
