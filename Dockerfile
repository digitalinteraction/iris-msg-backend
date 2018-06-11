FROM node:10-alpine as base
WORKDIR /app
COPY ["package.json", "package-lock.json", "tsconfig.json", "/app/"]

# A builder image to compile the typescript and install modules
FROM base as builder
RUN npm ci
COPY tools /app/tools
COPY locales /app/locales
COPY seeds /app/seeds
COPY src /app/src
RUN npm run build -s

# Run tests
# FROM builder as tester
# RUN npm test -s

# From the base, copy the dist and node modules out
FROM base as dist
RUN npm ci --production
COPY --from=builder /app/dist /app/dist
CMD [ "npm", "start", "-s" ]
