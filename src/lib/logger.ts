/**
 * Global Logger System
 * Centralized logging with file storage, error tracking, and rotation
 */

import fs from 'fs';
import path from 'path';

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

// Log file paths (as per specification)
const LOG_DIR = '/app/work/logs/bypass';
const LOG_FILES = {
  APP: path.join(LOG_DIR, 'app.log'),
  DEV: path.join(LOG_DIR, 'dev.log'),
  CONSOLE: path.join(LOG_DIR, 'console.log'),
};

// Log entry structure
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  stackTrace?: string;
  userId?: string;
  requestId?: string;
  ip?: string;
}

// Logger options
interface LoggerOptions {
  category: string;
  userId?: string;
  requestId?: string;
  ip?: string;
  enableConsole?: boolean;
}

/**
 * Logger class
 */
class Logger {
  private category: string;
  private userId?: string;
  private requestId?: string;
  private ip?: string;
  private enableConsole: boolean;

  constructor(options: LoggerOptions) {
    this.category = options.category;
    this.userId = options.userId;
    this.requestId = options.requestId;
    this.ip = options.ip;
    this.enableConsole = options.enableConsole ?? true;
  }

  /**
   * Write log entry to file
   */
  private writeLog(entry: LogEntry, logFile: string): void {
    try {
      // Ensure log directory exists
      if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
      }

      // Format log entry
      const logLine = this.formatLogEntry(entry);

      // Append to log file
      fs.appendFileSync(logFile, logLine + '\n', 'utf-8');
    } catch (error) {
      // If file writing fails, output to console as fallback
      console.error('Failed to write log:', error);
      console.log(logFile, entry);
    }
  }

  /**
   * Format log entry as JSON string
   */
  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  /**
   * Create log entry
   */
  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category: this.category,
      message,
      data,
      userId: this.userId,
      requestId: this.requestId,
      ip: this.ip,
    };
  }

  /**
   * Log with error stack trace
   */
  private logWithStackTrace(level: LogLevel, message: string, error?: any, data?: any): void {
    const entry = this.createLogEntry(level, message, data);

    if (error) {
      if (error instanceof Error) {
        entry.stackTrace = error.stack;
      } else if (typeof error === 'string') {
        entry.stackTrace = error;
      } else {
        entry.stackTrace = JSON.stringify(error);
      }
    }

    // Write to appropriate log file based on level
    const logFile = level === LogLevel.ERROR || level === LogLevel.FATAL ? LOG_FILES.APP : LOG_FILES.DEV;

    this.writeLog(entry, logFile);

    // Also write to console log
    this.writeLog(entry, LOG_FILES.CONSOLE);

    // Output to console if enabled
    if (this.enableConsole) {
      this.outputToConsole(entry);
    }
  }

  /**
   * Output log to console
   */
  private outputToConsole(entry: LogEntry): void {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
      [LogLevel.FATAL]: '\x1b[35m', // Magenta
    };
    const reset = '\x1b[0m';

    const color = colors[entry.level];
    const prefix = `${color}[${entry.level}]${reset} [${entry.timestamp}] [${entry.category}]`;

    console.log(`${prefix} ${entry.message}`);

    if (entry.data) {
      console.log('Data:', entry.data);
    }

    if (entry.stackTrace) {
      console.log('Stack:', entry.stackTrace);
    }
  }

  debug(message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, data);
    this.writeLog(entry, LOG_FILES.DEV);
    this.writeLog(entry, LOG_FILES.CONSOLE);
    if (this.enableConsole) this.outputToConsole(entry);
  }

  info(message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, data);
    this.writeLog(entry, LOG_FILES.APP);
    this.writeLog(entry, LOG_FILES.CONSOLE);
    if (this.enableConsole) this.outputToConsole(entry);
  }

  warn(message: string, data?: any): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, data);
    this.writeLog(entry, LOG_FILES.APP);
    this.writeLog(entry, LOG_FILES.CONSOLE);
    if (this.enableConsole) this.outputToConsole(entry);
  }

  error(message: string, error?: any, data?: any): void {
    this.logWithStackTrace(LogLevel.ERROR, message, error, data);
  }

  fatal(message: string, error?: any, data?: any): void {
    this.logWithStackTrace(LogLevel.FATAL, message, error, data);
  }
}

/**
 * Create a logger instance
 */
export function createLogger(options: LoggerOptions): Logger {
  return new Logger(options);
}

/**
 * Default logger
 */
export const defaultLogger = createLogger({
  category: 'DEFAULT',
});

/**
 * Global error handler
 */
export function setupGlobalErrorHandler(): void {
  process.on('uncaughtException', (error: Error) => {
    const logger = createLogger({ category: 'GLOBAL_ERROR_HANDLER' });
    logger.fatal('Uncaught Exception', error);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    const logger = createLogger({ category: 'GLOBAL_ERROR_HANDLER' });
    logger.error('Unhandled Rejection', reason, { promise });
  });

  defaultLogger.info('Global error handler initialized');
}

/**
 * Log rotation utility
 */
export function rotateLogs(maxFileSizeMB: number = 100, maxBackupCount: number = 5): void {
  Object.values(LOG_FILES).forEach((logFile) => {
    try {
      if (!fs.existsSync(logFile)) return;

      const stats = fs.statSync(logFile);
      const fileSizeMB = stats.size / (1024 * 1024);

      if (fileSizeMB > maxFileSizeMB) {
        // Rotate logs
        for (let i = maxBackupCount; i >= 1; i--) {
          const backupFile = `${logFile}.${i}`;
          const prevBackupFile = i === 1 ? logFile : `${logFile}.${i - 1}`;

          if (fs.existsSync(prevBackupFile)) {
            fs.renameSync(prevBackupFile, backupFile);
          }
        }

        // Create new log file
        fs.writeFileSync(logFile, '', 'utf-8');

        const logger = createLogger({ category: 'LOG_ROTATION' });
        logger.info(`Log rotated: ${logFile}`);
      }
    } catch (error) {
      console.error('Failed to rotate logs:', error);
    }
  });
}

/**
 * Clean old log files
 */
export function cleanOldLogs(daysToKeep: number = 30): void {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  fs.readdirSync(LOG_DIR).forEach((file) => {
    try {
      const filePath = path.join(LOG_DIR, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);

        const logger = createLogger({ category: 'LOG_CLEANUP' });
        logger.info(`Deleted old log file: ${file}`);
      }
    } catch (error) {
      console.error('Failed to clean log file:', error);
    }
  });
}

/**
 * Read recent log entries
 */
export function readRecentLogs(logFile: string, lines: number = 20): string[] {
  try {
    if (!fs.existsSync(logFile)) return [];

    const content = fs.readFileSync(logFile, 'utf-8');
    const logLines = content.trim().split('\n');

    return logLines.slice(-lines);
  } catch (error) {
    console.error('Failed to read logs:', error);
    return [];
  }
}

/**
 * Search logs for patterns
 */
export function searchLogs(
  logFile: string,
  pattern: string | RegExp,
  maxResults: number = 100
): string[] {
  try {
    if (!fs.existsSync(logFile)) return [];

    const content = fs.readFileSync(logFile, 'utf-8');
    const logLines = content.trim().split('\n');

    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'gi') : pattern;
    const results: string[] = [];

    for (const line of logLines) {
      if (regex.test(line)) {
        results.push(line);
        if (results.length >= maxResults) break;
      }
    }

    return results;
  } catch (error) {
    console.error('Failed to search logs:', error);
    return [];
  }
}
