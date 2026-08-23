export const DEFAULT_CLUB_BANNER =
	'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)';

export interface BannerColorPreset {
	id: string;
	name: string;
	value: string;
}

export const BANNER_COLOR_PRESETS: BannerColorPreset[] = [
	{
		id: 'indigo',
		name: 'Default Indigo Glow',
		value: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
	},
	{
		id: 'blue',
		name: 'Ocean Blue Glow',
		value: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
	},
	{
		id: 'rose',
		name: 'Sunset Rose',
		value: 'linear-gradient(135deg, #be123c 0%, #f43f5e 100%)',
	},
	{
		id: 'green',
		name: 'Emerald Forest',
		value: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
	},
	{
		id: 'purple',
		name: 'Neon Purple',
		value: 'linear-gradient(135deg, #9333ea 0%, #c026d3 100%)',
	},
	{
		id: 'slate',
		name: 'Midnight Slate',
		value: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
	},
	{
		id: 'teal',
		name: 'Teal Lagoon',
		value: 'linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)',
	},
];
