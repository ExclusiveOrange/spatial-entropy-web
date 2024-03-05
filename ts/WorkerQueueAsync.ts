// 2024.02.29 Atlee Brink
// A class that provides async worker callbacks.

import { Job, JobError, JobSuccess, JobUID } from "./WorkerJob.js"

export class WorkerQueueAsync {
  constructor(worker: Worker) {
    this.worker = worker
    worker.addEventListener('message', ({ data: result }: MessageEvent<JobUID & (JobError | JobSuccess)>) => {
      const resolvers = this.pendingJobs.get(result.jobUid)
      if (!resolvers)
        throw Error(`worker responded to main with an invalid jobUid`)
      this.pendingJobs.delete(result.jobUid)
      if (result.success)
        resolvers.resolve(result.return)
      else
        resolvers.reject(result.error)
    })
  }

  postJobAsync<ReturnType>(job: Job, transferables?: Transferable[]): Promise<ReturnType> {
    const jobUid = this.id++
    const jobWithUid: Job & JobUID = { jobUid, ...job }
    return new Promise<ReturnType>((resolve, reject) => {
      this.pendingJobs.set(jobUid, {resolve, reject})
      if (transferables)
        this.worker.postMessage(jobWithUid, transferables)
      else
        this.worker.postMessage(jobWithUid)
    })
  }

  private readonly worker: Worker
  private id = 0
  private pendingJobs = new Map<number, {resolve: (value?: any) => void, reject: (reason?: any) => void}>()
}
