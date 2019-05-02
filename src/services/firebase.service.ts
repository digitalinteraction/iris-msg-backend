import firebase from 'firebase-admin'
import { LocalI18n } from '@/src/i18n'
import { IUser } from '@/src/models'
import { FcmType } from '@/src/types'
import winston from 'winston'

export let firebaseApp: firebase.app.App | undefined = undefined

const firebaseConfig = getGoogleConfig()

export function firebaseEnabled (): boolean {
  return process.env.FIREBASE_DB !== undefined &&
    firebaseConfig !== null
}

export function firebaseSandbox (): boolean {
  return !!process.env.FIREBASE_SANDBOX
}

export function initializeFirebase () {
  if (firebaseConfig === null) return
  
  firebaseApp = firebase.initializeApp({
    credential: firebase.credential.cert(firebaseConfig),
    databaseURL: process.env.FIREBASE_DB
  })
}

export function getGoogleConfig (): firebase.AppOptions | null {
  try {
    return require('../../google-account.json')
  } catch (err) {
    return null
  }
}

export function makeFirebaseMessenger (): firebase.messaging.Messaging {
  return firebase.messaging(firebaseApp)
}

export async function sendNewDonationFcm (
  messenger: firebase.messaging.Messaging,
  user: IUser,
  i18n: LocalI18n,
  log: winston.Logger
): Promise<string | null> {
  
  log.debug(`[Firebase] sending '${FcmType.NewDonations}' fcm to ${user.id}`)
  
  return messenger.send({
    notification: {
      title: i18n.translate('fcm.new_donations.title'),
      body: i18n.translate('fcm.new_donations.body')
    },
    data: {
      type: FcmType.NewDonations
    },
    android: {
      priority: 'high',
      ttl: 30 * 60 * 1000,
      notification: {
        icon: 'ic_notifications_black_24dp',
        color: '#1289b2',
        tag: 'new_donations',
        clickAction: 'fcm.action.DONATE'
      }
    },
    token: user.fcmToken!
  }).catch(err => {
    log.error('[FirebaseService] failed to send fcm', {
      msg: err.message,
      user: user.id,
      fcmToken: user.fcmToken
    })
    return null
  })
  
}
