# First stage: Build the app
FROM node:16 AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Second stage: Setup for production
FROM node:16

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --production

# Copy built app from the first stage
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD [ "yarn", "serve" ]
