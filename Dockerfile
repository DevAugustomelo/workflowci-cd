FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json .
COPY prisma.config.ts .

RUN npx prisma generate

RUN npm run build


FROM node:22-bookworm-slim AS production

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY prisma.config.ts .

RUN npx prisma generate


ENV NODE_ENV=production

USER node

CMD ["node", "dist/server.js"]