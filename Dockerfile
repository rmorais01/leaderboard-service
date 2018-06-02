FROM node:8.11.2

# Create app directory
RUN mkdir -p /usr/src/leaderboard-sample
WORKDIR /usr/src/leaderboard-sample

# Install app dependencies
COPY package.json /usr/src/leaderboard-sample/
RUN npm install

# Bundle app source
COPY . /usr/src/leaderboard-sample

EXPOSE 3000
CMD [ "npm", "start" ]
