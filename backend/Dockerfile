FROM golang:1.20.3 AS build-stage
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . ./
RUN ls -la /app
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/main

FROM alpine:latest AS build-release-stage
WORKDIR /app
COPY --from=build-stage /app/main /app/main
COPY --from=build-stage /app/docker-entrypoint.sh /app/docker-entrypoint.sh
COPY --from=build-stage /app/.env /app/.env
RUN apk add --no-cache bash && chmod +x /app/docker-entrypoint.sh

ENV PORT $PORT
ENV ENVIRONMENT $ENVIRONMENT

ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]