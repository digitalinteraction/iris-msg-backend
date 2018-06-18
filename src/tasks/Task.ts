import cron = require('node-cron')

export interface TaskContext {
  
}

export class Task {
  interval: string | null = null
  isRunning: boolean = false
  
  async run (ctx: TaskContext) { /* ... */ }
  
  schedule (ctx: TaskContext) {
    // Do nothing if without an interval or already running
    if (!this.interval || this.isRunning) return
    
    // Error if the interval is invalid
    if (!cron.validate(this.interval)) {
      return console.log(`Invalid task cron '${this.interval}'`)
    }
    
    // Schedule our tick based on the interval
    cron.schedule(this.interval, async () => {
      try {
        // Run our task & remember we are running
        this.isRunning = true
        await this.run(ctx)
      } catch (err) {
        console.log('TaskError', err.message)
      } finally {
        this.isRunning = false
      }
    })
  }
}
