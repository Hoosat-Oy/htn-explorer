# --- multistage docker build: stage #1: build stage
FROM node:14-alpine AS build

# Set working directory
WORKDIR /app

ENV REACT_APP_API="https://api.network.hoosat.fi"
ENV REACT_APP_SOCKET="wss://socket.network.hoosat.fi"
ENV REACT_APP_ADDRESSES="https://shitlist.hoosat.fi/balances.csv"
ENV REACT_APP_HOMEPAGE="https://network.hoosat.fi"
ENV REACT_APP_GITHUB="https://github.com/Hoosat-Oy/htn-explorer"
ENV REACT_APP_COINGECKO="https://www.coingecko.com/en/coins/hoosat-network"

# Copy package.json and package-lock.json to work directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

RUN npm run build

# --- multistage docker build: stage #2: runtime image
FROM node:alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy only the build output from the previous stage
COPY --from=build /app/build /app/build

# Expose port 3000
EXPOSE 3000

# Command to run explorer
CMD ["serve", "-s", "build", "-l", "3000"]
