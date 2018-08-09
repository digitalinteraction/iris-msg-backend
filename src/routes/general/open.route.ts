import { RouteContext } from '@/src/types'

function makeError (name: string) {
  return `api.open.${name}`
}

const inviteTest = /invite\/.*/
const donateTest = /donate/

const downloadAppTemplate = (title: string, appLink: string) => `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Iris Msg</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.1/css/bulma.min.css">
  <style>
  .is-monospace { font-family: "SFMono-Regular",Consolas,"Liberation Mono",Menlo,Courier,monospace; }
  .is-vertical { vertical-align: middle; }
  </style>
</head>
<body>
  
  <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-brand">
        <p class="navbar-item">
          <svg version="1.1" baseProfile="full" width="300" height="36" xmlns="http://www.w3.org/2000/svg">
            <text class="is-monospace" x="0" y="28" font-size="32" text-anchor="start" font-weight="bold" fill="white">irismsg.io/open</text>
          </svg>
        </p>
      </div>
    </div>
  </nav>
  
  <div class="hero is-info">
    <div class="hero-body">
      <div class="container">
        <h1 class="title">${title}</h1>
        <h2 class="subtitle">The open sms donation platform</h2>
      </div>
    </div>
  </div>
  <section class="section">
    <div class="container">
      <div class="notification is-warning is-inline-block">
        <h1 class="title">❌  Couldn't open app</h1>
      </div>
      <p class="subtitle">You have opened a link which should open with <strong>Iris Msg</strong>, but it doesn't look like you have the app installed</p>
      <h2 class="heading is-size-4"> What to do </h2>
      <ol class="is-size-5 content">
        <li>
          <a class="button is-link is-vertical" href="${appLink}" target="_blank">Download</a>
          the app
        </li>
        <li>
          <button class="button is-success is-vertical" onclick="window.open(location.href)"> Reload </button>
          to trigger the link again
        </li>
      </ol>
    </div>
  </section>
</body>
</html>`

/* params
 * - 0
 */
export default async (ctx: RouteContext) => {
  
  let path = ctx.req.params[0]
  
  if (inviteTest.exec(path)) return handleInvite(ctx)
  else if (donateTest.exec(path)) return handleDonate(ctx)
  else return ctx.next()
}

export function handleInvite ({ req, res }: RouteContext) {
  res.send(downloadAppTemplate('Your invitation', process.env.PLAY_STORE_URL!))
}

export function handleDonate ({ req, res }: RouteContext) {
  res.send(downloadAppTemplate('Donation Request', process.env.PLAY_STORE_URL!))
}
