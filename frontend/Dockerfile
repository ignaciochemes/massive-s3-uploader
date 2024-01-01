FROM node:20.10.0 AS build-stage
ENV NODE_ENV=development

WORKDIR /app

COPY package.json package-lock.json .

RUN npm install

COPY . .

RUN npm run build:dev

FROM nginx:1.25.3-alpine3.18 as development
ENV NODE_ENV=development

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]