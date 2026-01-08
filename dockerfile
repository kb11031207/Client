#node image 
FROM node:20-alpine

# Set the working directory
WORKDIR /app

COPY package.json ./



RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]