FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/common/package.json packages/common/package.json
COPY services/catalog/package.json services/catalog/package.json
COPY services/orders/package.json services/orders/package.json
COPY services/gateway/package.json services/gateway/package.json
COPY services/worker/package.json services/worker/package.json
RUN npm install
COPY tsconfig.json tsconfig.base.json ./
COPY packages packages
COPY services services
RUN npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime
ARG SERVICE
ENV NODE_ENV=production SERVICE_NAME=${SERVICE}
WORKDIR /app
COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/packages/common ./packages/common
COPY --from=build --chown=node:node /app/services/${SERVICE} ./services/${SERVICE}
USER node
CMD ["sh", "-c", "node --enable-source-maps services/${SERVICE_NAME}/dist/index.js"]
