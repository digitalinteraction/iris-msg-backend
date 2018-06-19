import { EventEmitter } from 'events'

// import cron = require('cron-parser')
// import cron = require('node-cron')

// export enum TaskSync {
//   Minute, Hour, Day
// }

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
  // internalTask: cron.ScheduledTask | null = null
  
  constructor (
    public interval: TaskInterval | null = null,
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
    if (!this.interval || this.timerId) return
    
    // Schedule the tick
    this.timerId = setInterval(
      () => this.tick(ctx),
      this.intervalToMs(this.interval)
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

//
// [WIP] ~ Improvement over node-cron
//
// export class CronTask<T> extends Task<T> {
//   timerId: NodeJS.Timer | null = null
//
//   public schedule (ctx: T) {
//     // Do nothing if without an interval or already running
//     if (!this.interval || this.timerId) return
//
//     // Work out the time to the first cron
//     let cronExpr = cron.parseExpression(this.interval, {
//       tz: process.env.TZ || 'Europe/London'
//     })
//
//     // Fail if not valid
//     if (!cronExpr) return
//
//     // Work out when the next tick should be
//     let now = (new Date()).getTime()
//     let next = cronExpr.next().getTime()
//
//     // Start the tick
//     this.timerId = setTimeout(() => this.tick(ctx), next - now)
//   }
//
//   private async tick (ctx: T) {
//
//     // Reschedule the task
//     this.timerId = null
//     this.schedule(ctx)
//
//     try {
//       // Run our task & remember we are running
//       this.isRunning = true
//       await this.run(ctx)
//     } catch (err) {
//       console.log('TaskError', err.message)
//     } finally {
//       this.isRunning = false
//     }
//   }
// }
