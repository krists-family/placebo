FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ENV NODE_ENV=production
RUN JWT_SECRET=build-only-cookie-not-runtime COOKIE_SECRET=build-only-jwt-not-runtime npm run build
EXPOSE 9000
CMD ["sh","-c","npx medusa db:migrate && cd .medusa/server && npm run start"]
