//
// The entrypoint to running the API
//

import App from './App'
;(async () => {
  try {
    App.create().run()
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
})()
