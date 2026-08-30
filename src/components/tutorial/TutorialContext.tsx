'use client';

import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '@/components/AppContext';
import {
	TOUR_STEPS,
	TourStep,
	TourTrack,
} from './tutorialSteps';

export interface TutorialContextType {
	isTourActive: boolean;
	currentTrack: TourTrack;
	currentStepIndex: number;
	currentStep: TourStep | null;
	totalSteps: number;
	welcomeModalOpen: boolean;
	targetRect: DOMRect | null;
	startTour: (track?: TourTrack, stepIndex?: number) => void;
	endTour: () => void;
	skipTour: () => void;
	nextStep: () => void;
	prevStep: () => void;
	goToStep: (index: number) => void;
	openWelcomeModal: () => void;
	closeWelcomeModal: () => void;
	triggerSimulation: (simId?: string) => void;
	switchPersona: (personaId: string) => void;
	resetSandbox: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
	const {
		enableTutorialMode,
		exitTutorialMode,
		switchTutorialPersona,
		resetTutorialMockData,
		isTutorialMode,
	} = useAppContext();

	const router = useRouter();
	const pathname = usePathname();

	const [isTourActive, setIsTourActive] = useState(false);
	const [currentTrack, setCurrentTrack] = useState<TourTrack>('full');
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
	const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

	const activeSteps = TOUR_STEPS[currentTrack] || TOUR_STEPS.full;
	const currentStep = isTourActive && activeSteps[currentStepIndex] ? activeSteps[currentStepIndex] : null;



	// Locate element bounding rect for spotlight
	const updateTargetRect = useCallback(() => {
		if (!currentStep) {
			setTargetRect(null);
			return;
		}

		const selector = currentStep.targetSelector;
		const el = document.querySelector(selector);
		if (el) {
			// Ensure element is comfortably centered in viewport on all screen sizes
			el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
			const rect = el.getBoundingClientRect();
			setTargetRect(rect);
		} else {
			setTargetRect(null);
		}
	}, [currentStep]);

	// Auto-route and update target rect when step changes
	useEffect(() => {
		if (!isTourActive || !currentStep) return;

		const targetUrl = new URL(currentStep.targetPage, window.location.origin);
		const currentUrl = new URL(window.location.href);

		if (currentUrl.pathname !== targetUrl.pathname || currentUrl.search !== targetUrl.search) {
			router.push(currentStep.targetPage);
		}

		// Allow DOM elements to render before computing rect
		const timer = setTimeout(() => {
			updateTargetRect();
		}, 350);

		const handleResize = () => updateTargetRect();
		const handleScroll = () => updateTargetRect();

		window.addEventListener('resize', handleResize);
		window.addEventListener('scroll', handleScroll);

		return () => {
			clearTimeout(timer);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('scroll', handleScroll);
		};
	}, [isTourActive, currentStepIndex, currentTrack, currentStep, pathname, router, updateTargetRect]);

	const startTour = useCallback(
		(track: TourTrack = 'full', stepIndex = 0) => {
			enableTutorialMode();
			setCurrentTrack(track);
			setCurrentStepIndex(stepIndex);
			setIsTourActive(true);
			setWelcomeModalOpen(false);

			const steps = TOUR_STEPS[track] || TOUR_STEPS.full;
			const firstStep = steps[stepIndex] || steps[0];
			if (firstStep) {
				router.push(firstStep.targetPage);
			}
		},
		[enableTutorialMode, router],
	);

	const endTour = useCallback(() => {
		setIsTourActive(false);
		setTargetRect(null);
		if (typeof window !== 'undefined') {
			localStorage.setItem('demos_has_seen_tutorial_welcome', 'true');
		}
		exitTutorialMode();
	}, [exitTutorialMode]);

	const skipTour = useCallback(() => {
		endTour();
	}, [endTour]);

	const nextStep = useCallback(() => {
		if (currentStepIndex + 1 < activeSteps.length) {
			setCurrentStepIndex((prev) => prev + 1);
		} else {
			endTour();
		}
	}, [currentStepIndex, activeSteps.length, endTour]);

	const prevStep = useCallback(() => {
		if (currentStepIndex > 0) {
			setCurrentStepIndex((prev) => prev - 1);
		}
	}, [currentStepIndex]);

	const goToStep = useCallback(
		(index: number) => {
			if (index >= 0 && index < activeSteps.length) {
				setCurrentStepIndex(index);
			}
		},
		[activeSteps.length],
	);

	const openWelcomeModal = useCallback(() => {
		setWelcomeModalOpen(true);
	}, []);

	const closeWelcomeModal = useCallback(() => {
		setWelcomeModalOpen(false);
		if (typeof window !== 'undefined') {
			localStorage.setItem('demos_has_seen_tutorial_welcome', 'true');
		}
	}, []);

	const switchPersona = useCallback(
		(personaId: string) => {
			if (!isTutorialMode) {
				enableTutorialMode();
			}
			switchTutorialPersona(personaId);
		},
		[isTutorialMode, enableTutorialMode, switchTutorialPersona],
	);

	const resetSandbox = useCallback(() => {
		resetTutorialMockData();
	}, [resetTutorialMockData]);

	const triggerSimulation = useCallback(() => {}, []);

	return (
		<TutorialContext.Provider
			value={{
				isTourActive,
				currentTrack,
				currentStepIndex,
				currentStep,
				totalSteps: activeSteps.length,
				welcomeModalOpen,
				targetRect,
				startTour,
				endTour,
				skipTour,
				nextStep,
				prevStep,
				goToStep,
				openWelcomeModal,
				closeWelcomeModal,
				triggerSimulation,
				switchPersona,
				resetSandbox,
			}}
		>
			{children}
		</TutorialContext.Provider>
	);
}

export function useTutorial(): TutorialContextType {
	const context = useContext(TutorialContext);
	if (!context) {
		throw new Error('useTutorial must be used within a TutorialProvider');
	}
	return context;
}
