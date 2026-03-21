FROM node:23-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
RUN pnpm install

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN pnpm run build


FROM nginx:1

COPY --from=build /app/dist /usr/share/nginx/html
