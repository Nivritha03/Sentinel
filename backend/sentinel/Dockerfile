# -------------------------------------------------------------
# Multi-stage Dockerfile for Sentinel Spring Boot Backend
# -------------------------------------------------------------
FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /app

# Copy Maven files first to leverage Docker layer caching
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Copy source code
COPY src src

# Package application without running integration tests that require live DB
RUN apt-get update && apt-get install -y maven && mvn clean package -DskipTests

# -------------------------------------------------------------
# Runtime Stage
# -------------------------------------------------------------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose standard port (Render provides $PORT at runtime)
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]
