export const DEFAULT_CLUB_BANNER =
	'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80';

export interface BannerColorPreset {
	id: string;
	name: string;
	value: string;
	category?: string;
}

export interface BannerImagePreset {
	id: string;
	name: string;
	category: string;
	url: string;
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

export const BANNER_IMAGE_PRESETS: BannerImagePreset[] = [
	{
		id: 'tech_hackathon',
		name: 'Tech & Hackathons',
		category: 'Technology & Coding',
		url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'tech_coding_matrix',
		name: 'Software Workspace',
		category: 'Technology & Coding',
		url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'design_studio',
		name: 'Creative Design Studio',
		category: 'Arts & Design',
		url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'design_workshop',
		name: 'Digital Canvas & Colors',
		category: 'Arts & Design',
		url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'robotics_lab',
		name: 'Robotics & Hardware Lab',
		category: 'Engineering & Science',
		url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'engineering_circuit',
		name: 'Electronic Circuits & AI',
		category: 'Engineering & Science',
		url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'business_venture',
		name: 'Modern Startup & Venture',
		category: 'Business & Entrepreneurship',
		url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'business_meeting',
		name: 'Innovation Hub Lounge',
		category: 'Business & Entrepreneurship',
		url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'music_stage',
		name: 'Live Concert & Harmonies',
		category: 'Music & Performance',
		url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'music_performance',
		name: 'Stage Lighting & Ensemble',
		category: 'Music & Performance',
		url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'eco_nature',
		name: 'Botanical Garden & Green Canopy',
		category: 'Environmental & Sustainability',
		url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'eco_planting',
		name: 'Community Garden Harvest',
		category: 'Environmental & Sustainability',
		url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'gaming_arena',
		name: 'Neon Esports Arena',
		category: 'Gaming & Esports',
		url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'gaming_lan',
		name: 'Competitive RGB Station',
		category: 'Gaming & Esports',
		url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'campus_quad',
		name: 'Collegiate Campus Plaza',
		category: 'General & Campus Life',
		url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&auto=format&fit=crop&q=80',
	},
	{
		id: 'campus_library',
		name: 'Grand University Library',
		category: 'Academic & Honor Societies',
		url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&auto=format&fit=crop&q=80',
	},
];
