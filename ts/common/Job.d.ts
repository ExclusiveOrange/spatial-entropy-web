// 2024.03.02 Atlee Brink

export interface JobUID {
  jobUid: number // unique for each message
}

export interface Job {
  jobName: string // see each Job_*.ts file for the respective jobName string
  jobArgs: any    // depends on the job
}

export type JobResult<ReturnType = any> = { return: ReturnType, transferables?: Transferable[] }

export interface JobError {
  success: false
  error: Error
}

export interface JobSuccess {
  success: true
  return: any
}