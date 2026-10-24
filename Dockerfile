FROM node:20-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=http://localhost:4444
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN corepack enable && (pnpm i --frozen-lockfile || npm i)
COPY . .
RUN npm run build || pnpm build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/next.config.js ./
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
