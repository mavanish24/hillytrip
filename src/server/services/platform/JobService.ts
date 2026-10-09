import { BackgroundJobItem, BackgroundJobStatus } from '../../../types/platform';
import { loggingService } from './LoggingService';

class JobService {
  private jobs: BackgroundJobItem[] = [
    {
      id: 'job-101',
      jobType: 'REBUILD_SEARCH_INDEX',
      payload: { targetCategory: 'homestays', forceRefresh: true },
      status: 'completed',
      retries: 0,
      maxRetries: 3,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      startedAt: new Date(Date.now() - 7195000).toISOString(),
      completedAt: new Date(Date.now() - 7180000).toISOString(),
      executionTimeMs: 15000
    },
    {
      id: 'job-102',
      jobType: 'GENERATE_SITEMAP',
      payload: { routesCount: 142 },
      status: 'completed',
      retries: 0,
      maxRetries: 3,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      startedAt: new Date(Date.now() - 3598000).toISOString(),
      completedAt: new Date(Date.now() - 3590000).toISOString(),
      executionTimeMs: 8000
    },
    {
      id: 'job-103',
      jobType: 'DAILY_ANALYTICS',
      payload: { date: '2026-07-27' },
      status: 'completed',
      retries: 0,
      maxRetries: 3,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      startedAt: new Date(Date.now() - 1798000).toISOString(),
      completedAt: new Date(Date.now() - 1750000).toISOString(),
      executionTimeMs: 48000
    }
  ];

  public enqueueJob(jobType: string, payload: Record<string, any> = {}, maxRetries: number = 3): BackgroundJobItem {
    const newJob: BackgroundJobItem = {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      jobType,
      payload,
      status: 'pending',
      retries: 0,
      maxRetries,
      createdAt: new Date().toISOString()
    };

    this.jobs.unshift(newJob);
    loggingService.info('JobService', `Background job enqueued: ${jobType} (${newJob.id})`);

    // Simulate asynchronous execution
    setTimeout(() => {
      this.processJob(newJob.id);
    }, 500);

    return newJob;
  }

  private async processJob(jobId: string) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return;

    job.status = 'processing';
    job.startedAt = new Date().toISOString();
    const startTime = Date.now();

    try {
      loggingService.info('JobService', `Executing job ${job.jobType} (${job.id})...`);
      
      // Execute dummy job work
      await new Promise(resolve => setTimeout(resolve, 800));

      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.executionTimeMs = Date.now() - startTime;
      loggingService.info('JobService', `Job ${job.jobType} (${job.id}) completed successfully in ${job.executionTimeMs}ms`);
    } catch (err: any) {
      job.retries += 1;
      if (job.retries < job.maxRetries) {
        job.status = 'retrying';
        job.error = err.message || 'Job execution failed';
        loggingService.warn('JobService', `Job ${job.jobType} (${job.id}) failed, scheduled retry ${job.retries}/${job.maxRetries}`);
      } else {
        job.status = 'failed';
        job.error = err.message || 'Job execution failed after max retries';
        loggingService.error('JobService', `Job ${job.jobType} (${job.id}) PERMANENTLY FAILED: ${job.error}`);
      }
    }
  }

  public getJobs(status?: BackgroundJobStatus, limit: number = 50): BackgroundJobItem[] {
    let list = [...this.jobs];
    if (status) {
      list = list.filter(j => j.status === status);
    }
    return list.slice(0, limit);
  }

  public getActiveJobsCount(): number {
    return this.jobs.filter(j => j.status === 'processing' || j.status === 'pending').length;
  }

  public getFailedJobsCount(): number {
    return this.jobs.filter(j => j.status === 'failed').length;
  }

  public retryFailedJob(jobId: string): BackgroundJobItem | null {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return null;

    job.status = 'pending';
    job.retries = 0;
    job.error = undefined;
    
    setTimeout(() => {
      this.processJob(job.id);
    }, 200);

    return job;
  }
}

export const jobService = new JobService();
