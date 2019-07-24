import { Task } from '../Task'

jest.useFakeTimers()

describe('Task', () => {
  describe('#constructor', () => {
    it('should set default parameters', async () => {
      let task = new Task()
      expect(task.isRunning).toBe(false)
      expect(task.interval).toBe(null)
      expect(task.executor).toBe(null)
    })
  })

  describe('#schedule', () => {
    let task: Task<any>
    let exec: any
    beforeEach(async () => {
      let interval = { seconds: 1 }
      exec = jest.fn()
      task = new Task<any>(interval, exec)
    })

    it('should set the first timer', async () => {
      task.schedule(null)
      expect(task.timerId).not.toBeNull()
      expect(setInterval).toHaveBeenCalledTimes(1)
      expect(setInterval).toBeCalledWith(expect.any(Function), 1000)
    })

    it('should run the task regularly', async () => {
      let ctx = {}
      task.schedule(ctx)
      jest.runOnlyPendingTimers()
      expect(exec).toHaveBeenCalledTimes(1)
      expect(exec).toBeCalledWith(ctx)
    })
  })

  describe('#intervalToMs', () => {
    let task = new Task<any>()

    it('should convert milliseconds', async () => {
      let t = task.intervalToMs({ milliseconds: 550 })
      expect(t).toBe(550)
    })

    it('should convert seconds', async () => {
      let t = task.intervalToMs({ seconds: 5 })
      expect(t).toBe(5000)
    })

    it('should convert minutes', async () => {
      let t = task.intervalToMs({ minutes: 4 })
      expect(t).toBe(4 * 60 * 1000)
    })

    it('should convert hours', async () => {
      let t = task.intervalToMs({ hours: 3 })
      expect(t).toBe(3 * 60 * 60 * 1000)
    })

    it('should convert days', async () => {
      let t = task.intervalToMs({ days: 2 })
      expect(t).toBe(2 * 24 * 60 * 60 * 1000)
    })

    it('should combine units', async () => {
      let t = task.intervalToMs({ hours: 1, minutes: 32, seconds: 5 })
      expect(t).toBe(3600000 + 1920000 + 5000)
    })
  })

  describe('#tick', () => {
    let task: any
    let executor: any

    beforeEach(async () => {
      executor = jest.fn()
      task = new Task({ seconds: 1 }, executor)
    })

    it('should call the executor', async () => {
      let ctx = {}
      await task.tick(ctx)
      expect(executor).toBeCalledWith(ctx)
    })

    it('should not allow concurrency', async () => {
      let ctx = {}
      await Promise.all([task.tick(ctx), task.tick(ctx)])
      expect(executor).toHaveBeenCalledTimes(1)
    })

    it('should emit errors', async () => {
      let spy = jest.fn()
      task.on('error', spy)
      task.executor = () => {
        throw new Error('Failed')
      }
      await task.tick({})

      expect(spy).toBeCalledWith(expect.any(Error))
    })
  })
})
