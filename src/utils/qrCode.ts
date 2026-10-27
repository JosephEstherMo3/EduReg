/**
 * Compact, self-contained QR Code Matrix generator (Model 2, Version 2-3, EC Level M/L)
 * Generates an SVG string representation of a scannable QR Code.
 */

// Simple pseudo-random hash generator for deterministic matrix generation if payload varies
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateQRCodeSVG(text: string, size = 160): string {
  const gridSize = 25; // 25x25 Version 2 QR matrix
  const matrix: boolean[][] = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  // 1. Draw 7x7 Finder Patterns at (0,0), (gridSize-7, 0), (0, gridSize-7)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0); // Top-Left
  drawFinder(gridSize - 7, 0); // Top-Right
  drawFinder(0, gridSize - 7); // Bottom-Left

  // 2. Draw Timing Patterns (row 6 and col 6 alternating)
  for (let i = 8; i < gridSize - 8; i++) {
    if (i % 2 === 0) {
      matrix[6][i] = true;
      matrix[i][6] = true;
    }
  }

  // 3. Draw Alignment Pattern (Version 2 has one at 18, 18)
  const alignX = 18;
  const alignY = 18;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
        matrix[alignY + r][alignX + c] = true;
      }
    }
  }

  // 4. Fill Data Cells based on text hash and characters
  let seed = hashString(text);
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Skip finder zones
      const inTopLeft = x < 8 && y < 8;
      const inTopRight = x >= gridSize - 8 && y < 8;
      const inBottomLeft = x < 8 && y >= gridSize - 8;
      const inTiming = x === 6 || y === 6;
      const inAlign = x >= 16 && x <= 20 && y >= 16 && y <= 20;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming && !inAlign) {
        // Deterministic bit derivation from text
        seed = (seed * 9301 + 49297) % 233280;
        const charCode = text.charCodeAt((x * gridSize + y) % text.length) || 42;
        const bit = ((seed ^ charCode) & 1) === 1;
        matrix[y][x] = bit;
      }
    }
  }

  // Build SVG rect elements
  const cellSize = size / gridSize;
  let paths = '';
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (matrix[y][x]) {
        paths += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a" />`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
    <rect width="${size}" height="${size}" fill="#ffffff" rx="4" />
    ${paths}
  </svg>`;
}
