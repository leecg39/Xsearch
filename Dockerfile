FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts \
  && npm cache clean --force

COPY --chown=node:node newsgen ./newsgen
COPY --chown=node:node ext/icon32.png ext/icon128.png ./ext/

USER node
EXPOSE 8787

CMD ["node", "newsgen/server.mjs"]
