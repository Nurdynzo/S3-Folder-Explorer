# 1. Use an official Node.js runtime as the base image
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy the package.json and package-lock.json to install dependencies
COPY package*.json ./

# 4. Install the dependencies
RUN npm install

# 5. Copy the rest of the application code to the container
COPY . .

# 6. Expose the port the app runs on (if applicable)
EXPOSE 3000

# 7. Define the command to run the app
CMD [ "npm", "start" ]
