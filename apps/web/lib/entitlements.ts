// apps/web/lib/entitlements.ts
// Freemium entitlements: org plan + usage counters, with upgrade triggers.

import { PLANS, Plan, PlanId, ExportQuality, canExportQuality } from './plans';

export type EntitlementAction =
  | 'create-project'
  | 'add-asset'
  | 'export'
  | 'remove-watermark'
  | 'priority-ticketing';

export type UpgradeTrigger =
  | 'project-limit'
  | 'quality-lock-1080p'
  | 'watermark-export'
  | null;

export interface UsageCounters {
  projects: number;
  assets: number;
  exports: number;
}

export interface OrgContext {
  orgId: string;
  planId: PlanId;
}

export interface EntitlementResult {
  allowed: boolean;
  action: EntitlementAction;
  reason?: string;
  upgradeTrigger?: UpgradeTrigger;
  remaining?: { projects?: number; assets?: number };
}

export interface EntitlementEngine {
  plan(org: OrgContext): Plan;
  canCreateProject(org: OrgContext, activeProjects: number): EntitlementResult;
  canAddAsset(org: OrgContext, projectAssets: number): EntitlementResult;
  canExport(org: OrgContext, quality: ExportQuality): EntitlementResult;
  canRemoveWatermark(org: OrgContext): EntitlementResult;
  incrementUsage(orgId: string, counter: keyof UsageCounters, by?: number): Promise<void>;
  decrementUsage(orgId: string, counter: keyof UsageCounters, by?: number): Promise<void>;
}

export function createEntitlementEngine(opts?: {
  planOverride?: (org: OrgContext) => PlanId;
}): EntitlementEngine {
  const planForOrg = (org: OrgContext): Plan => {
    const planId = opts?.planOverride?.(org) ?? org.planId;
    return PLANS[planId] ?? PLANS.free;
  };

  const remainingProjects = (plan: Plan, active: number): number | undefined =>
    plan.maxProjects == null ? null : Math.max(0, plan.maxProjects - active);

  const remainingAssets = (plan: Plan, current: number): number | undefined =>
    plan.maxAssetsPerProject == null ? null : Math.max(0, plan.maxAssetsPerProject - current);

  return {
    plan: planForOrg,
    canCreateProject(org, activeProjects) {
      const plan = planForOrg(org);
      const remaining = remainingProjects(plan, activeProjects);
      if (remaining != null && remaining <= 0) {
        return {
          allowed: false,
          action: 'create-project',
          reason: 'Free tier limited to 3 active projects',
          upgradeTrigger: 'project-limit',
          remaining: { projects: 0 },
        };
      }
      return { allowed: true, action: 'create-project', remaining: { projects: remaining } };
    },
    canAddAsset(org, projectAssets) {
      const plan = planForOrg(org);
      const remaining = remainingAssets(plan, projectAssets);
      if (remaining != null && remaining <= 0) {
        return {
          allowed: false,
          action: 'add-asset',
          reason: 'Free tier limited to 5 assets per project',
          remaining: { assets: 0 },
        };
      }
      return { allowed: true, action: 'add-asset', remaining: { assets: remaining } };
    },
    canExport(org, quality) {
      const plan = planForOrg(org);
      if (!canExportQuality(plan, quality)) {
        return {
          allowed: false,
          action: 'export',
          reason: `${quality.toUpperCase()} export requires Pro`,
          upgradeTrigger: 'quality-lock-1080p',
        };
      }
      return { allowed: true, action: 'export' };
    },
    canRemoveWatermark(org) {
      const plan = planForOrg(org);
      if (plan.watermark) {
        return {
          allowed: false,
          action: 'remove-watermark',
          reason: 'Watermark removal requires Pro',
          upgradeTrigger: 'watermark-export',
        };
      }
      return { allowed: true, action: 'remove-watermark' };
    },
    async incrementUsage() {
      // Integration point: increment org usage counters in your store.
    },
    async decrementUsage() {
      // Integration point: decrement org usage counters in your store.
    },
  };
}

export const defaultEngine = createEntitlementEngine();
