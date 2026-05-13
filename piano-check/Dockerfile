FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY piano-check/.mvn/ .mvn
COPY piano-check/mvnw piano-check/pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline
COPY piano-check/src ./src
RUN ./mvnw clean package -DskipTests
EXPOSE 8080
CMD ["java", "-jar", "target/piano-check-0.0.1-SNAPSHOT.jar"]