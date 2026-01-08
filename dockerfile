#node image 
FROM node:20-alpine

# Set the working directory
WORKDIR /app

COPY package*.json ./

RUN rm -f package-lock.json


RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]