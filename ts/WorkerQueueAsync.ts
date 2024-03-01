// 2024.02.29 Atlee Brink
// A class that provides async worker callbacks.

// TODO: not done yet, need to coordinate with the worker what the unique id key will be; maybe can't use a Symbol() here unless it is also communicated once

export class WorkerQueueAsync {
  constructor(worker: Worker) {
    this.worker = worker
    worker.addEventListener('message', (message: MessageEvent) => {
      const data: any & {[WorkerQueueAsync.idKey]: number} = message.data
      const id = data[WorkerQueueAsync.idKey]
      const resolver = this.resolvers.get(id)
      if (resolver) {
        resolver(data)
        this.resolvers.delete(id)
      }
    })
  }

  postMessageAsync<ReturnType>(data: any & {[WorkerQueueAsync.idKey]: number}, transfer: Transferable[]) {
    const id = this.id++
    data[WorkerQueueAsync.idKey] = id
    return new Promise<ReturnType>((resolve, reject) => {
      this.resolvers.set(id, data => resolve(data as ReturnType))
      this.worker.postMessage(data, transfer)
    })
  }

  private readonly worker: Worker
  private id = 0
  private resolvers = new Map<number, (data: any) => void>()

  static readonly idKey = Symbol()
}
