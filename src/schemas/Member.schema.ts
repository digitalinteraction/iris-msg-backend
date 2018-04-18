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
    index: true,
    required: true
  },
  confirmedOn: {
    type: Date,
    default: null
  },
  deletedOn: {
    type: Date,
    default: null
  },
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, schemaOptions)
