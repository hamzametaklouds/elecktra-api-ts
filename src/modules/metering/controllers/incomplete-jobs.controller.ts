import { Controller, Post, Get, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { IncompleteJobsService } from '../services/incomplete-jobs.service';
import { getIncompleteJobsConfig } from '../config/incomplete-jobs.config';

@Controller('v1/incomplete-jobs')
export class IncompleteJobsController {
  private readonly logger = new Logger(IncompleteJobsController.name);

  constructor(
    private readonly incompleteJobsService: IncompleteJobsService,
  ) {}

  /**
   * Manually trigger processing of incomplete jobs
   * POST /v1/incomplete-jobs/process
   */
  @Post('process')
  async processIncompleteJobs() {
    try {
      this.logger.log('Manual trigger for incomplete jobs processing requested');
      
      const result = await this.incompleteJobsService.triggerIncompleteJobsProcessing();
      
      this.logger.log(`Manual processing completed: ${result.processed} processed, ${result.errors} errors`);
      
      return {
        status: 'success',
        message: 'Incomplete jobs processing completed',
        processed: result.processed,
        errors: result.errors,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Error in manual incomplete jobs processing:', error);
      throw new HttpException(
        'Failed to process incomplete jobs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get information about incomplete jobs processing configuration
   * GET /v1/incomplete-jobs/config
   */
  @Get('config')
  getConfig() {
    const config = getIncompleteJobsConfig();
    
    return {
      job_timeout_minutes: config.jobTimeoutMinutes,
      cron_schedule: config.cronSchedule,
      average_calculation_days: config.averageCalculationDays,
      enable_automatic_processing: config.enableAutomaticProcessing,
      description: 'Configuration for incomplete jobs processing',
      default_values: config.defaultKpiValues
    };
  }
}
