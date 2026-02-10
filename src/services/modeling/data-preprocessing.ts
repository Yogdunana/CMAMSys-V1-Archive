/**
 * Data Preprocessing Module
 * Handles data cleaning, transformation, and feature engineering for mathematical modeling
 */

import { createLogger } from '@/lib/logger';

const logger = createLogger('DATA_PREPROCESSING');

export interface DataConfig {
  filePath: string;
  fileFormat: 'csv' | 'xlsx' | 'json' | 'txt';
  targetColumn?: string;
  featureColumns?: string[];
  skipRows?: number;
  encoding?: string;
}

export interface PreprocessingOptions {
  handleMissingValues?: 'remove' | 'mean' | 'median' | 'mode' | 'forward_fill' | 'backward_fill';
  normalizeFeatures?: boolean;
  removeOutliers?: boolean;
  outlierMethod?: 'iqr' | 'zscore';
  zscoreThreshold?: number;
  iqrMultiplier?: number;
  encodeCategorical?: boolean;
  encodingMethod?: 'one-hot' | 'label' | 'target';
}

export interface DatasetInfo {
  rowCount: number;
  columnCount: number;
  columns: ColumnInfo[];
  missingValues: Record<string, number>;
  dataTypeStats: Record<string, any>;
  memoryUsage: number;
}

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'categorical' | 'datetime' | 'text';
  uniqueCount: number;
  nullCount: number;
  nullPercentage: number;
  sampleValues: any[];
}

export interface PreprocessingResult {
  processedData: any[][];
  datasetInfo: DatasetInfo;
  transformations: string[];
  warnings: string[];
  preprocessingReport: string;
}

/**
 * Load dataset from file
 */
export async function loadDataset(config: DataConfig): Promise<any[][]> {
  logger.info('Loading dataset', { filePath: config.filePath, format: config.fileFormat });

  try {
    // Simulate loading data based on format
    let data: any[][] = [];

    if (config.fileFormat === 'csv') {
      // In production, this would parse CSV
      data = await parseCSV(config.filePath, config.encoding);
    } else if (config.fileFormat === 'xlsx') {
      // In production, this would parse Excel
      data = await parseExcel(config.filePath);
    } else if (config.fileFormat === 'json') {
      // In production, this would parse JSON
      data = await parseJSON(config.filePath);
    }

    // Skip rows if specified
    if (config.skipRows && config.skipRows > 0) {
      data = data.slice(config.skipRows);
    }

    logger.info('Dataset loaded successfully', { rowCount: data.length });
    return data;
  } catch (error) {
    logger.error('Failed to load dataset', error);
    throw new Error(`Failed to load dataset: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Analyze dataset
 */
export function analyzeDataset(data: any[][], hasHeader: boolean = true): DatasetInfo {
  logger.info('Analyzing dataset', { rowCount: data.length });

  const headerRow = hasHeader && data.length > 0 ? data[0] : [];
  const startIndex = hasHeader ? 1 : 0;
  const rowCount = Math.max(0, data.length - startIndex);
  const columnCount = headerRow.length > 0 ? headerRow.length : (data.length > 0 ? data[0].length : 0);

  const columns: ColumnInfo[] = [];
  const missingValues: Record<string, number> = {};
  const dataTypeStats: Record<string, any> = {};

  // Analyze each column
  for (let col = 0; col < columnCount; col++) {
    const columnName = headerRow[col] || `Column_${col}`;
    const columnData: any[] = [];

    for (let row = startIndex; row < data.length; row++) {
      if (data[row][col] !== undefined && data[row][col] !== null && data[row][col] !== '') {
        columnData.push(data[row][col]);
      }
    }

    // Determine column type
    let type: 'numeric' | 'categorical' | 'datetime' | 'text' = 'text';
    const numericCount = columnData.filter((v) => !isNaN(parseFloat(v as string))).length;
    const uniqueValues = new Set(columnData);
    const uniqueCount = uniqueValues.size;

    if (numericCount > columnData.length * 0.8) {
      type = 'numeric';
      // Calculate statistics for numeric columns
      const numericValues = columnData.map((v) => parseFloat(v as string));
      const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      const sorted = [...numericValues].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const std = Math.sqrt(numericValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / numericValues.length);

      dataTypeStats[columnName] = { mean, median, min, max, std };
    } else if (uniqueCount < columnData.length * 0.5) {
      type = 'categorical';
      // Calculate category distribution
      const distribution: Record<string, number> = {};
      columnData.forEach((v) => {
        distribution[v as string] = (distribution[v as string] || 0) + 1;
      });
      dataTypeStats[columnName] = { categories: uniqueCount, distribution };
    } else {
      type = 'text';
    }

    const nullCount = rowCount - columnData.length;
    missingValues[columnName] = nullCount;

    const sampleValues = Array.from(uniqueValues).slice(0, 5);

    columns.push({
      name: columnName,
      type,
      uniqueCount,
      nullCount,
      nullPercentage: (nullCount / rowCount) * 100,
      sampleValues,
    });
  }

  const memoryUsage = JSON.stringify(data).length * 2; // Approximate

  logger.info('Dataset analysis completed', { rowCount, columnCount, columns: columns.length });

  return {
    rowCount,
    columnCount,
    columns,
    missingValues,
    dataTypeStats,
    memoryUsage,
  };
}

/**
 * Preprocess dataset
 */
export async function preprocessDataset(
  data: any[][],
  options: PreprocessingOptions = {}
): Promise<PreprocessingResult> {
  logger.info('Starting dataset preprocessing', { options });

  const transformations: string[] = [];
  const warnings: string[] = [];
  let processedData = data.map((row) => [...row]); // Deep copy

  // Handle missing values
  if (options.handleMissingValues && options.handleMissingValues !== 'remove') {
    transformations.push(`Missing values handled: ${options.handleMissingValues}`);
    processedData = handleMissingValuesInPlace(processedData, options.handleMissingValues);
  }

  // Remove outliers
  if (options.removeOutliers) {
    transformations.push(`Outliers removed: ${options.outlierMethod}`);
    processedData = removeOutliersInPlace(processedData, options.outlierMethod!, options.zscoreThreshold!, options.iqrMultiplier!);
  }

  // Normalize features
  if (options.normalizeFeatures) {
    transformations.push('Features normalized (min-max scaling)');
    processedData = normalizeFeaturesInPlace(processedData);
  }

  // Encode categorical variables
  if (options.encodeCategorical) {
    transformations.push(`Categorical encoding: ${options.encodingMethod}`);
    processedData = encodeCategoricalInPlace(processedData, options.encodingMethod!);
  }

  const datasetInfo = analyzeDataset(processedData, true);
  const preprocessingReport = generatePreprocessingReport(datasetInfo, transformations);

  logger.info('Dataset preprocessing completed', {
    originalRows: data.length,
    processedRows: processedData.length,
    transformations: transformations.length,
  });

  return {
    processedData,
    datasetInfo,
    transformations,
    warnings,
    preprocessingReport,
  };
}

/**
 * Handle missing values in place
 */
function handleMissingValuesInPlace(data: any[][], method: string): any[][] {
  if (data.length === 0) return data;

  const columnCount = data[0].length;
  const hasHeader = true; // Assume first row is header
  const startIndex = hasHeader ? 1 : 0;

  for (let col = 0; col < columnCount; col++) {
    // Collect non-null values
    const values: any[] = [];
    for (let row = startIndex; row < data.length; row++) {
      const value = data[row][col];
      if (value !== undefined && value !== null && value !== '') {
        values.push(value);
      }
    }

    // Determine fill value based on method
    let fillValue: any;
    if (method === 'mean' && !isNaN(parseFloat(values[0] as string))) {
      const numericValues = values.map((v) => parseFloat(v as string));
      fillValue = (numericValues.reduce((a, b) => a + b, 0) / numericValues.length).toString();
    } else if (method === 'median' && !isNaN(parseFloat(values[0] as string))) {
      const numericValues = values.map((v) => parseFloat(v as string)).sort((a, b) => a - b);
      fillValue = numericValues[Math.floor(numericValues.length / 2)].toString();
    } else if (method === 'mode') {
      const counts: Record<string, number> = {};
      values.forEach((v) => {
        counts[v as string] = (counts[v as string] || 0) + 1;
      });
      fillValue = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    } else if (method === 'forward_fill') {
      fillValue = null; // Special marker
    } else if (method === 'backward_fill') {
      fillValue = null; // Special marker
    } else {
      fillValue = values.length > 0 ? values[0] : '';
    }

    // Apply fill value
    if (method === 'forward_fill') {
      let lastValidValue: any = null;
      for (let row = startIndex; row < data.length; row++) {
        const value = data[row][col];
        if (value !== undefined && value !== null && value !== '') {
          lastValidValue = value;
        } else if (lastValidValue !== null) {
          data[row][col] = lastValidValue;
        }
      }
    } else if (method === 'backward_fill') {
      let nextValidValue: any = null;
      for (let row = data.length - 1; row >= startIndex; row--) {
        const value = data[row][col];
        if (value !== undefined && value !== null && value !== '') {
          nextValidValue = value;
        } else if (nextValidValue !== null) {
          data[row][col] = nextValidValue;
        }
      }
    } else {
      for (let row = startIndex; row < data.length; row++) {
        const value = data[row][col];
        if (value === undefined || value === null || value === '') {
          data[row][col] = fillValue;
        }
      }
    }
  }

  return data;
}

/**
 * Remove outliers in place
 */
function removeOutliersInPlace(
  data: any[][],
  method: 'iqr' | 'zscore',
  zscoreThreshold: number = 3,
  iqrMultiplier: number = 1.5
): any[][] {
  if (data.length === 0) return data;

  const hasHeader = true;
  const startIndex = hasHeader ? 1 : 0;
  const columnCount = data[0].length;

  // Find outliers for each numeric column
  const outlierRows = new Set<number>();

  for (let col = 0; col < columnCount; col++) {
    // Check if column is numeric
    const values: { row: number; value: number }[] = [];
    for (let row = startIndex; row < data.length; row++) {
      const value = parseFloat(data[row][col] as string);
      if (!isNaN(value)) {
        values.push({ row, value });
      }
    }

    if (values.length === 0) continue;

    if (method === 'zscore') {
      const numericValues = values.map((v) => v.value);
      const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      const std = Math.sqrt(numericValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / numericValues.length);

      values.forEach(({ row, value }) => {
        const zscore = Math.abs((value - mean) / std);
        if (zscore > zscoreThreshold) {
          outlierRows.add(row);
        }
      });
    } else if (method === 'iqr') {
      const numericValues = values.map((v) => v.value).sort((a, b) => a - b);
      const q1 = numericValues[Math.floor(numericValues.length * 0.25)];
      const q3 = numericValues[Math.floor(numericValues.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - iqrMultiplier * iqr;
      const upperBound = q3 + iqrMultiplier * iqr;

      values.forEach(({ row, value }) => {
        if (value < lowerBound || value > upperBound) {
          outlierRows.add(row);
        }
      });
    }
  }

  // Remove outlier rows (except header)
  const filteredData = data.filter((_, index) => index === 0 || !outlierRows.has(index));
  return filteredData;
}

/**
 * Normalize features in place (min-max scaling)
 */
function normalizeFeaturesInPlace(data: any[][]): any[][] {
  if (data.length === 0) return data;

  const hasHeader = true;
  const startIndex = hasHeader ? 1 : 0;
  const columnCount = data[0].length;

  for (let col = 0; col < columnCount; col++) {
    // Check if column is numeric
    const values: number[] = [];
    for (let row = startIndex; row < data.length; row++) {
      const value = parseFloat(data[row][col] as string);
      if (!isNaN(value)) {
        values.push(value);
      }
    }

    if (values.length === 0) continue;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    if (range === 0) continue;

    for (let row = startIndex; row < data.length; row++) {
      const value = parseFloat(data[row][col] as string);
      if (!isNaN(value)) {
        const normalized = (value - min) / range;
        data[row][col] = normalized.toString();
      }
    }
  }

  return data;
}

/**
 * Encode categorical variables in place
 */
function encodeCategoricalInPlace(data: any[][], method: 'one-hot' | 'label' | 'target'): any[][] {
  if (data.length === 0) return data;

  const hasHeader = true;
  const startIndex = hasHeader ? 1 : 0;

  // For simplicity, we'll use label encoding
  // In production, one-hot encoding would add new columns
  const encodings: Record<number, Record<string, string>> = {};

  for (let col = 0; col < data[0].length; col++) {
    const uniqueValues = new Set<string>();
    for (let row = startIndex; row < data.length; row++) {
      const value = data[row][col];
      if (value !== undefined && value !== null && value !== '' && isNaN(parseFloat(value as string))) {
        uniqueValues.add(value as string);
      }
    }

    if (uniqueValues.size < 2 || uniqueValues.size > 10) continue; // Skip if too few or too many categories

    // Create encoding
    const encoding: Record<string, string> = {};
    const valueArray = Array.from(uniqueValues);
    valueArray.forEach((value, index) => {
      encoding[value] = index.toString();
    });
    encodings[col] = encoding;

    // Apply encoding
    for (let row = startIndex; row < data.length; row++) {
      const value = data[row][col];
      if (encoding[value as string]) {
        data[row][col] = encoding[value as string];
      }
    }
  }

  return data;
}

/**
 * Generate preprocessing report
 */
function generatePreprocessingReport(datasetInfo: DatasetInfo, transformations: string[]): string {
  let report = '# Data Preprocessing Report\n\n';
  report += `## Dataset Overview\n`;
  report += `- Rows: ${datasetInfo.rowCount}\n`;
  report += `- Columns: ${datasetInfo.columnCount}\n`;
  report += `- Memory Usage: ${(datasetInfo.memoryUsage / 1024 / 1024).toFixed(2)} MB\n\n`;

  report += `## Column Information\n`;
  for (const column of datasetInfo.columns) {
    report += `### ${column.name}\n`;
    report += `- Type: ${column.type}\n`;
    report += `- Unique Values: ${column.uniqueCount}\n`;
    report += `- Missing Values: ${column.nullCount} (${column.nullPercentage.toFixed(2)}%)\n`;
    if (column.sampleValues.length > 0) {
      report += `- Sample Values: ${column.sampleValues.slice(0, 3).join(', ')}\n`;
    }
    report += `\n`;
  }

  report += `## Transformations Applied\n`;
  transformations.forEach((transform) => {
    report += `- ${transform}\n`;
  });
  report += `\n`;

  return report;
}

// Helper functions (simulated implementations)
async function parseCSV(filePath: string, encoding?: string): Promise<any[][]> {
  // In production, this would use a CSV parsing library
  return [['Header1', 'Header2', 'Header3'], ['1', 'A', '100'], ['2', 'B', '200'], ['3', 'C', '300']];
}

async function parseExcel(filePath: string): Promise<any[][]> {
  // In production, this would use xlsx library
  return [['Header1', 'Header2', 'Header3'], ['1', 'A', '100'], ['2', 'B', '200']];
}

async function parseJSON(filePath: string): Promise<any[][]> {
  // In production, this would parse JSON
  return [['Header1', 'Header2', 'Header3'], ['1', 'A', '100']];
}
