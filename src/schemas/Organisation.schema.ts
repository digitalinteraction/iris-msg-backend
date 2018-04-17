import { Schema, Document, Types, DocumentQuery, Model } from 'mongoose'
import { MemberSchema, IMember } from './Member.schema'

const schemaOptions = {
  timestamps: true
}

export interface IOrganisation extends Document {
  name: String
  description: String
  locale: String
  members: Types.DocumentArray<IMember>
  deletedOn: Date | null
}

export type IOrganisationClass = Model<IOrganisation> & {
  findForUser (userId: any): DocumentQuery<IOrganisation[], IOrganisation>
}

export const OrganisationSchema = new Schema({
  name: {
    type: String
  },
  info: {
    type: String
  },
  locale: {
    type: String
  },
  members: {
    type: [ MemberSchema ]
  },
  deletedOn: {
    type: Date
  }
}, schemaOptions)

OrganisationSchema.static('findForUser', function (this: typeof Model, userId: any) {
  return this.find({
    deletedOn: null,
    members: {
      $elemMatch: {
        user: userId,
        confirmedOn: { $ne: null },
        deletedOn: null
      }
    }
  })
})
