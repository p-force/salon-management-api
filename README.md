Вот пример README для твоего проекта:

---

# Salon Management API

This is a RESTful API for managing salons, developed with Node.js, Express, MySQL, and Docker. The API allows for CRUD operations on salon data, including the ability to seed initial data, retrieve salon details, and more.

## Features

- Basic Authentication for secure access.
- MySQL-based database for storing salon data and working hours.
- API routes for managing salons (`/api/salons`).
- Database seeding endpoint for populating salons data.
- Support for CORS.
- Logging requests using Morgan.
- Docker support for easy deployment.

## Prerequisites

Before running this project, ensure that you have the following installed on your local machine:

- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)

## Setup and Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/p-force/salon-management-api.git
   cd salon-management-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on the `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Fill in the necessary values for the database and basic authentication credentials.

4. **Setup Database:**

   Ensure that your MySQL database is properly configured and accessible. To create the required tables, use the `dump.sql` file:

   ```bash
   mysql -u DB_USER -h DB_HOST -P DB_PORT -p DB_DATABASE < dump.sql
   ```

   Replace `DB_USER`, `DB_HOST`, `DB_PORT`, and `DB_DATABASE` with the corresponding values from your `.env` file.

5. Start the server:

   ```bash
   npm start
   ```

   The API will be running at `http://localhost:8080` (or the port specified in the `.env` file).

## API Endpoints

### Authentication

Basic Authentication is enabled for all API routes. The credentials are set in the `.env` file under `BASIC_AUTH_LOGIN` and `BASIC_AUTH_PASSWORD`.

### `/api/salons`

- **GET** `/api/salons` - Get a list of all salons.
- **GET** `/api/salons/:id` - Get detailed information about a specific salon by ID.
- **GET** `/api/salons/random/:count?` - Get a random salon or a random selection of salons (default is 1).
- **GET** `/api/salons/seed` - Seed the database with sample data.

### `/logout`

- **GET** `/logout` - Log out (Invalidate session, respond with status 401).

### Error Handling

- **404** - Any unmatched route will return a 404 response.

## Docker Support

The project comes with a `Dockerfile` and `amvera.yaml` to deploy the project on the [Amvera platform](https://amvera.ru/). To deploy the project with Docker

## Database Schema

The database consists of two tables:

- **salons**

  - `id`: Integer, Auto Increment, Primary Key
  - `name`: String, Not Null
  - `address`: String, Not Null
  - `phone`: String, Not Null
  - `image_url`: String

- **working_hours**
  - `id`: Integer, Auto Increment, Primary Key
  - `salon_id`: Integer, Foreign Key to `salons.id`
  - `open_time`: Time
  - `close_time`: Time

## Project Structure

- **src/database/Database.js** - Contains the database connection logic and methods for interacting with the database.
- **src/routes/index.js** - Defines the API routes and connects them to the database.
- **.env** - Configuration file for environment variables such as database credentials and basic authentication credentials.
- **Dockerfile** - The file used to build a Docker image for the application.
- **amvera.yaml** - Configuration for deploying the application on the Amvera platform.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
