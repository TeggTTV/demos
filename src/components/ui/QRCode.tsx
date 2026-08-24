'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeSVGProps {
	value: string;
	size?: number;
	fgColor?: string;
	bgColor?: string;
	className?: string;
}

export default function QRCodeSVG({
	value,
	size = 200,
	fgColor = '#000000',
	bgColor = '#ffffff',
	className = '',
}: QRCodeSVGProps) {
	const [svgString, setSvgString] = useState<string>('');
	const [error, setError] = useState(false);

	/* eslint-disable react-hooks/set-state-in-effect */
	useEffect(() => {
		if (!value) {
			setSvgString('');
			return;
		}

		QRCode.toString(value, {
			type: 'svg',
			errorCorrectionLevel: 'M',
			margin: 2,
			color: {
				dark: fgColor,
				light: bgColor,
			},
			width: size,
		})
			.then((svg) => {
				setSvgString(svg);
				setError(false);
			})
			.catch((err) => {
				console.error('QR Code generation error:', err);
				setError(true);
			});
	}, [value, size, fgColor, bgColor]);
	/* eslint-enable react-hooks/set-state-in-effect */

	if (error || !value) {
		return (
			<div
				style={{ width: size, height: size }}
				className={`flex items-center justify-center bg-surface-secondary text-xs text-text-muted rounded-xl ${className}`}
			>
				Failed to generate QR
			</div>
		);
	}

	if (!svgString) {
		return (
			<div
				style={{ width: size, height: size }}
				className={`flex items-center justify-center bg-surface-secondary text-xs text-text-muted rounded-xl animate-pulse ${className}`}
			/>
		);
	}

	return (
		<div
			className={`inline-block overflow-hidden ${className}`}
			style={{ width: size, height: size }}
			dangerouslySetInnerHTML={{ __html: svgString }}
		/>
	);
}