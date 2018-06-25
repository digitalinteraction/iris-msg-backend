import { Task } from './Task'
import { IModelSet } from '../models'

export interface ITwilioContext {
  models: IModelSet
}

export class TwilioTask extends Task<ITwilioContext> {
  
  async run (ctx: ITwilioContext) {
    
    // Get twilio paged messages (sorted by priority)
    
    // Send the messages
    
  }
  
}
