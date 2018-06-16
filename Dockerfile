FROM node:10-alpine as base
WORKDIR /app
COPY ["package.json", "package-lock.json", "tsconfig.json", "/app/"]

# A builder image to compile the typescript and install modules
FROM base as builder
RUN npm ci -s
COPY tools /app/tools
COPY locales /app/locales
COPY seeds /app/seeds
COPY api /app/api
COPY src /app/src
RUN npm run build -s
RUN npm run build:docs -s

# Run tests
# FROM builder as tester
# RUN npm test -s

# From the base, copy the dist and node modules out
FROM base as dist
RUN npm ci --production -s
COPY --from=builder /app/dist /app/src
COPY --from=builder /app/docs /app/docs
CMD [ "npm", "start", "-s" ]
