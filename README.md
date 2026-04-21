# Affiliate Auto Post System

A backend system for an Affiliate Auto Posting platform built with Node.js (Express), MSSQL, and following Clean Architecture principles.

## Prerequisites

- Node.js (v18 or higher recommended)
- MSSQL Server

## Setup Instructions

1. **Install Dependencies**
   Run the following command to install the necessary packages:
   \`\`\`bash
   npm install
   \`\`\`

2. **Configuration**
   Copy the \`.env.example\` file to \`.env\` and update the variables with your database credentials:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

3. **Run the Application**
   You can start the server using Node:
   \`\`\`bash
   node src/server.js
   \`\`\`
   The server will start (defaulting to port 3000) and automatically connect to MSSQL and initialize the necessary tables (`products`, `posts`, and `schedules`) if they do not already exist.

## API Endpoints

- \`GET /api/products\`: Fetch all products.
