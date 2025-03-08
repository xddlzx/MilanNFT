# Use official Node.js image
FROM node:18.16.0

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files
COPY . .


#... rest of your Dockerfile
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf

# Expose necessary ports
EXPOSE 5000
# Backend API
EXPOSE 3000
# Frontend (React)

# Command to run the app
CMD ["npm", "start"]
