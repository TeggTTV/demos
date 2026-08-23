'use client';

import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { Textarea } from '@/components/ui/Textarea';

interface ImportRosterModalProps {
	isOpen: boolean;
	onClose: () => void;
	onImport: (emailsText: string) => Promise<void>;
	isImporting: boolean;
	errorMsg?: string;
	successMsg?: string;
}

export default function ImportRosterModal({
	isOpen,
	onClose,
	onImport,
	isImporting,
	errorMsg,
	successMsg,
}: ImportRosterModalProps) {
	const [importEmailsText, setImportEmailsText] = useState('');
	const [fileSizeError, setFileSizeError] = useState('');

	if (!isOpen) return null;

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 200000) {
				setFileSizeError('File is too large (max 200 KB).');
				e.target.value = '';
				return;
			}
			setFileSizeError('');
			const reader = new FileReader();
			reader.onload = (event) => {
				const text = event.target?.result as string;
				setImportEmailsText(text);
			};
			reader.readAsText(file);
		}
	};

	return (
		<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
			<div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden relative">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
				>
					<FiX size={16} />
				</button>
				<div className="p-6 space-y-4 text-xs">
					<div>
						<h3 className="text-sm font-bold text-text-primary">
							Import Members
						</h3>
						<p className="text-[11px] text-text-muted mt-0.5">
							Upload a CSV/text file or paste emails below.
						</p>
					</div>

					<div className="space-y-1.5">
						<label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">
							CSV/Text File Roster
						</label>
						{fileSizeError && (
							<div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-bg px-3 py-2 text-[11px] text-danger font-medium">
								<span className="shrink-0 mt-0.5">⚠️</span>
								<span>
									{fileSizeError}{' '}
									<a
										href="https://joeyjazwinski.com/developer-tools/image-compressor"
										target="_blank"
										rel="noopener noreferrer"
										className="underline font-semibold hover:text-danger/80 transition-colors"
									>
										Compress here →
									</a>
								</span>
							</div>
						)}
						<input
							type="file"
							accept=".csv,.txt"
							onChange={handleFileChange}
							className="block w-full text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-light file:text-primary hover:file:bg-primary-light/80 cursor-pointer"
						/>
					</div>

					<Textarea
						label="Or Paste Email List"
						rows={5}
						placeholder="Paste student emails separated by commas or lines here..."
						value={importEmailsText}
						onChange={(e) => setImportEmailsText(e.target.value)}
					/>

					{errorMsg && (
						<p className="text-[11px] font-medium text-danger bg-danger-bg border border-danger/10 p-2.5 rounded-lg">
							{errorMsg}
						</p>
					)}
					{successMsg && (
						<p className="text-[11px] font-medium text-success bg-success-bg border border-success/10 p-2.5 rounded-lg">
							{successMsg}
						</p>
					)}

					<button
						onClick={() => onImport(importEmailsText)}
						disabled={isImporting || !importEmailsText.trim()}
						className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-primary hover:bg-primary-hover text-white py-2 text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
					>
						{isImporting ? 'Importing Roster...' : 'Import Students'}
					</button>
				</div>
			</div>
		</div>
	);
}
