'use client';

import React, { useMemo } from 'react';

// ─── Minimal Pure TypeScript QR Code Generator (Versions 1-10, Byte Mode, EC Level L/M) ───

// Galois Field GF(256) tables
const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(function initGF() {
	let x = 1;
	for (let i = 0; i < 255; i++) {
		EXP_TABLE[i] = x;
		EXP_TABLE[i + 255] = x;
		LOG_TABLE[x] = i;
		x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
	}
	LOG_TABLE[0] = 0;
})();

function gfMul(x: number, y: number): number {
	if (x === 0 || y === 0) return 0;
	return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
}

// Reed-Solomon polynomial division
function rsComputeRemainder(data: Uint8Array, numEc: number): Uint8Array {
	// Generate RS generator polynomial for numEc
	let gen = [1];
	for (let i = 0; i < numEc; i++) {
		const nextGen: number[] = new Array(gen.length + 1).fill(0);
		for (let j = 0; j < gen.length; j++) {
			nextGen[j] ^= gfMul(gen[j], EXP_TABLE[i]);
			nextGen[j + 1] ^= gen[j];
		}
		gen = nextGen;
	}

	const rem = new Uint8Array(numEc);
	for (let i = 0; i < data.length; i++) {
		const factor = data[i] ^ rem[0];
		for (let j = 0; j < numEc - 1; j++) {
			rem[j] = rem[j + 1] ^ gfMul(gen[j + 1], factor);
		}
		rem[numEc - 1] = gfMul(gen[numEc], factor);
	}
	return rem;
}

// Table of QR code capacity and specs for Versions 1-10, EC Level L & M
// [version, totalCodewords, ecCodewordsPerBlock, numBlocks, totalDataBytes]
interface VersionSpec {
	version: number;
	totalCodewords: number;
	ecCodewords: number;
	numBlocks: number;
	dataCapacity: number;
	alignPositions: number[];
}

const VERSION_SPECS_M: VersionSpec[] = [
	{ version: 1, totalCodewords: 26, ecCodewords: 10, numBlocks: 1, dataCapacity: 14, alignPositions: [] },
	{ version: 2, totalCodewords: 44, ecCodewords: 16, numBlocks: 1, dataCapacity: 26, alignPositions: [6, 18] },
	{ version: 3, totalCodewords: 70, ecCodewords: 26, numBlocks: 1, dataCapacity: 42, alignPositions: [6, 22] },
	{ version: 4, totalCodewords: 100, ecCodewords: 36, numBlocks: 2, dataCapacity: 62, alignPositions: [6, 26] },
	{ version: 5, totalCodewords: 134, ecCodewords: 48, numBlocks: 2, dataCapacity: 84, alignPositions: [6, 30] },
	{ version: 6, totalCodewords: 172, ecCodewords: 64, numBlocks: 4, dataCapacity: 106, alignPositions: [6, 34] },
	{ version: 7, totalCodewords: 196, ecCodewords: 72, numBlocks: 4, dataCapacity: 122, alignPositions: [6, 22, 38] },
	{ version: 8, totalCodewords: 242, ecCodewords: 88, numBlocks: 4, dataCapacity: 152, alignPositions: [6, 24, 42] },
	{ version: 9, totalCodewords: 292, ecCodewords: 110, numBlocks: 5, dataCapacity: 180, alignPositions: [6, 26, 46] },
	{ version: 10, totalCodewords: 346, ecCodewords: 130, numBlocks: 5, dataCapacity: 213, alignPositions: [6, 28, 50] },
];

// Format info bits for Level M (masks 0..7)
const FORMAT_INFO_M = [
	0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0,
];

function encodeQR(text: string): boolean[][] {
	const utf8Bytes: number[] = [];
	for (let i = 0; i < text.length; i++) {
		const code = text.charCodeAt(i);
		if (code < 128) utf8Bytes.push(code);
		else if (code < 2048) {
			utf8Bytes.push((code >> 6) | 192);
			utf8Bytes.push((code & 63) | 128);
		} else {
			utf8Bytes.push((code >> 12) | 224);
			utf8Bytes.push(((code >> 6) & 63) | 128);
			utf8Bytes.push((code & 63) | 128);
		}
	}

	// Find smallest suitable version
	const spec = VERSION_SPECS_M.find((s) => s.dataCapacity >= utf8Bytes.length) || VERSION_SPECS_M[VERSION_SPECS_M.length - 1];
	const size = 17 + 4 * spec.version;

	// Build Bit Stream (Byte mode: 0100 + 8-bit length + data)
	const bitStream: number[] = [];
	const pushBits = (val: number, len: number) => {
		for (let i = len - 1; i >= 0; i--) {
			bitStream.push((val >> i) & 1);
		}
	};

	pushBits(0b0100, 4); // Byte mode indicator
	pushBits(utf8Bytes.length, 8); // Character count indicator (8 bits for V 1-9)
	for (const b of utf8Bytes) {
		pushBits(b, 8);
	}

	// Terminator (up to 4 zeroes)
	const totalDataBits = spec.dataCapacity * 8;
	const termLen = Math.min(4, totalDataBits - bitStream.length);
	pushBits(0, termLen);

	// Pad to multiple of 8
	while (bitStream.length % 8 !== 0) {
		bitStream.push(0);
	}

	// Pad bytes (0xEC, 0x11)
	const padBytes = [0xec, 0x11];
	let padIdx = 0;
	while (bitStream.length < totalDataBits) {
		pushBits(padBytes[padIdx % 2], 8);
		padIdx++;
	}

	// Convert bitstream to bytes
	const dataBytes = new Uint8Array(spec.dataCapacity);
	for (let i = 0; i < spec.dataCapacity; i++) {
		let byteVal = 0;
		for (let b = 0; b < 8; b++) {
			byteVal = (byteVal << 1) | bitStream[i * 8 + b];
		}
		dataBytes[i] = byteVal;
	}

	// Error Correction Coding & Interleaving
	const numBlocks = spec.numBlocks;
	const ecPerBlock = spec.ecCodewords / numBlocks;
	const dataPerBlock = Math.floor(spec.dataCapacity / numBlocks);
	const dataBlocks: Uint8Array[] = [];
	const ecBlocks: Uint8Array[] = [];

	let offset = 0;
	for (let b = 0; b < numBlocks; b++) {
		const blockLen = b < (spec.dataCapacity % numBlocks) ? dataPerBlock + 1 : dataPerBlock;
		const blockData = dataBytes.slice(offset, offset + blockLen);
		offset += blockLen;
		dataBlocks.push(blockData);
		ecBlocks.push(rsComputeRemainder(blockData, ecPerBlock));
	}

	// Final interleaved codewords
	const finalCodewords: number[] = [];
	const maxDataLen = Math.max(...dataBlocks.map((b) => b.length));
	for (let i = 0; i < maxDataLen; i++) {
		for (let b = 0; b < numBlocks; b++) {
			if (i < dataBlocks[b].length) {
				finalCodewords.push(dataBlocks[b][i]);
			}
		}
	}
	for (let i = 0; i < ecPerBlock; i++) {
		for (let b = 0; b < numBlocks; b++) {
			finalCodewords.push(ecBlocks[b][i]);
		}
	}

	// Initialize Matrix
	const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
	const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

	// Helper to place finder pattern
	const placeFinder = (startRow: number, startCol: number) => {
		for (let r = -1; r <= 7; r++) {
			for (let c = -1; c <= 7; c++) {
				const nr = startRow + r;
				const nc = startCol + c;
				if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
					isFunction[nr][nc] = true;
					if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
						matrix[nr][nc] =
							r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
					} else {
						matrix[nr][nc] = false;
					}
				}
			}
		}
	};

	placeFinder(0, 0);
	placeFinder(0, size - 7);
	placeFinder(size - 7, 0);

	// Alignment patterns for V >= 2
	if (spec.alignPositions.length > 0) {
		const pos = spec.alignPositions;
		for (const r of pos) {
			for (const c of pos) {
				if (
					(r === pos[0] && c === pos[0]) ||
					(r === pos[0] && c === pos[pos.length - 1]) ||
					(r === pos[pos.length - 1] && c === pos[0])
				) {
					continue; // Overlaps with finder patterns
				}
				for (let dr = -2; dr <= 2; dr++) {
					for (let dc = -2; dc <= 2; dc++) {
						const nr = r + dr;
						const nc = c + dc;
						isFunction[nr][nc] = true;
						matrix[nr][nc] =
							Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
					}
				}
			}
		}
	}

	// Timing patterns
	for (let i = 8; i < size - 8; i++) {
		if (!isFunction[6][i]) {
			isFunction[6][i] = true;
			matrix[6][i] = i % 2 === 0;
		}
		if (!isFunction[i][6]) {
			isFunction[i][6] = true;
			matrix[i][6] = i % 2 === 0;
		}
	}

	// Dark module
	isFunction[4 * spec.version + 9][8] = true;
	matrix[4 * spec.version + 9][8] = true;

	// Reserve format info areas
	for (let i = 0; i < 9; i++) {
		if (i !== 6) {
			isFunction[8][i] = true;
			isFunction[i][8] = true;
		}
	}
	for (let i = size - 8; i < size; i++) {
		isFunction[8][i] = true;
	}
	for (let i = size - 7; i < size; i++) {
		isFunction[i][8] = true;
	}

	// Place Data Codewords (Zigzag from bottom-right)
	const finalBits: number[] = [];
	for (const byte of finalCodewords) {
		for (let b = 7; b >= 0; b--) {
			finalBits.push((byte >> b) & 1);
		}
	}

	let bitIdx = 0;
	let upward = true;
	for (let right = size - 1; right > 0; right -= 2) {
		if (right === 6) right--; // Skip vertical timing column
		const cols = [right, right - 1];

		const rows = upward
			? Array.from({ length: size }, (_, i) => size - 1 - i)
			: Array.from({ length: size }, (_, i) => i);

		for (const r of rows) {
			for (const c of cols) {
				if (!isFunction[r][c]) {
					const bit = bitIdx < finalBits.length ? finalBits[bitIdx++] : 0;
					matrix[r][c] = bit === 1;
				}
			}
		}
		upward = !upward;
	}

	// Mask Pattern (Pattern 0: (row + col) % 2 === 0)
	const mask = 0;
	for (let r = 0; r < size; r++) {
		for (let c = 0; c < size; c++) {
			if (!isFunction[r][c]) {
				if ((r + c) % 2 === 0) {
					matrix[r][c] = !matrix[r][c];
				}
			}
		}
	}

	// Write Format Information (Format Info for Mask 0 Level M: 0x5412)
	const formatBits = FORMAT_INFO_M[mask];
	for (let i = 0; i < 15; i++) {
		const bit = ((formatBits >> i) & 1) === 1;

		// Top-left
		if (i < 6) matrix[8][i] = bit;
		else if (i === 6) matrix[8][7] = bit;
		else if (i === 7) matrix[8][8] = bit;
		else if (i === 8) matrix[7][8] = bit;
		else matrix[14 - i][8] = bit;

		// Bottom-left / Top-right
		if (i < 8) matrix[size - 1 - i][8] = bit;
		else matrix[8][size - 15 + i] = bit;
	}

	return matrix;
}

export interface QRCodeSVGProps {
	value: string;
	size?: number;
	fgColor?: string;
	bgColor?: string;
	className?: string;
}

export default function QRCodeSVG({
	value,
	size = 256,
	fgColor = '#000000',
	bgColor = '#FFFFFF',
	className = '',
}: QRCodeSVGProps) {
	const matrix = useMemo(() => {
		try {
			return encodeQR(value);
		} catch (e) {
			console.error('QR code generation error:', e);
			return null;
		}
	}, [value]);

	if (!matrix) {
		return (
			<div
				style={{ width: size, height: size }}
				className={`flex items-center justify-center bg-surface-secondary text-xs text-text-muted rounded-xl ${className}`}
			>
				Failed to generate QR
			</div>
		);
	}

	const numCells = matrix.length;
	const margin = 4; // Quiet zone
	const totalSize = numCells + margin * 2;

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={`0 0 ${totalSize} ${totalSize}`}
			width={size}
			height={size}
			className={`shape-rendering-crispEdges ${className}`}
			style={{ background: bgColor }}
			shapeRendering="crispEdges"
		>
			<rect width="100%" height="100%" fill={bgColor} />
			<g fill={fgColor}>
				{matrix.map((row, r) =>
					row.map((cell, c) =>
						cell ? (
							<rect
								key={`${r}-${c}`}
								x={c + margin}
								y={r + margin}
								width={1}
								height={1}
							/>
						) : null,
					),
				)}
			</g>
		</svg>
	);
}
