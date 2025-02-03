FROM node:20.18.0

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copia el resto del código
COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]
