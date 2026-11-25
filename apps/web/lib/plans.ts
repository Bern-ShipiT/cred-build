// apps/web/lib/plans.ts
// Plan and limit definitions for the freemium photo/video editor + ticketing platform.

export type PlanId = 'free' | 'pro' | 'enterprise';
export type ExportQuality = '720p' | '1080p' | '4k';

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthlyZAR: number;
  // Max active projects; null = unlimited
  maxProjects: number | null;
  // Max assets per project; null = unlimited
  maxAssetsPerProject: number | null;
  maxExportQuality: ExportQuality;
  watermark: boolean;
  priorityTicketing: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthlyZAR: 0,
    maxProjects: 3,
    maxAssetsPerProject: 5,
    maxExportQuality: '720p',
    watermark: true,
    priorityTicketing: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthlyZAR: 149,
    maxProjects: null,
    maxAssetsPerProject: 100,
    maxExportQuality: '1080p',
    watermark: false,
    priorityTicketing: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthlyZAR: 0,
    maxProjects: null,
    maxAssetsPerProject: null,
    maxExportQuality: '4k',
    watermark: false,
    priorityTicketing: true,
  },
};

export const FREE_TIER = PLANS.free;

export function planFor(planId: PlanId): Plan {
  return PLANS[planId] ?? PLANS.free;
}

export function isFree(planId: PlanId): boolean {
  return planId === 'free';
}

const qualityRank: Record<ExportQuality, number> = { '720p': 0, '1080p': 1, '4k': 2 };

export function canExportQuality(plan: Plan, quality: ExportQuality): boolean {
  return qualityRank[quality] <= qualityRank[plan.maxExportQuality];
}
