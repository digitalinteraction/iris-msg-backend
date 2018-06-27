# Iris Api Server


**notes**

```bash

# Run a mongo
npm run mongo:once

# Run the docker image once
docker run -it --rm \
  -p 3000:3000 \
  --link iris_mongo \
  --env-file .env \
  -e MONGO_URI=mongodb://iris_mongo/iris \
  -v `pwd`/google-account.json:/app/google-account.json \
  openlab.ncl.ac.uk:4567/iris/api

```
