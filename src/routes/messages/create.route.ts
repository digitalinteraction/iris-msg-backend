import { RouteContext, MemberRole, MessageAttemptState } from '@/src/types'
import { IMember, IUser, IOrganisationWithUsers, IMessageAttempt } from '@/src/models'
import { ObjectId } from 'mongodb'
import { MongooseDocument } from 'mongoose'

function makeError (name: string) {
  return `api.messages.create.${name}`
}

export default async ({ req, api, models, authJwt }: RouteContext) => {
  
  // Check the request body
  let { orgId, content } = req.body
  let errors = new Set<string>()
  if (!content) errors.add(makeError('badContent'))
  if (!orgId) errors.add(makeError('badContent'))
  if (errors.size > 0) throw errors
  
  // Check the user is valid
  let user = await models.User.findWithJwt(authJwt)
  if (!user) throw new Error('api.general.badAuth')
  
  // Check the org is valid
  let org: IOrganisationWithUsers = await models.Organisation.findByIdForCoordinator(orgId, user.id)
    .populate('members.user') as any
  if (!org) throw makeError('notFound')
  
  // Cache now as a date
  let now = new Date()
  
  // Fetch active donors
  let donorList = org.members.filter(member => {
    let user: IUser = member.user as any
    return member.role === MemberRole.Donor &&
      isActiveMember(member, user, now) &&
      user.fcmToken !== null
  })
  
  // Fetch active subscribers
  let subscriberList = org.members.filter(member => {
    let user: IUser = member.user as any
    return member.role === MemberRole.Subscriber &&
      isActiveMember(member, user, now)
  })
  
  // Allocate each subscriber a donor to send the message
  let allocation = roundRobin(
    subscriberList.map(d => (d.user as any).id),
    donorList.map(d => (d.user as any).id)
  )
  
  // Create the message
  let message = new models.Message({
    content,
    organisation: orgId,
    author: user.id
  })
  
  // Add an attempt for each allocation
  Object.keys(allocation).forEach(subscriberId => {
    message.attempts.push({
      state: MessageAttemptState.Pending,
      recipient: subscriberId,
      donor: allocation[subscriberId]
    })
  })
  
  // Store the message
  await message.save()
  
  // TODO: send out fcm's to each donor
  
  // let message
  api.sendData('ok')
}

type KeyedType<T> = { [id: string]: T }

function keyById<T extends MongooseDocument> (docs: T[]): KeyedType<T> {
  return docs.reduce((mapping, model) => {
    mapping[model.id] = model
    return mapping
  }, {} as KeyedType<T>)
}

function isActiveMember (member: IMember, user: IUser, since: Date): boolean {
  return member.confirmedOn !== null &&
    member.confirmedOn <= since &&
    member.deletedOn === null &&
    user.verifiedOn !== null &&
    user.verifiedOn <= since
}

// function activeMembers (members: IMember[], role: MemberRole): IMember[] {
//   let now = new Date()
//
//   return members.filter(member => {
//     let user: IUser = member.user as any
//     return
//   })
// }

/**
 * Allocates each item in setA an item from setB,
 * returning a mapping of setA items to their allocation from setB
 * e.g. If setA was people and setB was hats, each person would be given a hat
 * and some people might get allocated the same hats
 *
 * Adapted from https://openlab.ncl.ac.uk/gitlab/what-futures/api/blob/master/web/utils/allocator.js
 */
function roundRobin<T> (setA: string[], setB: T[], shuffle = true): { [id: string]: T } {
  
  // Shuffle b if asked to
  if (shuffle) setB = shuffleArray(setB)
  
  // Create iterators
  let bIndex = 0
  let mapping: { [id: string]: T } = {}
  
  // Iterate the things in setA
  setA.forEach(a => {
    
    // Allocate the next thing in setB
    mapping[a] = setB[bIndex]
    
    // Move to the next thing in setB (looping around)
    bIndex = (bIndex + 1) % setB.length
  })
  
  // Return the mapping
  return mapping
}

/**
 * Shuffles an array in place ~> https://stackoverflow.com/a/6274381/1515924
 */
function shuffleArray<T> (a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
