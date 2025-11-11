import { useState, useEffect } from 'react';

export const useCaseTimer = (caseId, timerStartedAt) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!timerStartedAt) {
      setElapsedTime(0);
      return;
    }

    const startTime = new Date(timerStartedAt).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    };

    // Actualizar inmediatamente
    updateTimer();

    // Actualizar cada segundo
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [timerStartedAt]);

  return elapsedTime;
};