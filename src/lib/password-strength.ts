/**
 * Password Strength Validation
 * 密码强度验证工具
 */

export interface PasswordStrengthResult {
  score: number;           // 0-4 (Very Weak to Very Strong)
  label: string;           // Weak, Fair, Good, Strong, Very Strong
  color: string;           // CSS color code
  isValid: boolean;        // Meets minimum requirements
  errors: string[];        // List of validation errors
  suggestions: string[];   // Suggestions for improvement
}

export interface PasswordValidationOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  forbidCommonPasswords?: boolean;
  forbidPersonalInfo?: boolean;
}

const DEFAULT_OPTIONS: PasswordValidationOptions = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbidCommonPasswords: true,
  forbidPersonalInfo: true,
};

// Common weak passwords that should be forbidden
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'password1', 'password123', '123456789', 'iloveyou', 'admin',
  'welcome', 'monkey', 'dragon', 'sunshine', 'letmein',
  'baseball', 'trustno1', 'master', 'hello', 'football',
  'shadow', 'superman', 'qazwsx', 'test123', 'admin123',
];

/**
 * Calculate password strength score
 */
export function calculatePasswordStrength(
  password: string,
  options: PasswordValidationOptions = DEFAULT_OPTIONS
): PasswordStrengthResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const minLength = opts.minLength ?? 8;
  let score = 0;

  // Length check
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  } else if (password.length >= minLength && password.length < 12) {
    score += 1;
    suggestions.push('Consider using a longer password for better security');
  } else if (password.length >= 12 && password.length < 16) {
    score += 2;
  } else if (password.length >= 16) {
    score += 3;
  }

  // Character variety
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (opts.requireLowercase && !hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (hasLowercase) {
    score += 0.5;
  }

  if (opts.requireUppercase && !hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (hasUppercase) {
    score += 0.5;
  }

  if (opts.requireNumbers && !hasNumbers) {
    errors.push('Password must contain at least one number');
  } else if (hasNumbers) {
    score += 0.5;
  }

  if (opts.requireSpecialChars && !hasSpecial) {
    errors.push('Password must contain at least one special character');
  } else if (hasSpecial) {
    score += 0.5;
  }

  // Bonus for variety
  const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecial].filter(Boolean).length;
  if (varietyCount === 4) {
    score += 1;
  } else if (varietyCount === 3) {
    score += 0.5;
  }

  // Common password check
  if (opts.forbidCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.includes(lowerPassword)) {
      errors.push('This password is too common and easily guessable');
      score = Math.max(0, score - 2);
    }
  }

  // Pattern detection (repeated characters, sequences)
  if (/(.)\1{2,}/.test(password)) {
    suggestions.push('Avoid using repeated characters');
    score = Math.max(0, score - 1);
  }

  if (/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    suggestions.push('Avoid using sequential characters');
    score = Math.max(0, score - 1);
  }

  // Normalize score to 0-4
  score = Math.min(4, Math.max(0, Math.round(score)));

  // Generate suggestions based on missing features
  if (!hasLowercase && opts.requireLowercase) {
    suggestions.push('Add lowercase letters');
  }
  if (!hasUppercase && opts.requireUppercase) {
    suggestions.push('Add uppercase letters');
  }
  if (!hasNumbers && opts.requireNumbers) {
    suggestions.push('Add numbers');
  }
  if (!hasSpecial && opts.requireSpecialChars) {
    suggestions.push('Add special characters');
  }
  if (password.length < 12) {
    suggestions.push('Use at least 12 characters');
  }

  // Determine label and color
  const { label, color } = getStrengthLabel(score);

  // Determine if password is valid
  const isValid = errors.length === 0;

  return {
    score,
    label,
    color,
    isValid,
    errors,
    suggestions: [...new Set(suggestions)].slice(0, 5), // Unique suggestions, max 5
  };
}

/**
 * Get strength label and color based on score
 */
function getStrengthLabel(score: number): { label: string; color: string } {
  switch (score) {
    case 0:
      return { label: 'Very Weak', color: '#ef4444' }; // red-500
    case 1:
      return { label: 'Weak', color: '#f97316' }; // orange-500
    case 2:
      return { label: 'Fair', color: '#eab308' }; // yellow-500
    case 3:
      return { label: 'Strong', color: '#22c55e' }; // green-500
    case 4:
      return { label: 'Very Strong', color: '#16a34a' }; // green-600
    default:
      return { label: 'Unknown', color: '#6b7280' }; // gray-500
  }
}

/**
 * Check if password meets minimum requirements
 */
export function validatePassword(
  password: string,
  options: PasswordValidationOptions = DEFAULT_OPTIONS
): { isValid: boolean; errors: string[] } {
  const result = calculatePasswordStrength(password, options);
  return {
    isValid: result.isValid,
    errors: result.errors,
  };
}

/**
 * Generate a strong random password
 */
export function generateStrongPassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + special;
  let password = '';

  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * Estimate password cracking time (very rough estimate)
 */
export function estimateCrackTime(score: number): string {
  const estimates = {
    0: 'Instantly',
    1: 'Less than a minute',
    2: 'A few minutes to hours',
    3: 'Weeks to years',
    4: 'Centuries to never',
  };

  return estimates[score as keyof typeof estimates] || 'Unknown';
}
