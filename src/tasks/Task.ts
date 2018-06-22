import { EventEmitter } from 'events'

export type TaskInterval = {
  milliseconds?: number
  seconds?: number
  minutes?: number
  hours?: number
  days?: number
}

export type TaskExecutor<T> = (ctx: T) => Promise<any> | void

export class Task<T> extends EventEmitter {
  isRunning: boolean = false
  timerId: NodeJS.Timer | null = null
  
  get intervalInMs (): number | null {
    if (typeof this.interval === 'number') return this.interval
    if (typeof this.interval !== null) return this.intervalToMs(this.interval as any)
    return null
  }
  
  constructor (
    public interval: TaskInterval | number | null = null,
    public executor: TaskExecutor<T> | null = null
  ) {
    // Extra setup ...
    super()
  }
  
  async run (ctx: T) {
    if (!this.executor) return
    await this.executor(ctx)
  }
  
  public schedule (ctx: T) {
    // Do nothing if without an interval or already running
    if (!this.intervalInMs || this.timerId) return
    
    // Schedule the tick
    this.timerId = setInterval(
      () => this.tick(ctx),
      this.intervalInMs
    )
  }
  
  /** Convert an interval to milliseconds */
  intervalToMs (interval: TaskInterval): number {
    
    const get = (obj: TaskInterval, key: keyof TaskInterval) => obj[key] || 0
    
    let ms = 0
    ms += get(interval, 'milliseconds')
    ms += get(interval, 'seconds') * 1000
    ms += get(interval, 'minutes') * 1000 * 60
    ms += get(interval, 'hours') * 1000 * 60 * 60
    ms += get(interval, 'days') * 1000 * 60 * 60 * 24
    
    return ms
  }
  
  /** [internal] Run the timer once */
  private async tick (ctx: T) {
    // Do nothing if already in progress
    if (this.isRunning) return
    this.isRunning = true
    
    try {
      await this.run(ctx)
    } catch (err) {
      this.emit('error', err)
    } finally {
      this.isRunning = false
    }
  }
}
