import { ApiEnvelope } from '../../core/auth/auth.models';

export type ActionPriority = 'high' | 'medium' | 'low';

export interface DailyAction {
  id: string;
  priority: ActionPriority;
  category: string;
  title: string;
  detail: string;
  link: string | null;
}

export interface ActionsEnvelope extends ApiEnvelope<{ actions: DailyAction[]; total: number }> {
  data: { actions: DailyAction[]; total: number };
}

export interface FunnelStep {
  stage: string;
  count: number;
  stepRate: number | null;
  cumulativeRate: number | null;
  dropoff: number;
}

export interface Funnel {
  days: number;
  steps: FunnelStep[];
  entered: number;
  converted: number;
  lost: number;
  overallRate: number | null;
}

export interface FunnelEnvelope extends ApiEnvelope<Funnel> {
  data: Funnel;
}

export interface TrendMetric {
  current: number;
  previous: number;
  deltaPct: number;
}

export interface TeamAnalytics {
  days: number;
  recruits: TrendMetric;
  teamVolume: TrendMetric;
  personalVolume: { total: number; orders: number };
  downline: { total: number; active: number; inactive: number; activationRate: number | null };
  conversions: number;
  goals: { total: number; complete: number; rate: number | null };
  health: { score: number | null; recommendations: string[] };
}

export interface TeamEnvelope extends ApiEnvelope<TeamAnalytics> {
  data: TeamAnalytics;
}

export interface GoalSummaryItem {
  id: string;
  title: string;
  progress: { complete: boolean; onTrack: boolean; percent: number; daysLeft: number };
}

export interface DashboardOverview {
  actions: { actions: DailyAction[]; total: number };
  funnel: Funnel;
  team: TeamAnalytics;
  goals: { items: GoalSummaryItem[]; total: number; complete: number; behind: number };
  notifications: { unreadCount: number; recent: Array<{ id: string }> };
}

export interface OverviewEnvelope extends ApiEnvelope<DashboardOverview> {
  data: DashboardOverview;
}
