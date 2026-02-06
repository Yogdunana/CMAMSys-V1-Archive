/**
 * Learning Logger Utility
 * Provides a convenient interface to log learning activities
 */

export interface LogOptions {
  action: string;
  message: string;
  taskType?: string;
  videoId?: string;
  videoTitle?: string;
  status?: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Log a learning activity
 */
export async function logActivity(options: LogOptions): Promise<void> {
  try {
    const response = await fetch('/api/learning-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: options.action,
        message: options.message,
        taskType: options.taskType || null,
        videoId: options.videoId || null,
        videoTitle: options.videoTitle || null,
        status: options.status || 'info',
      }),
    });

    if (!response.ok) {
      console.error('Failed to log activity:', await response.text());
    }
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

/**
 * Log task completion
 */
export async function logTaskCompletion(
  taskType: string,
  taskId: string,
  details?: string
): Promise<void> {
  return logActivity({
    action: 'TASK_COMPLETED',
    message: `Completed ${taskType} task${details ? `: ${details}` : ''}`,
    taskType,
    status: 'success',
  });
}

/**
 * Log modeling task start
 */
export async function logModelingStart(
  taskId: string,
  modelName: string
): Promise<void> {
  return logActivity({
    action: 'MODELING_STARTED',
    message: `Started modeling task for model: ${modelName}`,
    taskType: 'modeling',
    status: 'info',
  });
}

/**
 * Log modeling task completion
 */
export async function logModelingComplete(
  taskId: string,
  modelName: string,
  success: boolean
): Promise<void> {
  return logActivity({
    action: 'MODELING_COMPLETED',
    message: `Completed modeling task for model: ${modelName}`,
    taskType: 'modeling',
    status: success ? 'success' : 'error',
  });
}

/**
 * Log report generation
 */
export async function logReportGeneration(
  taskId: string,
  reportType: string
): Promise<void> {
  return logActivity({
    action: 'REPORT_GENERATED',
    message: `Generated ${reportType} report`,
    taskType: 'report',
    status: 'success',
  });
}

/**
 * Log video watching
 */
export async function logVideoWatched(
  videoId: string,
  videoTitle: string
): Promise<void> {
  return logActivity({
    action: 'VIDEO_WATCHED',
    message: `Watched video: ${videoTitle}`,
    videoId,
    videoTitle,
    taskType: 'learning',
    status: 'success',
  });
}

/**
 * Log code submission
 */
export async function logCodeSubmission(
  taskId: string,
  language: string
): Promise<void> {
  return logActivity({
    action: 'CODE_SUBMITTED',
    message: `Submitted ${language} code`,
    taskType: 'coding',
    status: 'info',
  });
}

/**
 * Log user login
 */
export async function logUserLogin(userId: string): Promise<void> {
  return logActivity({
    action: 'LOGIN',
    message: 'User logged in',
    status: 'info',
  });
}

/**
 * Log user logout
 */
export async function logUserLogout(userId: string): Promise<void> {
  return logActivity({
    action: 'LOGOUT',
    message: 'User logged out',
    status: 'info',
  });
}

/**
 * Log error
 */
export async function logError(
  action: string,
  error: Error,
  context?: string
): Promise<void> {
  return logActivity({
    action,
    message: `${context ? `${context}: ` : ''}${error.message}`,
    status: 'error',
  });
}
