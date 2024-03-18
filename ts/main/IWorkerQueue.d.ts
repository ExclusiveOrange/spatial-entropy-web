// 2024.03.18 Atlee Brink
// Interface for MultiWorkers and WorkerQueueAsync

import { Job } from "../common/Job.js"

export interface IWorkerQueue {
  postJobAsync<ReturnType>(job: Job, transferables?: Transferable[]): Promise<ReturnType>
}