import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { UsageEvent } from '../schemas/usage-event.schema';
import { DailyAgentUsage } from '../schemas/daily-agent-usage.schema';
import { METERING_PROVIDER_TOKENS } from '../metering.model';
import { getIncompleteJobsConfig } from '../config/incomplete-jobs.config';

@Injectable()
export class IncompleteJobsService {
  private readonly logger = new Logger(IncompleteJobsService.name);

  constructor(
    @Inject(METERING_PROVIDER_TOKENS.USAGE_EVENT) private usage: Model<UsageEvent>,
    @Inject(METERING_PROVIDER_TOKENS.DAILY_AGENT_USAGE) private daily: Model<DailyAgentUsage>,
  ) {}

  /**
   * Scheduled task to process incomplete jobs
   * This will find jobs that started but never completed and give them average scores
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async processIncompleteJobs() {
    const config = getIncompleteJobsConfig();
    
    if (!config.enableAutomaticProcessing) {
      this.logger.log('Automatic incomplete jobs processing is disabled');
      return;
    }
    
    this.logger.log('Starting incomplete jobs processing...');
    
    try {
      const timeoutMinutes = config.jobTimeoutMinutes;
      const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);
      
      // Find all job.started events that are older than the timeout period
      const incompleteJobs = await this.usage.find({
        event_type: 'job.started',
        ts: { $lt: cutoffTime }
      }).lean();

      this.logger.log(`Found ${incompleteJobs.length} potentially incomplete jobs`);

      for (const job of incompleteJobs) {
        await this.processIncompleteJob(job);
      }

      this.logger.log(`Completed processing ${incompleteJobs.length} incomplete jobs`);
    } catch (error) {
      this.logger.error('Error processing incomplete jobs:', error);
    }
  }

  /**
   * Process a single incomplete job by checking if it has a corresponding job.completed event
   * If not, calculate and apply an average score
   */
  private async processIncompleteJob(job: any) {
    try {
      const { agent_id, kpi_key, execution_id, ts } = job;
      
      // Check if there's already a job.completed event for this job
      const completedJob = await this.usage.findOne({
        agent_id,
        kpi_key,
        execution_id,
        event_type: 'job.completed',
        ts: { $gt: ts } // Completed after the started event
      }).lean();

      if (completedJob) {
        // Job was completed, no action needed
        return;
      }

      // Check if we've already processed this incomplete job
      const alreadyProcessed = await this.usage.findOne({
        agent_id,
        kpi_key,
        execution_id,
        event_type: 'job.completed',
        metadata: { incomplete_job_processed: true }
      }).lean();

      if (alreadyProcessed) {
        // Already processed this incomplete job
        return;
      }

      // Calculate average value for this KPI
      const averageValue = await this.calculateAverageJobValue(agent_id, kpi_key);
      
      if (averageValue > 0) {
        await this.createIncompleteJobCompletion(job, averageValue);
        this.logger.log(`Processed incomplete job for agent ${agent_id}, kpi ${kpi_key} with average value ${averageValue}`);
      } else {
        this.logger.warn(`No average value calculated for agent ${agent_id}, kpi ${kpi_key}`);
      }
    } catch (error) {
      this.logger.error(`Error processing incomplete job ${job.execution_id}:`, error);
    }
  }

  /**
   * Calculate the average value for completed jobs of the same KPI for the same agent
   */
  private async calculateAverageJobValue(agent_id: string, kpi_key: string): Promise<number> {
    try {
      const config = getIncompleteJobsConfig();
      // Get completed jobs for this agent and KPI from the configured number of days
      const daysAgo = new Date(Date.now() - config.averageCalculationDays * 24 * 60 * 60 * 1000);
      
      const completedJobs = await this.usage.find({
        agent_id,
        kpi_key: String(kpi_key),
        event_type: 'job.completed',
        ts: { $gte: daysAgo },
        value: { $exists: true, $gt: 0 }
      }).lean();

      if (completedJobs.length === 0) {
        // No completed jobs found, use a default value
        return this.getDefaultJobValue(kpi_key);
      }

      // Calculate average
      const totalValue = completedJobs.reduce((sum, job) => sum + (job.value || 0), 0);
      const averageValue = totalValue / completedJobs.length;
      
      this.logger.log(`Calculated average value ${averageValue} for agent ${agent_id}, kpi ${kpi_key} from ${completedJobs.length} completed jobs`);
      
      return Math.round(averageValue * 100) / 100; // Round to 2 decimal places
    } catch (error) {
      this.logger.error(`Error calculating average job value for agent ${agent_id}, kpi ${kpi_key}:`, error);
      return this.getDefaultJobValue(kpi_key);
    }
  }

  /**
   * Get a default value for a KPI when no historical data is available
   */
  private getDefaultJobValue(kpi_key: string): number {
    const config = getIncompleteJobsConfig();
    return config.defaultKpiValues[kpi_key] || 1; // Default to 1 if no specific default
  }

  /**
   * Create a job.completed event for an incomplete job with the calculated average value
   */
  private async createIncompleteJobCompletion(originalJob: any, averageValue: number) {
    try {
      const now = new Date();
      const completionEvent = {
        ts: now,
        agent_id: originalJob.agent_id,
        execution_id: originalJob.execution_id,
        event_type: 'job.completed',
        kpi_key: originalJob.kpi_key,
        value: averageValue,
        unit: 'count',
        metadata: {
          incomplete_job_processed: true,
          original_start_time: originalJob.ts,
          processing_reason: 'timeout_with_average_value',
          calculated_average: averageValue
        },
        idempotency_key: `incomplete_${originalJob.execution_id}_${originalJob.kpi_key}_${now.getTime()}`
      };

      // Create the completion event
      await this.usage.create(completionEvent);

      // Update daily usage totals
      await this.updateDailyUsageForIncompleteJob(originalJob.agent_id, originalJob.kpi_key, averageValue, now);
      
      this.logger.log(`Created completion event for incomplete job ${originalJob.execution_id} with value ${averageValue}`);
    } catch (error) {
      this.logger.error(`Error creating incomplete job completion for ${originalJob.execution_id}:`, error);
    }
  }

  /**
   * Update daily usage totals for the incomplete job completion
   */
  private async updateDailyUsageForIncompleteJob(agent_id: string, kpi_key: string, value: number, completionTime: Date) {
    try {
      const today = completionTime.toISOString().slice(0, 10);
      const kpiKey = String(kpi_key);
      
      await this.daily.findOneAndUpdate(
        { agent_id, date: today },
        { 
          $inc: { [`totals.kpis.${kpiKey}`]: value }
        },
        { upsert: true, new: true }
      ).lean();
      
      this.logger.log(`Updated daily usage for agent ${agent_id}, kpi ${kpi_key} with value ${value}`);
    } catch (error) {
      this.logger.error(`Error updating daily usage for incomplete job:`, error);
    }
  }

  /**
   * Manually trigger processing of incomplete jobs (useful for testing or manual runs)
   */
  async triggerIncompleteJobsProcessing(): Promise<{ processed: number; errors: number }> {
    this.logger.log('Manually triggering incomplete jobs processing...');
    
    let processed = 0;
    let errors = 0;
    
    try {
      const config = getIncompleteJobsConfig();
      const timeoutMinutes = config.jobTimeoutMinutes;
      const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);
      
      const incompleteJobs = await this.usage.find({
        event_type: 'job.started',
        ts: { $lt: cutoffTime }
      }).lean();

      for (const job of incompleteJobs) {
        try {
          await this.processIncompleteJob(job);
          processed++;
        } catch (error) {
          this.logger.error(`Error processing job ${job.execution_id}:`, error);
          errors++;
        }
      }

      this.logger.log(`Manual processing completed: ${processed} processed, ${errors} errors`);
      return { processed, errors };
    } catch (error) {
      this.logger.error('Error in manual incomplete jobs processing:', error);
      throw error;
    }
  }
}
