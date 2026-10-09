import React from 'react';
import { HillyTripLaunchAnimation } from './HillyTripLaunchAnimation';

export interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  return <HillyTripLaunchAnimation onComplete={onComplete} />;
};
