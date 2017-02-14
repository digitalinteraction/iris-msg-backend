# Node & Mongo Docker Server
A sample project that sets up a [node](https://nodejs.org/) and [mongo](https://www.mongodb.com) [docker](https://www.docker.com) images. Creates docker images to run the node & mongo server and provides a shared folder for development.


## Node Server Image
- A web server running node using [express](http://expressjs.com) to server html
- Sets up a shared directory with the host machine `web` which automatically reloads node using [nodemon](https://nodemon.io)


## Mongo Database
- An image to run a mongo on port `27017`
- Also exposes the port to the host machine so you can access the database, e.g. with [robomongo](https://robomongo.org)


# Setup
## Building the Docker image
1. Build the images with `docker-compose build`
2. Run the images with `docker-compose up` (add `-d` for headless)

## Run node locally
1. Install [nodemon](https://nodemon.io) globally `nodemon -g`
2. Run the server `nodemon web/server.js`


## Todo
- Integrate [node-sass](https://github.com/sass/node-sass), auto-compile / rebuild
- Some form of unit testing?
    - [Mocha](https://mochajs.org)
    - [Jasmine](https://jasmine.github.io)
    - [Cucumber](https://cucumber.io/docs/reference/javascript)
