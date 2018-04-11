import { Schema, Document, Types } from 'mongoose'
import { MemberSchema, IMember } from './Member.schema'

const schemaOptions = {
  timestamps: true
}

export interface IOrganisation extends Document {
  name: String
  description: String
  locale: String
  members: Types.DocumentArray<IMember>
}

export const OrganisationSchema = new Schema({
  name: {
    type: String
  },
  description: {
    type: String
  },
  locale: {
    type: String
  },
  members: {
    type: [ MemberSchema ]
  }
}, schemaOptions)
