
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';

interface QRCodeSVGProps {
  value: string;
  size?: number;
  className?: string;
}

// Lightweight deterministic QR-style matrix generator
export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({
  value,
  size = 120,
  className = '',
}) => {
  const matrixSize = 25;

  const grid = useMemo(() => {
    const matrix: boolean[][] = Array.from(
      { length: matrixSize },
      () => Array(matrixSize).fill(false)
    );

    // Draw finder patterns
    const drawFinder = (startX: number, startY: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const isOuter =
            x === 0 || x === 6 || y === 0 || y === 6;

          const isInner =
            x >= 2 && x <= 4 && y >= 2 && y <= 4;

          matrix[startY + y][startX + x] =
            isOuter || isInner;
        }
      }
    };

    // Finder patterns
    drawFinder(0, 0);
    drawFinder(matrixSize - 7, 0);
    drawFinder(0, matrixSize - 7);

    // Timing patterns
    for (let i = 8; i < matrixSize - 8; i++) {
      matrix[6][i] = i % 2 === 0;
      matrix[i][6] = i % 2 === 0;
    }

    // Deterministic hash
    const text = String(value ?? '');

    let hash = 2166136261;

    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    // Deterministic pseudo-random generator
    let seed = hash >>> 0;

    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    // Fill data areas
    for (let y = 0; y < matrixSize; y++) {
      for (let x = 0; x < matrixSize; x++) {
        const inTopLeft = x < 8 && y < 8;

        const inTopRight =
          x >= matrixSize - 8 && y < 8;

        const inBottomLeft =
          x < 8 && y >= matrixSize - 8;

        const isTiming = x === 6 || y === 6;

        if (
          !inTopLeft &&
          !inTopRight &&
          !inBottomLeft &&
          !isTiming
        ) {
          matrix[y][x] = random() > 0.45;
        }
      }
    }

    return matrix;
  }, [value]);

  // Normalize size
  const safeSize =
    Number.isFinite(size) && size > 0 ? size : 120;

  const cellSize = safeSize / matrixSize;

  // Generate SVG rectangles in one path
  const pathData = useMemo(() => {
    const paths: string[] = [];

    for (let y = 0; y < matrixSize; y++) {
      for (let x = 0; x < matrixSize; x++) {
        if (grid[y][x]) {
          paths.push(
            `M${x * cellSize} ${y * cellSize}h${cellSize}v${cellSize}h-${cellSize}z`
          );
        }
      }
    }

    return paths.join('');
  }, [grid, cellSize]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={safeSize}
      height={safeSize}
      viewBox={`0 0 ${safeSize} ${safeSize}`}
      className={`bg-white p-1 rounded border border-slate-200 ${className}`}
      role="img"
      aria-label={`QR Code for ${String(value ?? '')}`}
      shapeRendering="crispEdges"
    >
      <rect
        x="0"
        y="0"
        width={safeSize}
        height={safeSize}
        fill="#ffffff"
      />

      <path
        d={pathData}
        fill="#0f172a"
      />
    </svg>
  );
};

export default QRCodeSVG;
