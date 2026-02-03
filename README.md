# Master Bot System Setup

## Backend Setup
1. Install PostgreSQL and create database:
   ```sql
   CREATE DATABASE masterbot_db;
   ```

2. Run schema:
   ```bash
   cd backend
   psql -U postgres -d masterbot_db -f schema.sql
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy .env.example to .env.pc2 and update database credentials:
   ```bash
   cp .env.example .env.pc2
   # Edit .env.pc2 with your database credentials
   ```

5. Run backend:
   ```bash
   python app.py
   ```

## Frontend Setup
1. Install Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start React app:
   ```bash
   npm start
   ```

## Features
- Client registration with unique ID generation (2 letters + 4 numbers)
- Bot verification system
- One-to-many client-bot relationship
- Email/phone uniqueness enforcement
- Real-time client dashboard

## Git Setup
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd master-bot
   ```

2. Set up environment variables:
   ```bash
   cd backend
   cp .env.example .env.pc2
   # Edit .env.pc2 with your database credentials
   ```

## Contributing
- Never commit .env files or sensitive credentials
- Use .env.example as template for environment setup
- Test your changes before pushing