# Build Stage
FROM golang:1.26-alpine AS builder

WORKDIR /app

# Install git and ca-certificates
RUN apk add --no-cache git ca-certificates

# Copy dependency manifests
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server ./cmd/server

# Final Lightweight Runtime Stage
FROM alpine:3.20

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata && \
    addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/server /app/server
COPY --from=builder /app/docs /app/docs

# Set permissions and switch to non-root user
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

ENTRYPOINT ["/app/server"]

