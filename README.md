# 🏗️ Global Think - Backend con NestJS y MongoDB

Este es un backend desarrollado con **NestJS** y **MongoDB**, diseñado para ser ejecutado dentro de un entorno **Docker**.

---

## 🚀 **Características**
✔ API REST con NestJS.  
✔ Base de datos **MongoDB** con conexión mediante Mongoose.  
✔ Contenedores orquestados con **Docker Compose**.  
✔ Configuración con variables de entorno.  
✔ Soporte para **pruebas automatizadas** con Jest.  
✔ Documentación de API con **Swagger** (`http://localhost:3000/api/docs`).

## 🧪 **Nota :**
Para los endpoints de modificación y eliminación, se debe agregar el siguiente header en la solicitud:

---

## 🐳 **Ejecución con Docker**
Para ejecutar el proyecto usando **Docker**, sigue estos pasos:

### 1️⃣ **Levantar los contenedores**
```bash
docker-compose up --build -d
```

### 2️⃣ **Verificar que los contenedores están corriendo**
```bash
docker ps


Puedes ver los endpoints disponibles en Swagger visitando:
```
http://localhost:3000/api/docs
```

---


## ⚡ **Ejecutar el backend sin Docker**
Si prefieres ejecutar el backend sin Docker, sigue estos pasos:

1️⃣ **Instalar dependencias**:
```bash
npm install
```
2️⃣ **Crear .env para sustituir .env.exemple**:

3️⃣ **Iniciar el backend**:
```bash
npm run start
```

---

## 🧪 **Ejecutar Pruebas**
Este proyecto usa **Jest** para testing.

### 🔹 **Ejecutar todos los tests**
```bash
docker exec -it PT_GLOBAL_THINK npm test
```



