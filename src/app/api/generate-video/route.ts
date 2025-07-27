import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!process.env.FAL_API_KEY) {
      return NextResponse.json(
        { error: 'FAL API key is not configured' },
        { status: 500 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Submit video generation request to fal.ai
    const result = await fal.subscribe('fal-ai/hunyuan-video', {
      input: {
        prompt: prompt,
        aspect_ratio: '16:9',
        resolution: '720p',
        num_frames: '129',
        num_inference_steps: 30,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log('Queue update:', update);
      },
    });

    console.log('Video generation result:', result);

    return NextResponse.json({
      success: true,
      data: result,
      videoUrl: result.data?.video?.url,
    });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    if (!process.env.FAL_API_KEY) {
      return NextResponse.json(
        { error: 'FAL API key is not configured' },
        { status: 500 }
      );
    }

    // Check the status of the video generation request
    const status = await fal.queue.status('fal-ai/hunyuan-video', {
      requestId: requestId,
    });

    return NextResponse.json({
      success: true,
      status: status.status,
      data: status,
    });
  } catch (error) {
    console.error('Video status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check video status' },
      { status: 500 }
    );
  }
}
