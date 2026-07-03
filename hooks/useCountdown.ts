import { useState, useEffect } from 'react';

export function useCountdown(initialHours: number) {
  const [timeLeft, setTimeLeft] = useState(initialHours * 3600);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const h = Math.floor(timeLeft / 3600).toString().padStart(2, '0');
  const m = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');

  return { h, m, s };
}
