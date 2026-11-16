# Etapa 1: gera o build estático (tsc + vite build).
FROM node:20-alpine AS build
WORKDIR /app

# Dependências primeiro: a camada fica em cache enquanto package*.json não mudar.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# O Vite grava a URL da API no JS durante o build: é um build arg, não uma variável de execução.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Etapa 2: só o dist/ servido pelo nginx (sem node nem node_modules).
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
