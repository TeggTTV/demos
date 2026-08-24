'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/components/AppContext';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import LandingHero from '@/components/landing/LandingHero';
import LandingFeaturesSection from '@/components/landing/LandingFeaturesSection';
import LandingSpotlightSection from '@/components/landing/LandingSpotlightSection';
import LandingWorkflowSection from '@/components/landing/LandingWorkflowSection';
import LandingGuideSection from '@/components/landing/LandingGuideSection';
import LandingFaqSection from '@/components/landing/LandingFaqSection';
import AuthGateModal from '@/components/modals/AuthGateModal';

export default function Home() {
	const { groups, currentUser } = useAppContext();
	const router = useRouter();

	const [searchQuery, setSearchQuery] = useState('');
	const [showAuthModal, setShowAuthModal] = useState(false);

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
		} else {
			router.push('/search');
		}
	};

	return (
		<div className="flex min-h-screen flex-col bg-background">
			<Nav />

			<main id="main-content">
				<LandingHero
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				onSearchSubmit={handleSearchSubmit}
				currentUser={currentUser}
			/>

			<LandingFeaturesSection currentUser={currentUser} />

			<LandingSpotlightSection
				groups={groups}
				currentUser={currentUser}
			/>

			<LandingWorkflowSection />

			<LandingGuideSection />

				<LandingFaqSection />
			</main>

			<Footer />

			<AuthGateModal
				isOpen={showAuthModal}
				onClose={() => setShowAuthModal(false)}
			/>
		</div>
	);
}
