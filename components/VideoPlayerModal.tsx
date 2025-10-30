
import React, { useEffect, useState, useRef, useCallback } from 'react';

interface VideoPlayerModalProps {
  videoUrl: string;
  variantId: string;
  onClose: () => void;
  onSave: (variantId: string, newVideoUrl: string) => void;
  t: any;
}

// Helper to format time from seconds to MM:SS.ms
const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const milliseconds = Math.floor((time % 1) * 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${milliseconds}`;
};

// Client-side video trimming function (video only)
const trimVideo = async (videoUrl: string, startTime: number, endTime: number): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      const video = document.createElement('video');
      video.muted = true;
      video.src = videoUrl;

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Could not get canvas context');

        const stream = canvas.captureStream(30); // 30 FPS
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          video.remove();
          canvas.remove();
          resolve(blob);
        };
        recorder.onerror = (e) => reject(e);
        
        video.currentTime = startTime;

        video.onseeked = () => {
          recorder.start();
          
          let frameCount = 0;
          const totalFrames = (endTime - startTime) * 30; // Approx frames

          const drawFrame = () => {
            if (video.currentTime >= endTime || video.paused) {
              if (recorder.state === 'recording') {
                recorder.stop();
              }
              return;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            frameCount++;
            if (frameCount < totalFrames) {
              requestAnimationFrame(drawFrame);
            } else {
               if (recorder.state === 'recording') {
                recorder.stop();
              }
            }
          };
          
          video.play();
          requestAnimationFrame(drawFrame);
        };
      };
      video.onerror = (e) => reject(`Video load error: ${e}`);
    } catch (e) {
      reject(e);
    }
  });
};


const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ videoUrl, variantId, onClose, onSave, t }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isTrimming, setIsTrimming] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleMetadata = () => {
        setDuration(video.duration);
        setEndTime(video.duration);
      };
      video.addEventListener('loadedmetadata', handleMetadata);
      return () => video.removeEventListener('loadedmetadata', handleMetadata);
    }
  }, [videoUrl]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handlePreview = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = startTime;
    videoRef.current.play();
  };

  useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      
      const checkTime = () => {
          if (video.currentTime >= endTime) {
              video.pause();
          }
      };
      
      video.addEventListener('timeupdate', checkTime);
      return () => video.removeEventListener('timeupdate', checkTime);
  }, [endTime]);

  const handleReset = () => {
    setStartTime(0);
    setEndTime(duration);
  };

  const handleSave = async () => {
    setIsTrimming(true);
    try {
      const trimmedBlob = await trimVideo(videoUrl, startTime, endTime);
      const newUrl = URL.createObjectURL(trimmedBlob);
      onSave(variantId, newUrl);
    } catch (error) {
      console.error("Trimming failed:", error);
      alert("Video trimming failed. Please try again.");
    } finally {
      setIsTrimming(false);
    }
  };
  
  const handleTimelineInteraction = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    handle: 'start' | 'end'
  ) => {
    e.preventDefault();
    const timeline = timelineRef.current;
    if (!timeline) return;

    const rect = timeline.getBoundingClientRect();
    const startX = e.clientX;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const newPercent = (
        (handle === 'start' ? (startTime / duration) * rect.width : (endTime / duration) * rect.width) + dx
      ) / rect.width;

      const newTime = Math.max(0, Math.min(duration, newPercent * duration));
      
      if (handle === 'start' && newTime < endTime) {
        setStartTime(newTime);
      } else if (handle === 'end' && newTime > startTime) {
        setEndTime(newTime);
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const startPercent = (startTime / duration) * 100;
  const endPercent = (endTime / duration) * 100;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <div
        className="bg-brand-surface rounded-xl border border-brand-muted w-full max-w-3xl transform transition-all shadow-2xl scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'scale-in 0.2s forwards' }}
      >
        <div className="flex justify-between items-center p-4 border-b border-brand-muted">
           <h3 id="video-modal-title" className="text-lg font-bold text-brand-text">{t.videoModalTitle}</h3>
           <button
            onClick={onClose}
            className="text-brand-text-dim hover:text-brand-text transition-colors rounded-full h-8 w-8 flex items-center justify-center bg-brand-bg hover:bg-brand-muted"
            aria-label="Close"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 bg-brand-bg">
            <video 
                ref={videoRef}
                src={videoUrl} 
                controls 
                className="w-full h-auto rounded-lg max-h-[60vh]"
            >
                Your browser does not support the video tag.
            </video>
        </div>
        <div className="p-4 border-t border-brand-muted space-y-3">
          <div ref={timelineRef} className="relative h-2 bg-brand-muted rounded-full cursor-pointer">
            <div 
              className="absolute h-full bg-brand-primary rounded-full"
              style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%`}}
            />
            <div 
              className="absolute -top-1.5 -ml-2 w-5 h-5 bg-white rounded-full border-2 border-brand-primary shadow-lg cursor-grab active:cursor-grabbing"
              style={{ left: `${startPercent}%` }}
              onMouseDown={(e) => handleTimelineInteraction(e, 'start')}
            />
             <div 
              className="absolute -top-1.5 -ml-2 w-5 h-5 bg-white rounded-full border-2 border-brand-primary shadow-lg cursor-grab active:cursor-grabbing"
              style={{ left: `${endPercent}%` }}
              onMouseDown={(e) => handleTimelineInteraction(e, 'end')}
            />
          </div>
          <div className="flex justify-between text-sm font-mono text-brand-text-dim">
            <span>{t.trimStart}: {formatTime(startTime)}</span>
            <span>{t.trimEnd}: {formatTime(endTime)}</span>
          </div>
          <div className="flex items-center justify-end space-x-3 pt-2">
            <p className="text-xs text-yellow-400 mr-auto">{t.trimWarning}</p>
            <button onClick={handleReset} className="px-4 py-2 text-sm rounded-md bg-brand-muted text-brand-text-dim hover:bg-brand-muted/80 transition-colors">{t.trimReset}</button>
            <button onClick={handlePreview} className="px-4 py-2 text-sm rounded-md bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/30 transition-colors">{t.trimPreview}</button>
            <button 
              onClick={handleSave} 
              disabled={isTrimming}
              className="px-4 py-2 text-sm rounded-md bg-brand-primary text-white hover:bg-indigo-500 transition-colors disabled:bg-brand-muted disabled:cursor-wait flex items-center"
            >
              {isTrimming && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isTrimming ? t.trimmingButton : t.trimSaveButton}
            </button>
          </div>
        </div>
      </div>
      <style>{`
          @keyframes scale-in {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scale-in {
            animation: scale-in 0.2s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
          }
        `}</style>
    </div>
  );
};

export default VideoPlayerModal;
