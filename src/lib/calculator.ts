import staticMarketRates from '@/data/market_rates.json';
import { marketRatesStore } from './fileStore';

type MarketRates = typeof staticMarketRates;

function getMarketRates(): MarketRates {
  const dynamic = marketRatesStore.get();
  if (dynamic) return dynamic as unknown as MarketRates;
  return staticMarketRates;
}

export interface MovingInput {
  homeSize: 'studio' | '1br' | '2br' | '3br' | '4br';
  originState: string;
  destState: string;
  distanceMiles: number;
  hasStairs: boolean;
  hasPacking: boolean;
  hasPiano: boolean;
  hasLongCarry: boolean;
}

export interface CleaningInput {
  squareFeet: number;
  state: string;
}

export interface EstimateResult {
  low: number;
  high: number;
  formatted: string;
  breakdown: Record<string, number>;
}

function getMultiplier(stateCode: string): number {
  const marketRates = getMarketRates();
  const states = marketRates.stateMultipliers as Record<string, { multiplier: number }>;
  return states[stateCode.toUpperCase()]?.multiplier ?? 1.0;
}

export function calculateMoving(input: MovingInput): EstimateResult {
  const marketRates = getMarketRates();
  const { baseRates, volumeConstants, complexityFactors } = marketRates;
  const vol = volumeConstants[input.homeSize as keyof typeof volumeConstants];
  const stateMultiplier =
    (getMultiplier(input.originState) + getMultiplier(input.destState)) / 2;

  let complexityAdder = 0;
  if (input.hasStairs)    complexityAdder += complexityFactors.stairs;
  if (input.hasPacking)   complexityAdder += complexityFactors.packing;
  if (input.hasPiano)     complexityAdder += complexityFactors.piano;
  if (input.hasLongCarry) complexityAdder += complexityFactors.longCarry;

  const adjustedHours = vol.hours * (1 + complexityAdder);
  const base =
    adjustedHours * baseRates.moving.hourlyRate * stateMultiplier +
    input.distanceMiles * baseRates.distanceSurchargePerMile +
    baseRates.gasSurcharge;

  const low  = Math.round(base * 0.9);
  const high = Math.round(base * 1.1);

  return {
    low,
    high,
    formatted: `$${low.toLocaleString()} \u2013 $${high.toLocaleString()}`,
    breakdown: {
      laborBase:    Math.round(adjustedHours * baseRates.moving.hourlyRate * stateMultiplier),
      distanceFee:  Math.round(input.distanceMiles * baseRates.distanceSurchargePerMile),
      gasSurcharge: baseRates.gasSurcharge,
    },
  };
}

export function calculateCleaning(input: CleaningInput): EstimateResult {
  const marketRates = getMarketRates();
  const { baseRates } = marketRates;
  const stateMultiplier = getMultiplier(input.state);
  const base =
    input.squareFeet * baseRates.cleaning.perSqFt * stateMultiplier +
    baseRates.cleaning.fixedServiceFee;

  const low  = Math.round(base * 0.9);
  const high = Math.round(base * 1.1);

  return {
    low,
    high,
    formatted: `$${low.toLocaleString()} \u2013 $${high.toLocaleString()}`,
    breakdown: {
      cleaningFee:     Math.round(input.squareFeet * baseRates.cleaning.perSqFt * stateMultiplier),
      fixedServiceFee: baseRates.cleaning.fixedServiceFee,
    },
  };
}
