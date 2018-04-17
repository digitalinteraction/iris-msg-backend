import { Schema, Types } from 'mongoose'
import { MemberRole } from '../types'

const schemaOptions = {
  timestamps: true
}

export interface IMember extends Types.Subdocument {
  role: MemberRole
  confirmedOn?: Date
  deletedOn?: Date
  user: Schema.Types.ObjectId
}

export const MemberSchema = new Schema({
  role: {
    type: String,
    enum: Object.values(MemberRole),
    index: true
  },
  confirmedOn: {
    type: Date
  },
  deletedOn: {
    type: Date
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, schemaOptions)
