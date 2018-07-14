# Iris Api Server


## Environment Variables

| Name | Description |
| ---- | ----------- |
| `MONGO_URI`       | Where the mongo database is and how to connect to it, [more info](https://docs.mongodb.com/manual/reference/connection-string/) |
| `JWT_SECRET`      | The secret for json web tokens, [more info](https://jwt.io/introduction/) |
| `API_URL`         | The public url of this api, e.g. `https://api.irismsg.io` |
| `WEB_URL`         | The public url of the web, e.g. `https://web.irismsg.io` (not currently used) |
| `SHRINK_URL`      | **optional** – The public url of the url shrinker if you want sms links to be shrank, points to a [shrinky-link](https://github.com/robb-j/shrinky-link/) instance, e.g. `http://shrinky:3000` |
| `SHRINK_KEY`      | Your key for shrinky-link, used to generate short links |
| `TWILIO_TOKEN`    | Your twilio access token, [more info](https://www.twilio.com/docs/sms) |
| `TWILIO_SID`      | Your twilio sid |
| `TWILIO_NUMBER`   | Your twilio number, the number service sms will be sent from |
| `TWILIO_FALLBACK` | If the sms donation algorithm should fall back to using twilio |
| `FIREBASE_DB`     | Where your firebase database is |

## Mounted Files

| File | Description |
| ---- | ----------- |
| `/app/assetlinks.json`     | Your android asset links file, [more info](https://developers.google.com/digital-asset-links/v1/getting-started) |
| `/app/google-account.json` | Your Firebase account file, [more info](https://firebase.google.com/docs/admin/setup) |

## Dev Notes

```bash

# Run a mongo (in one terminal window)
npm run mongo:once

# Run the docker image once (in a different window)
docker run -it --rm \
  -p 3000:3000 \
  --link iris_mongo \
  --env-file .env \
  -e MONGO_URI=mongodb://iris_mongo/iris \
  -v `pwd`/google-account.json:/app/google-account.json \
  openlab.ncl.ac.uk:4567/iris/api

```
