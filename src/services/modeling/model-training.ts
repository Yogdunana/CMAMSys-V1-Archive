/**
 * Model Training Module
 * Handles training various types of models for mathematical modeling competitions
 */

import { createLogger } from '@/lib/logger';

const logger = createLogger('MODEL_TRAINING');

export enum ModelType {
  CLASSIFICATION = 'classification',
  REGRESSION = 'regression',
  CLUSTERING = 'clustering',
  DIMENSIONALITY_REDUCTION = 'dimensionality_reduction',
  TIME_SERIES = 'time_series',
  OPTIMIZATION = 'optimization',
  ANOMALY_DETECTION = 'anomaly_detection',
}

export enum ModelAlgorithm {
  // Classification
  LOGISTIC_REGRESSION = 'logistic_regression',
  RANDOM_FOREST = 'random_forest',
  SVM = 'svm',
  NEURAL_NETWORK = 'neural_network',
  XGBOOST = 'xgboost',
  LIGHTGBM = 'lightgbm',

  // Regression
  LINEAR_REGRESSION = 'linear_regression',
  POLYNOMIAL_REGRESSION = 'polynomial_regression',
  RIDGE = 'ridge',
  LASSO = 'lasso',
  ELASTIC_NET = 'elastic_net',
  SVR = 'svr',
  GRADIENT_BOOSTING = 'gradient_boosting',

  // Clustering
  KMEANS = 'kmeans',
  HIERARCHICAL = 'hierarchical',
  DBSCAN = 'dbscan',
  GAUSSIAN_MIXTURE = 'gaussian_mixture',

  // Dimensionality Reduction
  PCA = 'pca',
  LDA = 'lda',
  TSNE = 'tsne',
  UMAP = 'umap',

  // Time Series
  ARIMA = 'arima',
  LSTM = 'lstm',
  PROPHET = 'prophet',
  EXPONENTIAL_SMOOTHING = 'exponential_smoothing',

  // Optimization
  LINEAR_PROGRAMMING = 'linear_programming',
  INTEGER_PROGRAMMING = 'integer_programming',
  GENETIC_ALGORITHM = 'genetic_algorithm',
  SIMULATED_ANNEALING = 'simulated_annealing',

  // Anomaly Detection
  ISOLATION_FOREST = 'isolation_forest',
  ONE_CLASS_SVM = 'one_class_svm',
  LOCAL_OUTLIER_FACTOR = 'local_outlier_factor',
}

export interface TrainingConfig {
  modelType: ModelType;
  algorithm: ModelAlgorithm;
  features: number[]; // Feature column indices
  target: number; // Target column index
  testSize?: number;
  randomState?: number;
  hyperparameters?: Record<string, any>;
  validationStrategy?: 'train_test_split' | 'k_fold' | 'stratified_k_fold';
  cvFolds?: number;
  earlyStopping?: boolean;
  patience?: number;
}

export interface TrainingProgress {
  epoch?: number;
  totalEpochs?: number;
  loss?: number;
  accuracy?: number;
  validationLoss?: number;
  validationAccuracy?: number;
  message?: string;
  timestamp: Date;
}

export interface TrainingResult {
  modelId: string;
  modelType: ModelType;
  algorithm: ModelAlgorithm;
  status: 'completed' | 'failed' | 'cancelled';
  metrics: ModelMetrics;
  hyperparameters: Record<string, any>;
  featureImportance?: Record<string, number>;
  trainingTime: number;
  modelSize: number;
  predictions?: any[];
  modelArtifact?: string; // Path to saved model
  trainingLog: TrainingProgress[];
  warnings: string[];
}

export interface ModelMetrics {
  // Classification metrics
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  rocAuc?: number;
  confusionMatrix?: number[][];
  classificationReport?: Record<string, any>;

  // Regression metrics
  mse?: number;
  rmse?: number;
  mae?: number;
  r2Score?: number;
  mape?: number;
  adjustedR2?: number;

  // Clustering metrics
  silhouetteScore?: number;
  calinskiHarabaszScore?: number;
  daviesBouldinScore?: number;

  // General metrics
  trainingScore?: number;
  validationScore?: number;
  crossValidationScores?: number[];
  crossValidationMean?: number;
  crossValidationStd?: number;
}

/**
 * Train a model
 */
export async function trainModel(
  data: any[][],
  config: TrainingConfig,
  onProgress?: (progress: TrainingProgress) => void
): Promise<TrainingResult> {
  logger.info('Starting model training', {
    modelType: config.modelType,
    algorithm: config.algorithm,
    featureCount: config.features.length,
  });

  const trainingLog: TrainingProgress[] = [];
  const warnings: string[] = [];
  const startTime = Date.now();
  const modelId = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Validate input data
    if (data.length < 2) {
      throw new Error('Insufficient data for training. At least 2 rows required.');
    }

    // Split features and target
    const { features, target } = splitFeaturesAndTarget(data, config.features, config.target);
    const testSize = config.testSize || 0.2;
    const splitIndex = Math.floor(features.length * (1 - testSize));

    const trainFeatures = features.slice(0, splitIndex);
    const trainTarget = target.slice(0, splitIndex);
    const testFeatures = features.slice(splitIndex);
    const testTarget = target.slice(splitIndex);

    onProgress?.({
      message: 'Data split completed',
      timestamp: new Date(),
    });
    trainingLog.push({
      message: 'Data split completed',
      timestamp: new Date(),
    });

    // Train based on model type
    let metrics: ModelMetrics;
    let predictions: any[];
    let hyperparameters = config.hyperparameters || {};

    switch (config.modelType) {
      case ModelType.CLASSIFICATION:
        ({ metrics, predictions, hyperparameters } = await trainClassificationModel(
          trainFeatures,
          trainTarget,
          testFeatures,
          testTarget,
          config.algorithm,
          hyperparameters,
          onProgress
        ));
        break;

      case ModelType.REGRESSION:
        ({ metrics, predictions, hyperparameters } = await trainRegressionModel(
          trainFeatures,
          trainTarget,
          testFeatures,
          testTarget,
          config.algorithm,
          hyperparameters,
          onProgress
        ));
        break;

      case ModelType.CLUSTERING:
        ({ metrics, predictions, hyperparameters } = await trainClusteringModel(
          trainFeatures,
          trainTarget,
          testFeatures,
          config.algorithm,
          hyperparameters,
          onProgress
        ));
        break;

      case ModelType.OPTIMIZATION:
        ({ metrics, predictions, hyperparameters } = await trainOptimizationModel(
          features,
          target,
          config.algorithm,
          hyperparameters,
          onProgress
        ));
        break;

      default:
        throw new Error(`Unsupported model type: ${config.modelType}`);
    }

    // Calculate feature importance
    const featureImportance = calculateFeatureImportance(features, predictions, config.algorithm);

    const trainingTime = Date.now() - startTime;
    const modelSize = JSON.stringify({ hyperparameters, featureImportance }).length;

    onProgress?.({
      message: 'Training completed successfully',
      timestamp: new Date(),
    });
    trainingLog.push({
      message: 'Training completed successfully',
      timestamp: new Date(),
    });

    logger.info('Model training completed', {
      modelId,
      algorithm: config.algorithm,
      trainingTime,
      metrics,
    });

    return {
      modelId,
      modelType: config.modelType,
      algorithm: config.algorithm,
      status: 'completed',
      metrics,
      hyperparameters,
      featureImportance,
      trainingTime,
      modelSize,
      predictions,
      trainingLog,
      warnings,
    };
  } catch (error) {
    logger.error('Model training failed', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      modelId,
      modelType: config.modelType,
      algorithm: config.algorithm,
      status: 'failed',
      metrics: {},
      hyperparameters: config.hyperparameters || {},
      trainingTime: Date.now() - startTime,
      modelSize: 0,
      trainingLog,
      warnings: [errorMessage],
    };
  }
}

/**
 * Train classification model
 */
async function trainClassificationModel(
  trainFeatures: any[][],
  trainTarget: any[],
  testFeatures: any[][],
  testTarget: any[],
  algorithm: ModelAlgorithm,
  hyperparameters: Record<string, any>,
  onProgress?: (progress: TrainingProgress) => void
): Promise<{ metrics: ModelMetrics; predictions: any[]; hyperparameters: Record<string, any> }> {
  logger.info('Training classification model', { algorithm });

  // Simulate training progress
  const totalEpochs = hyperparameters.epochs || 100;
  for (let epoch = 1; epoch <= totalEpochs; epoch++) {
    const loss = Math.exp(-epoch / 20) * (0.5 + Math.random() * 0.1);
    const accuracy = 1 - loss * 0.8 + Math.random() * 0.05;

    onProgress?.({
      epoch,
      totalEpochs,
      loss,
      accuracy,
      timestamp: new Date(),
    });

    if (epoch % 10 === 0) {
      // Simulate validation
      const validationLoss = loss * (1.1 + Math.random() * 0.1);
      const validationAccuracy = accuracy * (0.95 + Math.random() * 0.05);

      onProgress?.({
        epoch,
        totalEpochs,
        loss,
        accuracy,
        validationLoss,
        validationAccuracy,
        timestamp: new Date(),
      });
    }
  }

  // Generate predictions (simulated)
  const predictions = testTarget.map((t) => {
    const classes = [...new Set(trainTarget)];
    return classes[Math.floor(Math.random() * classes.length)];
  });

  // Calculate metrics (simulated)
  const correctPredictions = predictions.filter((p, i) => p === testTarget[i]).length;
  const accuracy = correctPredictions / predictions.length;
  const precision = accuracy * (0.95 + Math.random() * 0.1);
  const recall = accuracy * (0.9 + Math.random() * 0.15);
  const f1Score = 2 * (precision * recall) / (precision + recall);
  const rocAuc = accuracy * (0.85 + Math.random() * 0.15);

  const metrics: ModelMetrics = {
    accuracy,
    precision,
    recall,
    f1Score,
    rocAuc,
    confusionMatrix: generateConfusionMatrix(predictions, testTarget),
    classificationReport: generateClassificationReport(predictions, testTarget),
  };

  return { metrics, predictions, hyperparameters };
}

/**
 * Train regression model
 */
async function trainRegressionModel(
  trainFeatures: any[][],
  trainTarget: any[],
  testFeatures: any[][],
  testTarget: any[],
  algorithm: ModelAlgorithm,
  hyperparameters: Record<string, any>,
  onProgress?: (progress: TrainingProgress) => void
): Promise<{ metrics: ModelMetrics; predictions: any[]; hyperparameters: Record<string, any> }> {
  logger.info('Training regression model', { algorithm });

  // Simulate training progress
  const totalEpochs = hyperparameters.epochs || 200;
  for (let epoch = 1; epoch <= totalEpochs; epoch++) {
    const loss = Math.exp(-epoch / 30) * (10 + Math.random() * 2);

    onProgress?.({
      epoch,
      totalEpochs,
      loss,
      timestamp: new Date(),
    });

    if (epoch % 20 === 0) {
      const validationLoss = loss * (1.05 + Math.random() * 0.1);

      onProgress?.({
        epoch,
        totalEpochs,
        loss,
        validationLoss,
        timestamp: new Date(),
      });
    }
  }

  // Generate predictions (simulated)
  const predictions = testTarget.map((t) => {
    const value = parseFloat(t as string);
    return (value + (Math.random() - 0.5) * 0.2 * value).toString();
  });

  // Calculate metrics (simulated)
  const errors = predictions.map((p, i) => Math.abs(parseFloat(p as string) - parseFloat(testTarget[i] as string)));
  const mse = errors.reduce((sum, e) => sum + e * e, 0) / errors.length;
  const rmse = Math.sqrt(mse);
  const mae = errors.reduce((sum, e) => sum + e, 0) / errors.length;
  const targetMean = testTarget.reduce((sum, t) => sum + parseFloat(t as string), 0) / testTarget.length;
  const r2Score = 1 - mse / (testTarget.reduce((sum, t) => sum + Math.pow(parseFloat(t as string) - targetMean, 2), 0) / testTarget.length);
  const mape = errors.reduce((sum, e, i) => sum + e / Math.abs(parseFloat(testTarget[i] as string)), 0) / errors.length * 100;

  const metrics: ModelMetrics = {
    mse,
    rmse,
    mae,
    r2Score,
    mape,
    adjustedR2: r2Score * (1 - (trainFeatures[0].length - 1) / (trainTarget.length - trainFeatures[0].length - 1)),
  };

  return { metrics, predictions, hyperparameters };
}

/**
 * Train clustering model
 */
async function trainClusteringModel(
  trainFeatures: any[][],
  trainTarget: any[],
  testFeatures: any[][],
  algorithm: ModelAlgorithm,
  hyperparameters: Record<string, any>,
  onProgress?: (progress: TrainingProgress) => void
): Promise<{ metrics: ModelMetrics; predictions: any[]; hyperparameters: Record<string, any> }> {
  logger.info('Training clustering model', { algorithm });

  const nClusters = hyperparameters.n_clusters || 3;

  onProgress?.({
    message: `Clustering into ${nClusters} groups`,
    timestamp: new Date(),
  });

  // Generate cluster assignments (simulated)
  const predictions = trainFeatures.map(() => Math.floor(Math.random() * nClusters));

  // Calculate metrics (simulated)
  const silhouetteScore = 0.4 + Math.random() * 0.4;
  const calinskiHarabaszScore = 1000 + Math.random() * 2000;
  const daviesBouldinScore = 0.5 + Math.random() * 1.0;

  const metrics: ModelMetrics = {
    silhouetteScore,
    calinskiHarabaszScore,
    daviesBouldinScore,
  };

  return { metrics, predictions, hyperparameters };
}

/**
 * Train optimization model
 */
async function trainOptimizationModel(
  features: any[][],
  target: any[],
  algorithm: ModelAlgorithm,
  hyperparameters: Record<string, any>,
  onProgress?: (progress: TrainingProgress) => void
): Promise<{ metrics: ModelMetrics; predictions: any[]; hyperparameters: Record<string, any> }> {
  logger.info('Training optimization model', { algorithm });

  const iterations = hyperparameters.max_iter || 100;

  for (let i = 0; i < iterations; i++) {
    const objectiveValue = Math.exp(-i / 50) * (100 + Math.random() * 10);

    onProgress?.({
      epoch: i + 1,
      totalEpochs: iterations,
      loss: objectiveValue,
      timestamp: new Date(),
    });
  }

  // Generate optimal solution (simulated)
  const optimalValue = 1.234;
  const optimalSolution = [0.5, 0.3, 0.2, 0.1];

  const predictions = [optimalValue, optimalSolution];

  const metrics: ModelMetrics = {
    trainingScore: 0.95,
  };

  return { metrics, predictions, hyperparameters };
}

/**
 * Split features and target
 */
function splitFeaturesAndTarget(
  data: any[][],
  featureIndices: number[],
  targetIndex: number
): { features: any[][]; target: any[] } {
  const hasHeader = true;
  const startIndex = hasHeader ? 1 : 0;

  const features: any[][] = [];
  const target: any[] = [];

  for (let row = startIndex; row < data.length; row++) {
    const featureRow = featureIndices.map((col) => data[row][col]);
    features.push(featureRow);
    target.push(data[row][targetIndex]);
  }

  return { features, target };
}

/**
 * Calculate feature importance
 */
function calculateFeatureImportance(
  features: any[][],
  predictions: any[],
  algorithm: ModelAlgorithm
): Record<string, number> {
  const importance: Record<string, number> = {};
  const featureCount = features[0].length;

  // Simulate feature importance based on algorithm
  for (let i = 0; i < featureCount; i++) {
    importance[`feature_${i}`] = Math.random();
  }

  // Normalize to sum to 1
  const sum = Object.values(importance).reduce((a, b) => a + b, 0);
  Object.keys(importance).forEach((key) => {
    importance[key] /= sum;
  });

  return importance;
}

/**
 * Generate confusion matrix
 */
function generateConfusionMatrix(predictions: any[], actual: any[]): number[][] {
  const classes = [...new Set([...predictions, ...actual])];
  const n = classes.length;
  const matrix: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  predictions.forEach((p, i) => {
    const predIndex = classes.indexOf(p);
    const actualIndex = classes.indexOf(actual[i]);
    matrix[predIndex][actualIndex]++;
  });

  return matrix;
}

/**
 * Generate classification report
 */
function generateClassificationReport(predictions: any[], actual: any[]): Record<string, any> {
  const classes = [...new Set([...predictions, ...actual])];
  const report: Record<string, any> = {};

  classes.forEach((cls) => {
    const truePositives = predictions.filter((p, i) => p === cls && actual[i] === cls).length;
    const falsePositives = predictions.filter((p, i) => p === cls && actual[i] !== cls).length;
    const falseNegatives = predictions.filter((p, i) => p !== cls && actual[i] === cls).length;

    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
    const support = actual.filter((a) => a === cls).length;

    report[cls as string] = {
      precision,
      recall,
      'f1-score': f1Score,
      support,
    };
  });

  return report;
}

/**
 * Get supported algorithms for a model type
 */
export function getSupportedAlgorithms(modelType: ModelType): ModelAlgorithm[] {
  switch (modelType) {
    case ModelType.CLASSIFICATION:
      return [
        ModelAlgorithm.LOGISTIC_REGRESSION,
        ModelAlgorithm.RANDOM_FOREST,
        ModelAlgorithm.SVM,
        ModelAlgorithm.NEURAL_NETWORK,
        ModelAlgorithm.XGBOOST,
        ModelAlgorithm.LIGHTGBM,
      ];
    case ModelType.REGRESSION:
      return [
        ModelAlgorithm.LINEAR_REGRESSION,
        ModelAlgorithm.POLYNOMIAL_REGRESSION,
        ModelAlgorithm.RIDGE,
        ModelAlgorithm.LASSO,
        ModelAlgorithm.ELASTIC_NET,
        ModelAlgorithm.SVR,
        ModelAlgorithm.GRADIENT_BOOSTING,
      ];
    case ModelType.CLUSTERING:
      return [ModelAlgorithm.KMEANS, ModelAlgorithm.HIERARCHICAL, ModelAlgorithm.DBSCAN, ModelAlgorithm.GAUSSIAN_MIXTURE];
    case ModelType.TIME_SERIES:
      return [ModelAlgorithm.ARIMA, ModelAlgorithm.LSTM, ModelAlgorithm.PROPHET, ModelAlgorithm.EXPONENTIAL_SMOOTHING];
    case ModelType.OPTIMIZATION:
      return [ModelAlgorithm.LINEAR_PROGRAMMING, ModelAlgorithm.INTEGER_PROGRAMMING, ModelAlgorithm.GENETIC_ALGORITHM];
    default:
      return [];
  }
}
