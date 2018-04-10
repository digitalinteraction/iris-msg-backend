FROM node:9-alpine as base
WORKDIR /app
COPY ["package.json", "package-lock.json", "tsconfig.json", "/app/"]

# A builder image to compile the typescript and install modules
FROM base as builder
RUN npm install -s --production \
  && mkdir -p /app/node_modules \
  && cp -R node_modules node_modules_prod \
  && npm install -s > /dev/null
COPY src /app/src
RUN npm run build -s

# From the base, copy the dist and node modules out
FROM base as dist
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules_prod /app/node_modules
CMD [ "npm", "start", "-s" ]
