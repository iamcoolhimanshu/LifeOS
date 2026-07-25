# Multi-stage Dockerfile for Spring Boot 3 Java 17 backend
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build executable jar skipping unit tests
RUN mvn clean package -DskipTests

# Production JRE 17 runtime
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy compiled artifact from build stage
COPY --from=build /app/target/api-0.0.1-SNAPSHOT.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
