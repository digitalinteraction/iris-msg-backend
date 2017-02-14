FROM node:7.3-alpine


#RUN apk add -q --no-cache \
#    ssmtp \
#    nano


# Can use this to instal packages to a folder and delete it after (eg after build)
# apk --no-cache add  --virtual .build-deps A B C && apk del .build-deps


RUN mkdir -p /app
WORKDIR /app


COPY package.json /app/
RUN npm install --silent


EXPOSE 8080


COPY web /app/web


RUN node node_modules/.bin/apidoc -i web/ -o api/ --silent


CMD [ "node_modules/.bin/nodemon", "web/server.js" ]
