import * as firebase from 'firebase-admin'

export function makeFirebaseMessenger (): firebase.messaging.Messaging {
  return firebase.messaging()
}
