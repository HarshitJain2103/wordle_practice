FROM node:20-alpine
WORKDIR /wordleapp
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 5173
CMD [ "npm","run","dev" ]