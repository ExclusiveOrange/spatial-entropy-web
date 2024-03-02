// 2024.03.02 Atlee Brink

export interface JobUID {
  jobUid: number // unique for each message
}

export interface Job {
  jobName: string // such as "spatial_entropy_u8", or whatever was agreed upon
  jobArgs: any    // depends on the job
}
