FROM node:20.11.1-alpine

WORKDIR /app

RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN npx prisma generate
RUN pnpm build
RUN mkdir -p /usr/src/app/uploads/preview
RUN chown -R node:node /usr/src/app/uploads

EXPOSE 3000

CMD ["pnpm", "start:prod"]
