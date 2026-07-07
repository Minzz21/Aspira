"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faVolumeUp } from '@fortawesome/free-solid-svg-icons';

interface AudioPlayerProps {
  url: string;
}

export default function AudioPlayer({ url }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset state when url changes
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, [url]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setCurrentTime(current);
      if (total) {
        setProgress((current / total) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(100); // Or 0 based on preference
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current && duration) {
      const value = Number(e.target.value);
      const time = (value / 100) * duration;
      audioRef.current.currentTime = time;
      setProgress(value);
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!url) {
    return <div className="text-sm text-gray-500 italic">Audio tidak tersedia.</div>;
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-4">
      <audio 
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      <button 
        onClick={togglePlay}
        className="w-10 h-10 shrink-0 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors shadow-sm focus:outline-none"
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className={isPlaying ? "" : "ml-1"} />
      </button>
      
      <div className="flex-1 min-w-0 flex flex-col gap-1 relative group">
        <div className="flex justify-between items-center text-xs text-gray-500 font-medium px-1">
          <div className="flex items-center gap-1">
            <FontAwesomeIcon icon={faVolumeUp} className="text-primary-light" />
            <span>Voice Note</span>
          </div>
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        
        {/* Custom Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mt-1 cursor-pointer">
          <div 
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
          {/* Overlay input range for seeking */}
          <input 
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
