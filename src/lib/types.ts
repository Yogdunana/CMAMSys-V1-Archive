/**
 * Shared TypeScript Types
 * Common types used across the application
 */

// Manual enum definitions (for SQLite compatibility)
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  TEAM_LEAD = 'TEAM_LEAD',
  TEAM_MEMBER = 'TEAM_MEMBER',
}

export enum AuthProvider {
  LOCAL = 'LOCAL',
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
  SSO = 'SSO',
}

export enum CompetitionType {
  MCM = 'MCM',
  ICM = 'ICM',
  CUMCM = 'CUMCM',
  SHENZHEN_CUP = 'SHENZHEN_CUP',
  IMMC = 'IMMC',
  MATHORCUP = 'MATHORCUP',
  EMMC = 'EMMC',
  TEDDY_CUP = 'TEDDY_CUP',
  BLUE_BRIDGE_MATH = 'BLUE_BRIDGE_MATH',
  REGIONAL = 'REGIONAL',
  OTHER = 'OTHER',
}

export enum ProblemType {
  EVALUATION = 'EVALUATION',
  PREDICTION = 'PREDICTION',
  OPTIMIZATION = 'OPTIMIZATION',
  CLASSIFICATION = 'CLASSIFICATION',
  REGRESSION = 'REGRESSION',
  CLUSTERING = 'CLUSTERING',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  PREPROCESSING = 'PREPROCESSING',
  MODELING = 'MODELING',
  EVALUATING = 'EVALUATING',
  REPORTING = 'REPORTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// Auth Types
// ============================================

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface AuthResponse {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserDTO {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isVerified: boolean;
  isMfaEnabled: boolean;
  avatar?: string;
  bio?: string;
  organization?: string;
  createdAt: string;
}

// ============================================
// Competition Types
// ============================================

export interface CreateCompetitionRequest {
  name: string;
  type: CompetitionType;
  year: number;
  problemId: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface CompetitionDTO {
  id: string;
  name: string;
  type: CompetitionType;
  year: number;
  problemId: string;
  folderPath: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  createdBy: UserDTO;
  tasks?: ModelingTaskDTO[];
}

// ============================================
// Modeling Task Types
// ============================================

export interface CreateTaskRequest {
  name: string;
  description?: string;
  competitionId?: string;
  problemType: ProblemType;
  dataFilePath?: string;
  problemFilePath?: string;
  algorithm?: string;
  hyperparameters?: Record<string, any>;
}

export interface ModelingTaskDTO {
  id: string;
  name: string;
  description?: string;
  competitionId?: string;
  problemType: ProblemType;
  status: TaskStatus;
  progress: number;
  dataFilePath?: string;
  problemFilePath?: string;
  modelFilePath?: string;
  reportFilePath?: string;
  visualizations: string[];
  metrics?: Record<string, any>;
  algorithm?: string;
  hyperparameters?: Record<string, any>;
  approachNumber?: number;
  logs?: string;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  competition?: CompetitionDTO;
  createdBy: UserDTO;
}

export interface TaskProgressUpdate {
  taskId: string;
  status: TaskStatus;
  progress: number;
  logs?: string;
  metrics?: Record<string, any>;
}

// ============================================
// Learning Types
// ============================================

export interface LearningRecordDTO {
  id: string;
  title: string;
  sourceType: string;
  sourceUrl?: string;
  filePath?: string;
  content?: string;
  summary?: string;
  topics: string[];
  competitionTags: string[];
  duration?: number;
  learnedAt: string;
  learner: UserDTO;
}

// ============================================
// Notification Types
// ============================================

export interface NotificationDTO {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt?: string;
}

// ============================================
// Competition Folder Names
// ============================================

export const COMPETITION_FOLDER_MAP: Record<CompetitionType, string> = {
  MCM: 'MCM',
  ICM: 'ICM',
  CUMCM: 'CUMCM',
  SHENZHEN_CUP: 'ShenzhenCup',
  IMMC: 'IMMC',
  MATHORCUP: 'MathorCup',
  EMMC: 'EMMC',
  TEDDY_CUP: 'TeddyCup',
  BLUE_BRIDGE_MATH: 'BlueBridgeMath',
  REGIONAL: 'Regional',
  OTHER: 'Other',
};

export function generateCompetitionFolderPath(
  type: CompetitionType,
  year: number,
  problemId: string,
  approachNumber?: number
): string {
  const folderBase = COMPETITION_FOLDER_MAP[type] || type;
  const path = `data/competitions/${year}-${folderBase}/${problemId}`;

  if (approachNumber && approachNumber > 1) {
    return `${path}-${approachNumber}`;
  }

  return path;
}
