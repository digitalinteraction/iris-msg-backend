import * as firebase from 'firebase-admin'

export let firebaseApp: firebase.app.App | undefined = undefined

export function firebaseEnabled (): boolean {
  return process.env.FIREBASE_PROJ_ID &&
    process.env.FIREBASE_PROJ_ID !== ''
}

export async function initializeFirebase () {
  // let config = getGoogleConfig()
  // console.log(config)
  // if (!config) return
  
  firebaseApp = firebase.initializeApp({
    projectId: process.env.FIREBASE_PROJ_ID
    // credential: firebase.credential.cert(config)
    // databaseURL: 'https://<database_name>.firebaseio.com'
  })
  
  console.log(firebaseApp)
}

// export function getGoogleConfig (): firebase.AppOptions | null {
//   try {
//     let config = require('../../google-services.json')
//     return config
//   } catch (err) {
//     return null
//   }
// }

export function makeFirebaseMessenger (): firebase.messaging.Messaging {
  return firebase.messaging(firebaseApp)
}
