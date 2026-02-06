/**
 * License Management System
 * Controls open-source vs commercial feature access
 */

export enum PlanType {
  COMMUNITY = 'community', // Open-source (free)
  PROFESSIONAL = 'professional', // Commercial (paid)
  ENTERPRISE = 'enterprise', // Commercial (paid, full features)
}

export enum FeatureFlag {
  // Open-source features (always available)
  BASIC_AUTH = 'basic_auth',
  DASHBOARD = 'dashboard',
  SINGLE_USER = 'single_user',
  BASIC_MODELING = 'basic_modeling',
  UP_TO_3_COMPETITIONS = 'up_to_3_competitions',
  KNOWLEDGE_BASE = 'knowledge_base',
  COMMUNITY_SUPPORT = 'community_support',

  // Professional features (requires paid license)
  TEAM_COLLABORATION = 'team_collaboration',
  UNLIMITED_COMPETITIONS = 'unlimited_competitions',
  ADVANCED_MODELING = 'advanced_modeling',
  MULTIPLE_AI_PROVIDERS = 'multiple_ai_providers',
  EMAIL_NOTIFICATIONS = 'email_notifications',
  PRIORITY_SUPPORT = 'priority_support',

  // Enterprise features (requires enterprise license)
  WHITE_LABEL = 'white_label',
  SSO_INTEGRATION = 'sso_integration',
  API_ACCESS = 'api_access',
  DEDICATED_SUPPORT = 'dedicated_support',
  CUSTOM_TRAINING = 'custom_training',
  ON_PREMISE_DEPLOYMENT = 'on_premise_deployment',
}

export interface License {
  key: string;
  plan: PlanType;
  organization?: string;
  validFrom: Date;
  validUntil: Date;
  features: FeatureFlag[];
  maxUsers?: number;
  allowedDomains?: string[];
  restrictions?: {
    maxCompetitions?: number;
    maxStorageGB?: number;
    maxApiCallsPerMonth?: number;
  };
}

export interface LicenseInfo {
  isValid: boolean;
  plan: PlanType;
  features: FeatureFlag[];
  expiresAt: Date;
  daysUntilExpiry: number;
  organization?: string;
  maxUsers?: number;
  restrictions?: License['restrictions'];
}

// Default community plan features
const COMMUNITY_FEATURES: FeatureFlag[] = [
  FeatureFlag.BASIC_AUTH,
  FeatureFlag.DASHBOARD,
  FeatureFlag.SINGLE_USER,
  FeatureFlag.BASIC_MODELING,
  FeatureFlag.UP_TO_3_COMPETITIONS,
  FeatureFlag.KNOWLEDGE_BASE,
  FeatureFlag.COMMUNITY_SUPPORT,
];

// Professional plan features
const PROFESSIONAL_FEATURES: FeatureFlag[] = [
  ...COMMUNITY_FEATURES,
  FeatureFlag.TEAM_COLLABORATION,
  FeatureFlag.UNLIMITED_COMPETITIONS,
  FeatureFlag.ADVANCED_MODELING,
  FeatureFlag.MULTIPLE_AI_PROVIDERS,
  FeatureFlag.EMAIL_NOTIFICATIONS,
  FeatureFlag.PRIORITY_SUPPORT,
];

// Enterprise plan features
const ENTERPRISE_FEATURES: FeatureFlag[] = [
  ...PROFESSIONAL_FEATURES,
  FeatureFlag.WHITE_LABEL,
  FeatureFlag.SSO_INTEGRATION,
  FeatureFlag.API_ACCESS,
  FeatureFlag.DEDICATED_SUPPORT,
  FeatureFlag.CUSTOM_TRAINING,
  FeatureFlag.ON_PREMISE_DEPLOYMENT,
];

/**
 * Check if a feature is available in the current plan
 */
export function hasFeature(feature: FeatureFlag): boolean {
  const license = getCurrentLicense();
  return license.features.includes(feature);
}

/**
 * Check if multiple features are available
 */
export function hasFeatures(features: FeatureFlag[]): boolean {
  const license = getCurrentLicense();
  return features.every((f) => license.features.includes(f));
}

/**
 * Get current license information
 */
export function getCurrentLicense(): LicenseInfo {
  // In development mode, always return full access
  if (process.env.NODE_ENV === 'development') {
    return {
      isValid: true,
      plan: PlanType.ENTERPRISE,
      features: ENTERPRISE_FEATURES,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 365,
      organization: 'Development',
    };
  }

  // Check for license key in environment
  const licenseKey = process.env.LICENSE_KEY;

  if (!licenseKey) {
    // No license key - return community plan
    return {
      isValid: true,
      plan: PlanType.COMMUNITY,
      features: COMMUNITY_FEATURES,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 365,
    };
  }

  // Parse and validate license key
  try {
    const license = parseLicenseKey(licenseKey);
    const isValid = validateLicense(license);

    if (!isValid) {
      return getCommunityLicense();
    }

    const features = getFeaturesForPlan(license.plan);
    const daysUntilExpiry = Math.ceil(
      (license.validUntil.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );

    return {
      isValid: true,
      plan: license.plan,
      features,
      expiresAt: license.validUntil,
      daysUntilExpiry,
      organization: license.organization,
      maxUsers: license.maxUsers,
      restrictions: license.restrictions,
    };
  } catch (error) {
    console.error('License validation error:', error);
    return getCommunityLicense();
  }
}

/**
 * Get community plan license info
 */
function getCommunityLicense(): LicenseInfo {
  return {
    isValid: true,
    plan: PlanType.COMMUNITY,
    features: COMMUNITY_FEATURES,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    daysUntilExpiry: 365,
    restrictions: {
      maxCompetitions: 3,
      maxStorageGB: 10,
      maxApiCallsPerMonth: 1000,
    },
  };
}

/**
 * Parse license key (simplified version)
 */
function parseLicenseKey(key: string): License {
  // In production, this would verify a cryptographically signed license
  // For now, we'll use a simple JSON format for demonstration
  const decoded = Buffer.from(key, 'base64').toString('utf-8');
  const license = JSON.parse(decoded);

  return {
    ...license,
    validFrom: new Date(license.validFrom),
    validUntil: new Date(license.validUntil),
  };
}

/**
 * Validate license
 */
function validateLicense(license: License): boolean {
  const now = new Date();

  // Check if license is valid for current date
  if (now < license.validFrom || now > license.validUntil) {
    return false;
  }

  // Check if domain is allowed (if specified)
  if (license.allowedDomains && license.allowedDomains.length > 0) {
    const currentDomain = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'localhost';
    const domainAllowed = license.allowedDomains.some((domain) =>
      currentDomain.includes(domain)
    );
    if (!domainAllowed) {
      return false;
    }
  }

  return true;
}

/**
 * Get features for a plan
 */
function getFeaturesForPlan(plan: PlanType): FeatureFlag[] {
  switch (plan) {
    case PlanType.COMMUNITY:
      return COMMUNITY_FEATURES;
    case PlanType.PROFESSIONAL:
      return PROFESSIONAL_FEATURES;
    case PlanType.ENTERPRISE:
      return ENTERPRISE_FEATURES;
    default:
      return COMMUNITY_FEATURES;
  }
}

/**
 * Create a license key (for administrative purposes)
 */
export function createLicenseKey(license: Omit<License, 'key'>): string {
  const licenseData = {
    ...license,
    validFrom: license.validFrom.toISOString(),
    validUntil: license.validUntil.toISOString(),
  };

  const encoded = Buffer.from(JSON.stringify(licenseData)).toString('base64');
  return encoded;
}

/**
 * Require feature - throws error if feature not available
 */
export function requireFeature(feature: FeatureFlag): void {
  if (!hasFeature(feature)) {
    const license = getCurrentLicense();
    throw new Error(
      `Feature "${feature}" requires ${license.plan === PlanType.COMMUNITY ? 'Professional' : 'Enterprise'} plan`
    );
  }
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: PlanType): string {
  switch (plan) {
    case PlanType.COMMUNITY:
      return 'Community';
    case PlanType.PROFESSIONAL:
      return 'Professional';
    case PlanType.ENTERPRISE:
      return 'Enterprise';
    default:
      return 'Unknown';
  }
}

/**
 * Get feature display name
 */
export function getFeatureDisplayName(feature: FeatureFlag): string {
  return feature
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
