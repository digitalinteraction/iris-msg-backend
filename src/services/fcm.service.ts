import * as firebase from 'firebase-admin'

export let firebaseApp: firebase.app.App | undefined = undefined

export function firebaseEnabled (): boolean {
  return firebaseApp !== null
}

export async function initializeFirebase () {
  let config = getGoogleConfig()
  if (!config) return
  
  firebaseApp = firebase.initializeApp({
    credential: firebase.credential.cert(config)
    // databaseURL: 'https://<database_name>.firebaseio.com'
  })
}

export function getGoogleConfig (): firebase.AppOptions | null {
  try {
    let config = require('../../google-services.json')
    return config
  } catch (err) {
    return null
  }
}

export function makeFirebaseMessenger (): firebase.messaging.Messaging {
  return firebase.messaging(firebaseApp)
}
