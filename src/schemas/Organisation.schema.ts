import { Schema, Types, DocumentQuery, Model } from 'mongoose'
import { MemberSchema, IMember } from './Member.schema'
import { IBaseModel, MemberRole, AllMemberRoles } from '../types'

const schemaOptions = {
  timestamps: true
}

export interface IOrganisation extends IBaseModel {
  name: string
  info: string
  locale: string
  members: Types.DocumentArray<IMember>
  deletedOn: Date | null
  
  activeSubscribers: IMember[]
  activeDonors: IMember[]
  toJSONWithActiveMembers (): any
}

export type IOrganisationClass = Model<IOrganisation> & {
  findForUser (userId: any)
    : DocumentQuery<IOrganisation[], IOrganisation>
  
  findByIdForCoordinator (orgId: any, userId: any)
    : DocumentQuery<IOrganisation | null, IOrganisation>
  
  memberQuery (
    role?: MemberRole | MemberRole[],
    user?: Types.ObjectId | string,
    overrides?: object
  ): object
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

OrganisationSchema.static(
  'memberQuery',
  function (
    this: typeof Model,
    role?: MemberRole | MemberRole[],
    user?: Types.ObjectId | string,
    overrides: object = {}
  ): object {
    if (!role) role = AllMemberRoles
    
    let subQuery: any = {
      deletedOn: null,
      confirmedOn: { $ne: null }
    }
    
    if (role) subQuery.role = role
    if (user) subQuery.user = user
    
    return {
      deletedOn: null,
      members: {
        $elemMatch: { ...subQuery, ...overrides }
      }
    }
  }
)

OrganisationSchema.virtual('activeDonors').get(function (this: IOrganisation) {
  return this.members.filter(member =>
    member.role === MemberRole.Donor &&
    member.deletedOn === null &&
    member.confirmedOn !== null
  )
})

OrganisationSchema.methods.toJSONWithActiveMembers = function (this: IOrganisation) {
  return {
    ...this.toJSON(),
    members: this.members.filter(member => member.isActive)
  }
}
