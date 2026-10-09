import React from 'react';
import HillyTripHeroSection from './hero/HillyTripHeroSection';

import { Destination, Attraction, Homestay, Driver, Route, Hub } from '../types';

interface BrandStoryHeroProps {
  heroData?: { imageUrl?: string; videoUrl?: string };
  onOpenAiPlanner: () => void;
  navigate?: (path: string) => void;
  user?: any;
  prefersReducedMotion?: boolean;
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  drivers?: Driver[];
  hubs?: Hub[];
  routes?: Route[];
  destinationsCount?: number;
  attractionsCount?: number;
  homestaysCount?: number;
  operatorsCount?: number;
  routesCount?: number;
  themeMode?: 'light' | 'dark';
  searchFrom?: string;
  setSearchFrom?: (val: string) => void;
  searchTo?: string;
  setSearchTo?: (val: string) => void;
}

export const BrandStoryHero: React.FC<BrandStoryHeroProps> = ({
  onOpenAiPlanner,
  navigate = () => {},
  destinations = [],
  attractions = [],
  homestays = [],
  drivers = [],
  hubs = [],
  routes = [],
  destinationsCount = 0,
  attractionsCount = 0,
  homestaysCount = 0,
  operatorsCount = 0,
  routesCount = 0,
  themeMode = 'dark',
  searchFrom = '',
  setSearchFrom = () => {},
  searchTo = '',
  setSearchTo = () => {}
}) => {
  return (
    <HillyTripHeroSection
      navigate={navigate}
      onOpenAiPlanner={onOpenAiPlanner}
      destinations={destinations}
      attractions={attractions}
      homestays={homestays}
      drivers={drivers}
      hubs={hubs}
      routes={routes}
      destinationsCount={destinationsCount}
      attractionsCount={attractionsCount}
      homestaysCount={homestaysCount}
      operatorsCount={operatorsCount}
      routesCount={routesCount}
      themeMode={themeMode}
      searchFrom={searchFrom}
      setSearchFrom={setSearchFrom}
      searchTo={searchTo}
      setSearchTo={setSearchTo}
    />
  );
};

export default BrandStoryHero;
