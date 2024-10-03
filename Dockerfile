# Stage 1: Build Stage
FROM docker.arvancloud.ir/node:20-slim AS build

# Set working directory
WORKDIR /src/app

# Copy package.json and yarn.lock to install dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Compile TypeScript files
RUN yarn build

# Stage 2: Production Stage
FROM docker.arvancloud.ir/node:20-slim

# Set working directory
WORKDIR /src/app

# Copy only necessary files from the build stage
COPY --from=build /src/app/package.json ./
COPY --from=build /src/app/dist ./dist
COPY --from=build /src/app/node_modules ./node_modules
COPY --from=build /src/app/src/modules/userHandler/forgetPassword/email-template ./dist/src/modules/userHandler/forgetPassword/email-template

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["node", "./dist/src/main.js"]
