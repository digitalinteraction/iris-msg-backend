import * as firebase from 'firebase-admin'

export let firebaseApp: firebase.app.App | undefined = undefined

const firebaseConfig = getGoogleConfig()

export function firebaseEnabled (): boolean {
  return process.env.FIREBASE_DB &&
    process.env.FIREBASE_DB !== '' &&
    firebaseConfig !== null
}

export function firebaseSandbox (): boolean {
  return process.env.FIREBASE_SANDBOX
}

export async function initializeFirebase () {
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
