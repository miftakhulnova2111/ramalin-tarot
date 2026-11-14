'use client';

import { useState, useEffect } from 'react';

const PRELOAD_IMAGES = [
  '/animations/anim_1_idle.webp',
  '/animations/anim_2_shuffle.webp',
  '/animations/anim_3_pick.webp',
  '/animations/anim_4_read.webp',
  '/animations/anim_5_think.webp',
  '/cards/back.webp',
];

export function useAssetPreloader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let loadedCount = 0;
    const total = PRELOAD_IMAGES.length;

    const promises = PRELOAD_IMAGES.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedCount += 1;
          setProgress(Math.round((loadedCount / total) * 100));
          resolve();
        };
        img.onerror = () => {
          loadedCount += 1;
          setProgress(Math.round((loadedCount / total) * 100));
          resolve();
        };
      });
    });

    Promise.all(promises).then(() => {
      setIsLoaded(true);
    });
  }, []);

  return { isLoaded, progress };
}
