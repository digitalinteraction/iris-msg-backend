FROM node:10-alpine as base
WORKDIR /app
VOLUME /app/logs
EXPOSE 3000
HEALTHCHECK CMD curl -f 127.0.0.1:3000/health || exit 1
RUN apk add -q --no-cache curl
COPY ["package.json", "package-lock.json", "tsconfig.json", "/app/"]
RUN npm install --no-audit --no-optional -s

# A builder image to compile the typescript and install modules
FROM base as builder
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
RUN npm prune --production -s
COPY locales /app/locales
COPY --from=builder /app/dist /app
COPY --from=builder /app/docs /app/docs
COPY tools/cli.js /app/tools/cli.js
RUN ln -s /app/tools/cli.js /usr/local/bin/cli \
  && chmod +x /usr/local/bin/cli
CMD [ "npm", "start", "-s" ]
