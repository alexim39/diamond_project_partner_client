import { ApiEnvelope } from '../../core/auth/auth.models';

export interface CampaignRoi {
  id: string;
  name: string;
  visits: number;
  budget: number;
  windowProspects: number;
  windowConversions: number;
  conversionRate: number | null;
  costPerProspect: number | null;
  costPerConversion: number | null;
  attribution: 'exact' | 'estimated';
}

export interface RoiTotals {
  visits: number;
  budget: number;
  prospects: number;
  conversions: number;
  conversionRate: number | null;
  costPerProspect: number | null;
  costPerConversion: number | null;
}

export interface RoiEnvelope extends ApiEnvelope<{ days: number; campaigns: CampaignRoi[]; totals: RoiTotals }> {
  data: { days: number; campaigns: CampaignRoi[]; totals: RoiTotals };
}
