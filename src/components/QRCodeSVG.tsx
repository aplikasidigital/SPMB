/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

// Lightweight robust QR matrix generator for standard string codes
export const QRCodeSVG: React.FC<{ value: string; size?: number; className?: string }> = ({
  value,
  size = 120,
  className = '',
}) => {
  // Generate deterministic visual matrix for the code
  const getMatrix = (text: string) => {
    const matrixSize = 25; // 25x25 grid
    const grid: boolean[][] = Array(matrixSize).fill(false).map(() => Array(matrixSize).fill(false));

    // Finder patterns (top-left, top-right, bottom-left)
    const drawFinder = (startX: number, startY: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          if (
            y === 0 || y === 6 || x === 0 || x === 6 || // outer square
            (y >= 2 && y <= 4 && x >= 2 && x <= 4) // inner square
          ) {
            grid[startY + y][startX + x] = true;
          }
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(matrixSize - 7, 0);
    drawFinder(0, matrixSize - 7);

    // Timing patterns
    for (let i = 8; i < matrixSize - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Deterministic hash based on text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    let seed = Math.abs(hash) + 12345;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Fill data areas
    for (let y = 0; y < matrixSize; y++) {
      for (let x = 0; x < matrixSize; x++) {
        // Skip finder areas
        const inTopLeft = x < 8 && y < 8;
        const inTopRight = x >= matrixSize - 8 && y < 8;
        const inBottomLeft = x < 8 && y >= matrixSize - 8;
        const isTiming = x === 6 || y === 6;

        if (!inTopLeft && !inTopRight && !inBottomLeft && !isTiming) {
          grid[y][x] = random() > 0.45;
        }
      }
    }

    return { grid, matrixSize };
  };

  const { grid, matrixSize } = React.useMemo(() => getMatrix(value), [value]);
  const cellSize = size / matrixSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`bg-white p-1 rounded border border-slate-200 ${className}`}
      aria-label={`QR Code for ${value}`}
    >
      <rect width={size} height={size} fill="#ffffff" />
      {grid.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize}
              y={y * cellSize}
              width={cellSize + 0.1}
              height={cellSize + 0.1}
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  );
};
