# Use Node.js 18 LTS (long-term support) as the base image
FROM node:18

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json /app/

# Install dependencies
RUN npm install

# Copy project files
COPY . /app/

# Build the Angular project for production
RUN npm run build --prod

# Expose port 4200 to the outside world
EXPOSE 4200

# Run npm start as the entry point
ENTRYPOINT ["npm", "start"]