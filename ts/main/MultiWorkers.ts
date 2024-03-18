// 2024.03.18 Atlee Brink
// Crude multi-worker wrapper for potentially multiple WebWorkers each using a simple WorkerQueueAsync.
// Does not implement a shared queue! Simple cycles through a small, fixed number of workers.

import { Job } from "../common/Job.js"
import { IWorkerQueue } from "./IWorkerQueue.js"
import { WorkerQueueAsync } from "./WorkerQueueAsync.js"

export class MultiWorkers implements IWorkerQueue {
  constructor(maxConcurrency: number, scriptURL: string, options?: WorkerOptions | undefined) {
    const concurrency = Math.min(maxConcurrency, navigator.hardwareConcurrency)
    for (let i = 0; i < concurrency; ++i)
      this.workerQueues.push(new WorkerQueueAsync(new Worker(scriptURL, options)))
  }

  postJobAsync<ReturnType>(job: Job, transferables?: Transferable[]): Promise<ReturnType> {
    this.iworker %= this.workerQueues.length
    const queue = this.workerQueues[this.iworker]
    ++this.iworker
    return queue.postJobAsync(job, transferables)
  }

  private readonly workerQueues: WorkerQueueAsync[] = []
  private iworker = 0
}