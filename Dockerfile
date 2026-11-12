# ── Stage 1: Build the Spring Boot JAR ───────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Build the app (skip tests for faster deploy)
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Minimal runtime image ───────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

# Railway sets PORT env var — Spring Boot reads server.port
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
