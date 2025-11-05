# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copiar package.json y package-lock.json
COPY frontend/package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código del frontend
COPY frontend/ ./

# Construir la aplicación (usando esbuild como minificador por defecto)
RUN npm run build -- --minify esbuild

# Stage 2: Build Backend
FROM eclipse-temurin:21-jdk-alpine AS backend-build

WORKDIR /app/backend

# Copiar archivos de Maven
COPY backend/vulnerable-app/mvnw ./
COPY backend/vulnerable-app/mvnw.cmd ./
COPY backend/vulnerable-app/.mvn ./.mvn
COPY backend/vulnerable-app/pom.xml ./

# Dar permisos de ejecución al Maven wrapper
RUN chmod +x ./mvnw

# Descargar dependencias (capa de caché)
RUN ./mvnw dependency:go-offline -B

# Copiar el código fuente
COPY backend/vulnerable-app/src ./src
COPY backend/vulnerable-app/lombok.config ./

# Copiar los archivos del frontend al directorio static de Spring Boot
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static

# Construir el JAR (que ahora incluye el frontend)
RUN ./mvnw clean package -DskipTests -B

# Stage 3: Runtime - Imagen Final
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copiar el JAR del backend (que ya incluye el frontend en static/)
COPY --from=backend-build /app/backend/target/*.jar app.jar

# Exponer el puerto 8080
EXPOSE 8080

# Variables de entorno opcionales
ENV JAVA_OPTS=""

# Ejecutar la aplicación Spring Boot
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
