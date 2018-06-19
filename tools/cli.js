#! /usr/bin/env node

require('dotenv').config()

const cli = require('commander')
const prompts = require('prompts')

const jwt = require('jsonwebtoken')
const firebase = require('firebase-admin')

const MessageTypes = {
  new_donations: {
    title: '[dev] You have new donations',
    body: 'Organisations need you help!'
  }
}

cli.version('0.1.0')

// A command to send an fcm to a device
cli.command('fcm')
  .description('Send an fcm to a device')
  .option('-d, --deviceToken <token>', 'The fcm token of the device')
  .option('-t, --type <type>', 'The type of fcm')
  .option('--sandbox', 'Whether to sandbox or not')
  .action(fcmCommand)

// A command to get a jwt for a given user id
cli.command('jwt')
  .description('Generate an fcm for a user')
  .option('-u, --user <user>', 'The user to generate for')
  .action(jwtCommand)

// A command to initialy seed the database for dev
cli.command('seed')
  .description('Seed the database for dev')
  .option('-p, --phone <phone>', 'The phone number of the initial user')
  .action(seedCommand)

// cli.command()

// Process cli args or fallback to a help page
cli.parse(process.argv)
if (process.argv.length === 2) cli.help()

// Handle the fcm command
async function fcmCommand (cmd, ...args) {
  let { deviceToken, type, sandbox } = cmd
  
  // Ask for a type if not provided
  if (!type) {
    let answer = await prompts({
      type: 'select',
      name: 'type',
      message: 'Pick fcm type',
      choices: [
        { title: 'New Donations', value: 'new_donations' },
        { title: 'Data only', value: 'data' },
        { title: 'Custom', value: 'custom' }
      ]
    })
    type = answer.type
  }
  
  // Ask for a device token if not provided
  if (!deviceToken) {
    let answer = await prompts({
      type: 'text',
      name: 'deviceToken',
      message: 'Enter device fcm token'
    })
    deviceToken = answer.deviceToken
  }
  
  // Pick a message depending on the type
  let notification = MessageTypes[type]
  
  // Ask for a notification if not provided
  if (!notification && type === 'custom') {
    notification = await prompts([
      { type: 'text', name: 'title', message: 'Notification title' },
      { type: 'text', name: 'body', message: 'Notification body' }
    ])
  }
  
  // Stop if any variable isn't set
  if (!notification.title || !notification.body || !type || !deviceToken) return
  
  try {
    // Configure firebase
    const config = require('../google-account.json')
    let app = firebase.initializeApp({
      credential: firebase.credential.cert(config),
      databaseURL: process.env.FIREBASE_DB
    })
    
    // Send the fcm (optionally in sandbox using a cli arguement)
    let res = await firebase.messaging(app).send({
      data: { type },
      notification,
      token: deviceToken
    }, !!sandbox)
    
    console.log('FCM Sent!', res)
  } catch (err) {
    console.log('Firebase failed')
    console.log(err.message)
  }
  
  // Exit nicely
  process.exit(0)
}

async function jwtCommand (cmd, ...args) {
  
  // Ask for the user's id
  let answer = await prompts([
    { type: 'text', name: 'user', message: 'User id' }
  ])
  
  // Stop if not set
  if (!answer.user) return
  
  // Sign the jwt
  let token = jwt.sign({ usr: answer.user }, process.env.JWT_SECRET)
  
  // Print the jwt
  console.log('jwt', token)
  
  // Exit nicely
  process.exit(0)
}

async function seedCommand (cmd, ...args) {
  
  let { phoneNumber, locale = 'GB' } = cmd
  
  // Get the phone number
  
  // Get the org name or a default
  
  // Create the initial user
  
  // Create an organisation
  
  // Add the user as a subscriber
  
  // Return the user's jwt
}
