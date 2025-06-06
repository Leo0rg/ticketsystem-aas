FROM node:23-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY . .

RUN yarn install --frozen-lockfile

RUN yarn build

EXPOSE 3000
EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./packages/db/prisma/schema.prisma && yarn start"] 