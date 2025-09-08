export interface IncompleteJobsConfig {
  /**
   * Timeout in minutes after which a job is considered incomplete
   * Default: 60 minutes
   */
  jobTimeoutMinutes: number;

  /**
   * Cron schedule for processing incomplete jobs
   * Default: Every 30 minutes
   */
  cronSchedule: string;

  /**
   * Default values for different KPI types when no historical data is available
   */
  defaultKpiValues: Record<string, number>;

  /**
   * Number of days to look back for calculating average values
   * Default: 30 days
   */
  averageCalculationDays: number;

  /**
   * Whether to enable automatic processing of incomplete jobs
   * Default: true
   */
  enableAutomaticProcessing: boolean;
}

export const defaultIncompleteJobsConfig: IncompleteJobsConfig = {
  jobTimeoutMinutes: parseInt(process.env.JOB_TIMEOUT_MINUTES || '60', 10),
  cronSchedule: process.env.INCOMPLETE_JOBS_CRON || 'EVERY_30_MINUTES',
  averageCalculationDays: parseInt(process.env.INCOMPLETE_JOBS_AVERAGE_DAYS || '30', 10),
  enableAutomaticProcessing: process.env.INCOMPLETE_JOBS_AUTO_PROCESS !== 'false',
  defaultKpiValues: {
    'messages_sent': 1,
    'emails_processed': 1,
    'documents_analyzed': 1,
    'api_calls': 1,
    'data_points': 1,
    'tasks_completed': 1,
    'queries_processed': 1,
    'reports_generated': 1,
    'files_processed': 1,
    'records_updated': 1,
    'notifications_sent': 1,
    'searches_performed': 1,
    'analyses_completed': 1,
    'recommendations_generated': 1,
    'validations_performed': 1,
  }
};

/**
 * Get incomplete jobs configuration from environment variables
 */
export function getIncompleteJobsConfig(): IncompleteJobsConfig {
  return {
    jobTimeoutMinutes: parseInt(process.env.JOB_TIMEOUT_MINUTES || '60', 10),
    cronSchedule: process.env.INCOMPLETE_JOBS_CRON || 'EVERY_30_MINUTES',
    averageCalculationDays: parseInt(process.env.INCOMPLETE_JOBS_AVERAGE_DAYS || '30', 10),
    enableAutomaticProcessing: process.env.INCOMPLETE_JOBS_AUTO_PROCESS !== 'false',
    defaultKpiValues: defaultIncompleteJobsConfig.defaultKpiValues
  };
}
