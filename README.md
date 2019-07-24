# Iris Api Server

This is the repo for the Iris Msg backend source code.
It is an [Express](https://expressjs.com/) server written in
[TypeScript](https://www.typescriptlang.org/)
and deployed through [Docker](https://www.docker.com/).

It connects to a [Mongo](https://www.mongodb.com/) database
using [Mongoose](https://mongoosejs.com/),
is unit tested using [jest](https://jestjs.io/),
has a [commander](https://www.npmjs.com/package/commander) CLI
and uses [ocelot-docs](https://www.npmjs.com/package/ocelot-docs)
to generate api documentation.

[What is Iris Msg?](https://github.com/iris-msg/about)

<!-- toc-head -->

## Table of contents

- [Development](#development)
  - [Setup](#setup)
  - [Regular use](#regular-use)
  - [Irregular use](#irregular-use)
  - [Code Structure](#code-structure)
  - [Route definitions](#route-definitions)
  - [Testing](#testing)
  - [Code formatting](#code-formatting)
- [Deployment](#deployment)
  - [Building the image](#building-the-image)
  - [Environment Variables](#environment-variables)
  - [Mounted Files](#mounted-files)
  - [Using a URL Shortener](#using-a-url-shortener)

<!-- toc-tail -->

## Development

### Setup

To develop on this repo you will need to have [Docker](https://www.docker.com/) and
[node.js](https://nodejs.org) installed on your dev machine and have an understanding of them.
This guide assumes you have the repo checked out and are on macOS, but equivalent commands are available.

You'll only need to follow this setup once for your dev machine.

```bash
# Install npm dependencies
npm install

# Make your secrets file and fill in the values
cp .env.example .env
```

You will also need to get a copy of `assetlinks.json` and `google-account.json`
and put them in the root of the repo.

### Regular use

These are the commands you'll regularly run to develop the API, in no particular order.

```bash
# Start up the docker stack
# -> Runs a mongo database
# -> Runs an instance of shrinky (https://github.com/robb-j/shrinky-link)
docker-compose up -d

# Run unit tests
npm run test

# Run the server and reload on changes
# -> Runs TypeScript directly using ts-node
# -> Uses tsconfig-paths to enhance typescript imports with aliases
# -> Watches for changes in src but ignores .spec.ts changes
# -> The entrypoint is src/index.ts
npm run dev

```

### Irregular use

These are commands you might need to run but probably won't, also in no particular order.

```bash
# Generate the table of contents for this readme
# -> Uses https://www.npmjs.com/package/@robb_j/md-toc
npm run build:readme

# Run development without reloading
npm run dev:once

# Lint source code
# -> Uses tslint
# -> We use IDE extensions to visually see tslint errors
npm run lint

# Manually trans-pile the TypeScript to JavaScript
# -> In development we run TypeScript directly through ts-node
# -> In production TypeScript is trans-pilled in the docker build
npm run build

# Manually build the api docs
# -> These are built in the docker build
# -> It reads files from api/ and outputs into docs
npm run build:docs

# Run the trans-pilled source code
# -> This is the entrypoint for the docker image
# -> Registers tsconfig-paths and loads .env config
npm run start
```

### Code Structure

These are the key directories in the project, some are git-ignored.

| Folder           | Contents                             |
| ---------------- | ------------------------------------ |
| `__mocks__`      | Jest mocks for npm modules           |
| `api`            | Ocelot api configuration             |
| `coverage`       | Jest coverage export                 |
| `dist`           | Trans-pilled javascript src          |
| `docs`           | Ocelot generate docs                 |
| `locales`        | Localisation files                   |
| `logs`           | Development logs                     |
| `node_modules`   | Node packages installed through npm  |
| `seeds`          | Database seeds for testing           |
| `src`            | The TypeScript source code           |
| `src/i18n`       | The localisation submodule           |
| `src/middleware` | Reusable express middleware          |
| `src/public`     | Static assets served through express |
| `src/routes`     | Our routes (see below)               |
| `src/schemas`    | Mongoose schemas                     |
| `src/services`   | Wrappers for external services       |
| `src/tasks`      | Long running tasks (like cron jobs)  |
| `templates`      | Pug templates for generate pages     |
| `tools`          | Node.js utility scripts              |

### Route definitions

The routes of this API are TypeScript functions that take a context object, `ctx`.

They get converted to express routes in `router.ts`'s `makeRoute` function.
See `src/types.ts`'s `RouteContext` to see what values are passed.
This structuring is what inspired [@robb_j/chowchow](https://www.npmjs.com/package/@robb_j/chowchow).

This structuring allows multiple strongly-typed values to be passed to any route,
trying to make typing as seamless as possible.
It works well with object destructuring so you can destructure only the values you need.

For example, a localised hello-world endpoint is as simple as:

```ts
import { RouteContext } from '@/src/types'

export default async ({ api, i18n }: RouteContext) => {
  api.sendData(i18n.translate('api.general.hello'))
}
```

### Testing

This repo uses [unit tests](https://en.wikipedia.org/wiki/Unit_testing)
to ensure that everything is working correctly, guide development, avoid bad code and reduce defects.
We use [Jest](https://www.npmjs.com/package/jest) to run these unit tests.

Tests are any file in `src/` that end with `.spec.ts`, by convention they are inline with the source code,
in a parallel folder called `__tests__`.

There are also `__mocks__` which stub out npm packages so real code isn't called during tests.
This means you can test sending a Twilio SMS without actually sending an SMS.

```bash
# Run the tests
npm test -s

# Watch tests and re-run on code changes
npm run test:watch -s

# Generate code coverage
npm run test:coverage -s
```

### Code formatting

> Coming soon

## Deployment

### Building the image

This repo uses a [GitLab CI](https://about.gitlab.com/product/continuous-integration/)
to build a Docker image when you push a git tag.
This is designed to be used with the `npm version` command
so all docker images are [semantically versioned](https://semver.org/).
The `:latest` docker tag is not used.

This job runs using the [.gitlab-ci.yml](/.gitlab-ci.yml) file which
runs a docker build using the [Dockerfile](/Dockerfile)
and **only** runs when you push a [tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging).

It pushes these docker images to the GitLab registry of the repo.

```bash
# Deploy a new version of the CLI
npm version # major | minor | patch
git push --tags
```

> A slight nuance is that npm precedes version with a `v`, this is disabled in our `.npmrc`

### Environment Variables

| Name              | Description                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| `NODE_ENV`        | What environment the system is running in.                             |
| `MONGO_URI`       | Where the mongo database is and how to connect to it                   |
| `JWT_SECRET`      | The secret for json web tokens                                         |
| `API_URL`         | The public url of this api, e.g. `https://api.irismsg.io`              |
| `WEB_URL`         | The public url of the web, e.g. `https://web.irismsg.io` (unused)      |
| `TWILIO_TOKEN`    | Your twilio access token, [more info](https://www.twilio.com/docs/sms) |
| `TWILIO_SID`      | Your twilio sid                                                        |
| `TWILIO_NUMBER`   | Your twilio number, the number service sms will be sent from           |
| `TWILIO_FALLBACK` | If the sms donation algorithm should fall back to using twilio         |
| `FIREBASE_DB`     | Where your firebase database is                                        |
| `PLAY_STORE_URL`  | The link to download the Iris Msg app                                  |

Useful links:

- [Mongo connection strings](https://docs.mongodb.com/manual/reference/connection-string)
- [About JWT](https://jwt.io/introduction)
- [Shrinky Link](https://github.com/robb-j/shrinky-link)

### Mounted Files

| File                       | Description                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `/app/assetlinks.json`     | Your android asset links file, [more info](https://developers.google.com/digital-asset-links/v1/getting-started) |
| `/app/google-account.json` | Your Firebase account file, [more info](https://firebase.google.com/docs/admin/setup)                            |

### Using a URL Shortener

You can optionally use [skrinky-link](https://github.com/robb-j/shrinky-link)
to shorten url which are sent in messages.

To enable this feature set the following environment variables:

- `SHRINK_URL` - The public URL of the instance, e.g. `http://shrinky:3000`
  - If using with docker-compose, you can use the container name has the hostname, e.g. `shrinky`
- `SHRINK_KEY` - Your key for shrinky-link, used to authenticate requests

---

> The code on https://github.com/iris-msg/node-backend is a mirror of https://openlab.ncl.ac.uk/gitlab/iris/api
