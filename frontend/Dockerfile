# ---------- BUILD STAGE ----------
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# 👇 Copy environment file BEFORE build
COPY .env.production .env.production

COPY . .
RUN npm run build


# ---------- RUN STAGE ----------
FROM node:18-alpine

WORKDIR /app
RUN npm install -g serve

COPY --from=build /app/build ./build

ENV PORT=8080
EXPOSE 8080

CMD ["npx", "serve", "-s", "build", "-l", "tcp://0.0.0.0:8080"]
