/**
 * Feature Flags Configuration System
 * Controls feature availability across different deployment modes
 */

import {
  FeatureFlag as LicenseFeatureFlag,
  hasFeature,
  PlanType,
  getCurrentLicense,
} from './license';

// Re-export FeatureFlag for convenience
export { LicenseFeatureFlag as FeatureFlag };

export enum DeploymentMode {
  CLOUD = 'cloud', // Hosted on cloud (cmamsys.com)
  SELF_HOSTED = 'self_hosted', // Self-hosted with community license
  SELF_HOSTED_PAID = 'self_hosted_paid', // Self-hosted with paid license
}

export interface FeatureConfig {
  flag: LicenseFeatureFlag;
  enabled: boolean;
  category: 'core' | 'ai' | 'collaboration' | 'advanced' | 'enterprise';
  requiresLicense: boolean;
  minPlan?: PlanType;
  description: string;
  documentationUrl?: string;
}

// Feature catalog
export const FEATURE_CATALOG: FeatureConfig[] = [
  // Core features (always available in community)
  {
    flag: LicenseFeatureFlag.BASIC_AUTH,
    enabled: true,
    category: 'core',
    requiresLicense: false,
    description: 'Basic email/password authentication',
  },
  {
    flag: LicenseFeatureFlag.DASHBOARD,
    enabled: true,
    category: 'core',
    requiresLicense: false,
    description: 'Main dashboard with task overview',
  },
  {
    flag: LicenseFeatureFlag.SINGLE_USER,
    enabled: true,
    category: 'core',
    requiresLicense: false,
    description: 'Single user account',
  },
  {
    flag: LicenseFeatureFlag.BASIC_MODELING,
    enabled: true,
    category: 'core',
    requiresLicense: false,
    description: 'Basic mathematical modeling capabilities',
  },
  {
    flag: LicenseFeatureFlag.UP_TO_3_COMPETITIONS,
    enabled: true,
    category: 'core',
    requiresLicense: false,
    description: 'Up to 3 competitions',
  },
  {
    flag: LicenseFeatureFlag.KNOWLEDGE_BASE,
    enabled: true,
    category: 'core',
    requiresLicense: false,
    description: 'Knowledge base for learning',
  },
  {
    flag: LicenseFeatureFlag.COMMUNITY_SUPPORT,
    enabled: true,
    category: 'core',
    requiresLicense: false,
    description: 'Community-based support',
  },

  // AI features
  {
    flag: LicenseFeatureFlag.MULTIPLE_AI_PROVIDERS,
    enabled: true,
    category: 'ai',
    requiresLicense: true,
    minPlan: PlanType.PROFESSIONAL,
    description: 'Support for multiple AI providers (DeepSeek, VolcEngine, etc.)',
  },

  // Collaboration features
  {
    flag: LicenseFeatureFlag.TEAM_COLLABORATION,
    enabled: true,
    category: 'collaboration',
    requiresLicense: true,
    minPlan: PlanType.PROFESSIONAL,
    description: 'Team collaboration features',
  },
  {
    flag: LicenseFeatureFlag.UNLIMITED_COMPETITIONS,
    enabled: true,
    category: 'collaboration',
    requiresLicense: true,
    minPlan: PlanType.PROFESSIONAL,
    description: 'Unlimited competition projects',
  },
  {
    flag: LicenseFeatureFlag.EMAIL_NOTIFICATIONS,
    enabled: true,
    category: 'collaboration',
    requiresLicense: true,
    minPlan: PlanType.PROFESSIONAL,
    description: 'Email notifications for task updates',
  },

  // Advanced features
  {
    flag: LicenseFeatureFlag.ADVANCED_MODELING,
    enabled: true,
    category: 'advanced',
    requiresLicense: true,
    minPlan: PlanType.PROFESSIONAL,
    description: 'Advanced modeling algorithms and techniques',
  },
  {
    flag: LicenseFeatureFlag.PRIORITY_SUPPORT,
    enabled: true,
    category: 'advanced',
    requiresLicense: true,
    minPlan: PlanType.PROFESSIONAL,
    description: 'Priority email support',
  },

  // Enterprise features
  {
    flag: LicenseFeatureFlag.WHITE_LABEL,
    enabled: true,
    category: 'enterprise',
    requiresLicense: true,
    minPlan: PlanType.ENTERPRISE,
    description: 'White-label customization',
  },
  {
    flag: LicenseFeatureFlag.SSO_INTEGRATION,
    enabled: true,
    category: 'enterprise',
    requiresLicense: true,
    minPlan: PlanType.ENTERPRISE,
    description: 'Single Sign-On (SSO) integration',
  },
  {
    flag: LicenseFeatureFlag.API_ACCESS,
    enabled: true,
    category: 'enterprise',
    requiresLicense: true,
    minPlan: PlanType.ENTERPRISE,
    description: 'Full API access for third-party integrations',
  },
  {
    flag: LicenseFeatureFlag.DEDICATED_SUPPORT,
    enabled: true,
    category: 'enterprise',
    requiresLicense: true,
    minPlan: PlanType.ENTERPRISE,
    description: 'Dedicated support team',
  },
  {
    flag: LicenseFeatureFlag.CUSTOM_TRAINING,
    enabled: true,
    category: 'enterprise',
    requiresLicense: true,
    minPlan: PlanType.ENTERPRISE,
    description: 'Custom training and consulting',
  },
  {
    flag: LicenseFeatureFlag.ON_PREMISE_DEPLOYMENT,
    enabled: true,
    category: 'enterprise',
    requiresLicense: true,
    minPlan: PlanType.ENTERPRISE,
    description: 'On-premise deployment support',
  },
];

/**
 * Get current deployment mode
 */
export function getDeploymentMode(): DeploymentMode {
  const license = getCurrentLicense();

  if (process.env.DEPLOYMENT_MODE === 'cloud') {
    return DeploymentMode.CLOUD;
  }

  if (license.plan === PlanType.COMMUNITY) {
    return DeploymentMode.SELF_HOSTED;
  }

  return DeploymentMode.SELF_HOSTED_PAID;
}

/**
 * Check if feature is available based on current deployment mode and license
 */
export function isFeatureAvailable(feature: LicenseFeatureFlag): boolean {
  const catalogItem = FEATURE_CATALOG.find((f) => f.flag === feature);

  if (!catalogItem) {
    return false;
  }

  // If feature doesn't require a license, it's always available
  if (!catalogItem.requiresLicense) {
    return true;
  }

  // Check if user has the required plan
  const license = getCurrentLicense();
  if (catalogItem.minPlan && license.plan !== PlanType.COMMUNITY) {
    const planOrder = [PlanType.COMMUNITY, PlanType.PROFESSIONAL, PlanType.ENTERPRISE];
    const currentPlanLevel = planOrder.indexOf(license.plan);
    const requiredPlanLevel = planOrder.indexOf(catalogItem.minPlan);

    if (currentPlanLevel < requiredPlanLevel) {
      return false;
    }
  }

  // Check if feature is in user's license
  return hasFeature(feature);
}

/**
 * Get all available features
 */
export function getAvailableFeatures(): FeatureConfig[] {
  return FEATURE_CATALOG.filter((f) => isFeatureAvailable(f.flag));
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(category: FeatureConfig['category']): FeatureConfig[] {
  return FEATURE_CATALOG.filter((f) => f.category === category);
}

/**
 * Get features that require upgrade
 */
export function getUpgradeRequiredFeatures(): FeatureConfig[] {
  return FEATURE_CATALOG.filter((f) => f.requiresLicense && !isFeatureAvailable(f.flag));
}

/**
 * Get feature restrictions message
 */
export function getFeatureRestrictionMessage(feature: LicenseFeatureFlag): string | null {
  if (isFeatureAvailable(feature)) {
    return null;
  }

  const license = getCurrentLicense();
  const catalogItem = FEATURE_CATALOG.find((f) => f.flag === feature);

  if (!catalogItem) {
    return 'This feature is not available.';
  }

  const minPlan = catalogItem.minPlan || PlanType.PROFESSIONAL;

  if (license.plan === PlanType.COMMUNITY) {
    return `${catalogItem.description} requires upgrading to ${minPlan} plan.`;
  }

  return `${catalogItem.description} requires upgrading to Enterprise plan.`;
}

/**
 * Feature gate decorator for API routes
 */
export function withFeatureGate(feature: LicenseFeatureFlag, handler: Function) {
  return async (...args: any[]) => {
    if (!isFeatureAvailable(feature)) {
      const message = getFeatureRestrictionMessage(feature);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'FEATURE_NOT_AVAILABLE',
            message,
          },
        }),
        { status: 403 }
      );
    }

    return handler(...args);
  };
}

/**
 * Get plan comparison table
 */
export function getPlanComparison(): {
  plan: string;
  features: { feature: string; available: boolean }[];
}[] {
  const plans = [PlanType.COMMUNITY, PlanType.PROFESSIONAL, PlanType.ENTERPRISE];

  return plans.map((plan) => ({
    plan,
    features: FEATURE_CATALOG.map((catalogItem) => ({
      feature: catalogItem.flag,
      available:
        !catalogItem.requiresLicense ||
        (catalogItem.minPlan ? plans.indexOf(plan) >= plans.indexOf(catalogItem.minPlan) : false),
    })),
  }));
}
