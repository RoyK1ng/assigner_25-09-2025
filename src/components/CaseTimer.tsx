
// src/components/CaseTimer.tsx
import React from 'react';
import { useCaseTimer } from '../hooks/useCaseTimer';
import { formatTime } from '../hooks/oeDashboardFunctions';

interface CaseTimerProps {
  timerStartedAt: string | null;
  timeTakenSeconds: number | null;
}

export const CaseTimer: React.FC<CaseTimerProps> = ({ timerStartedAt, timeTakenSeconds }) => {
  const elapsedTime = useCaseTimer(null, timerStartedAt);

  if (timeTakenSeconds) {
    // Caso completado - mostrar tiempo final
    return (
      <div className="flex items-center gap-1 text-xs text-green-600">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-3 w-3" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
        <span className="font-semibold">{formatTime(timeTakenSeconds)}</span>
      </div>
    );
  }

  if (!timerStartedAt) {
    // Timer no iniciado
    return (
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-3 w-3" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <span>Waiting...</span>
      </div>
    );
  }

  // Timer activo
  return (
    <div className="flex items-center gap-1 text-xs text-blue-600">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-3 w-3 animate-pulse" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
        />
      </svg>
      <span className="font-mono font-semibold animate-pulse">{formatTime(elapsedTime)}</span>
    </div>
  );
};