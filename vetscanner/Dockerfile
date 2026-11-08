# Frontend: Next.js on port 3000

# Installs frontend's packages and then copies frontend code
FROM node:22-slim AS build
WORKDIR /app

COPY vetscanner/package.json vetscanner/package-lock.json ./
RUN npm ci

COPY vetscanner/ ./

# Build frontend
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Take the built frontend and runs it on port 3000
FROM node:22-slim
WORKDIR /app

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
