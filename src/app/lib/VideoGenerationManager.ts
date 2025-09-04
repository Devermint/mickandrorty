// VideoGenerationManager.ts - Global singleton for managing video generation EventSources

type VideoProgressCallback = (jobId: string, content: string, type: string, progress?: string) => void;

class VideoGenerationManager {
  private static instance: VideoGenerationManager;
  private activeJobs = new Set<string>();
  private eventSources = new Map<string, EventSource>();
  private callbacks = new Map<string, Set<VideoProgressCallback>>();

  private constructor() {}

  static getInstance(): VideoGenerationManager {
    if (!VideoGenerationManager.instance) {
      VideoGenerationManager.instance = new VideoGenerationManager();
    }
    return VideoGenerationManager.instance;
  }

  startVideoGeneration(jobId: string, onProgress: VideoProgressCallback): void {
    // Add callback for this job
    if (!this.callbacks.has(jobId)) {
      this.callbacks.set(jobId, new Set());
    }
    this.callbacks.get(jobId)!.add(onProgress);

    // If already running, just add the callback and return
    if (this.activeJobs.has(jobId)) {
      return;
    }

    // Start new EventSource
    this.activeJobs.add(jobId);
    const es = new EventSource(`/api/generate-video?id=${jobId}`);
    this.eventSources.set(jobId, es);

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const callbacks = this.callbacks.get(jobId);
      
      if (!callbacks) return;

      switch (data.status) {
        case "IN_QUEUE":
          callbacks.forEach(cb => cb(jobId, "Video is in queue...", "text"));
          break;
        case "IN_PROGRESS":
          callbacks.forEach(cb => cb(jobId, "Video generation in progress...", "video-loader", data.progress));
          break;
        case "COMPLETED":
          callbacks.forEach(cb => cb(jobId, data.videoUrl, "video"));
          this.cleanup(jobId);
          break;
      }
    };

    es.onerror = (e) => {
      console.error("Video generation error:", e);
      const callbacks = this.callbacks.get(jobId);
      if (callbacks) {
        callbacks.forEach(cb => cb(jobId, "Video generation failed", "error"));
      }
      this.cleanup(jobId);
    };
  }

  stopVideoGeneration(jobId: string, callback: VideoProgressCallback): void {
    const callbacks = this.callbacks.get(jobId);
    if (callbacks) {
      callbacks.delete(callback);
      
      // If no more callbacks, cleanup the EventSource
      if (callbacks.size === 0) {
        this.cleanup(jobId);
      }
    }
  }

  private cleanup(jobId: string): void {
    const es = this.eventSources.get(jobId);
    if (es) {
      es.close();
      this.eventSources.delete(jobId);
    }
    
    this.activeJobs.delete(jobId);
    this.callbacks.delete(jobId);
  }
}

export default VideoGenerationManager;