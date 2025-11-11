FROM node:22-alpine

# set work dir
WORKDIR /app

# use npm mirror
RUN npm config set registry https://registry.npmmirror.com/

# install deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

# copy source
COPY . .

# build
RUN yarn run build

# expose port
EXPOSE 3000

# set cmd
CMD ["node", "dist/src/bin/www.js"]

# docker build -t kvvm-ai-serve .
