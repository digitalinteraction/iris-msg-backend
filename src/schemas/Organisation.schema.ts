import { Schema, Document, Types, DocumentQuery, Model } from 'mongoose'
import { MemberSchema, IMember } from './Member.schema'
import { MemberRole } from '../types'

const schemaOptions = {
  timestamps: true
}

export interface IOrganisation extends Document {
  name: String
  info: String
  locale: String
  members: Types.DocumentArray<IMember>
  deletedOn: Date | null
}

export type IOrganisationClass = Model<IOrganisation> & {
  findForUser (userId: any)
    : DocumentQuery<IOrganisation[], IOrganisation>
  
  findByIdForCoordinator (orgId: any, userId: any)
    : DocumentQuery<IOrganisation | null, IOrganisation>
}

export const OrganisationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  info: {
    type: String,
    required: true
  },
  locale: {
    type: String
  },
  members: {
    type: [ MemberSchema ]
  },
  deletedOn: {
    type: Date,
    default: null
  }
}, schemaOptions)

OrganisationSchema.static(
  'findForUser',
  function (this: typeof Model, userId: any) {
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
  }
)

OrganisationSchema.static(
  'findByIdForCoordinator',
  function (this: typeof Model, orgId: any, userId: any) {
    return this.findOne({
      _id: orgId,
      deletedOn: null,
      members: {
        $elemMatch: {
          user: userId,
          confirmedOn: { $ne: null },
          deletedOn: null,
          role: MemberRole.Coordinator
        }
      }
    })
  }
)
