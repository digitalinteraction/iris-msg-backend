import { Schema, Types } from 'mongoose'
import { IBaseSubModel, MemberRole } from '../types'

const schemaOptions = {
  timestamps: true
}

export interface IMember extends IBaseSubModel {
  role: MemberRole
  confirmedOn: Date | null
  deletedOn: Date | null
  user: Types.ObjectId
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
