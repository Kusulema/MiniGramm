# MiniGramm Project Overview

This repository contains a full-stack web application named "MiniGramm". It's structured with a client-side frontend developed in TypeScript and a server-side backend powered by Node.js (Express.js) with a MySQL database. The application appears to be a simplified social media platform, likely for sharing images with captions and reactions.

## Technologies Used

### Frontend (Client-side)
-   **Language:** TypeScript
-   **Structure:** HTML, CSS, JavaScript (compiled from TypeScript)
-   **Pattern:** Follows a simple Model-View-Controller (MVC) architectural pattern with `AppView`, `AppController`, `Post`, and `PostRepository`.

### Backend (Server-side)
-   **Runtime:** Node.js
-   **Framework:** Express.js
-   **Database:** MySQL (using `mysql2` driver)
-   **Middleware:** `cors` for handling Cross-Origin Resource Sharing.

### Build Tools
-   **TypeScript Compiler (TSC):** Used to transpile TypeScript code to JavaScript.

## Project Structure

-   `src/`: Contains the TypeScript source code for the frontend application.
    -   `controllers/`: Application controllers (e.g., `AppController.ts`).
    -   `data/`: Data access layer (e.g., `PostRepository.ts`).
    -   `models/`: Data models (e.g., `Post.ts`).
    -   `views/`: View logic (e.g., `AppView.ts`).
    -   `main.ts`: The main entry point for the frontend application.
-   `public/`: Contains the static assets for the frontend, including `index.html`, `styles.css`, and compiled JavaScript files (`js/`).
-   `server/`: Contains the Node.js backend application.
    -   `server.js`: The main entry point for the backend server.
    -   `package.json`: Manages backend dependencies.
-   `package.json` (root): Manages frontend dependencies and build scripts.
-   `tsconfig.json`: TypeScript compiler configuration.

## Building and Running the Project

### Database Setup

The backend connects to a MySQL database named `minigram_db`. Ensure you have a MySQL server running, preferably on `localhost`.
The server is configured to use `user: 'root'` with an empty password, which is common for local development environments like XAMPP.

You will need to create the `minigram_db` database and a `posts` table with appropriate columns (e.g., `id` (PK, AUTO_INCREMENT), `image_url` (VARCHAR), `caption` (TEXT), `likes` (INT, default 0), `wows` (INT, default 0), `laughs` (INT, default 0)).

**Example SQL for `posts` table (adjust types and constraints as needed):**

```sql
CREATE DATABASE IF NOT EXISTS minigram_db;

USE minigram_db;

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(255) NOT NULL,
    caption TEXT,
    likes INT DEFAULT 0,
    wows INT DEFAULT 0,
    laughs INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Backend (Server)

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the server:**
    ```bash
    npm start
    ```
    The server will run on `http://localhost:3000`.

### Frontend (Client)

1.  **Navigate to the project root directory:**
    ```bash
    cd ..
    ```
    (Assuming you are in the `server` directory)
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Build the TypeScript code:**
    ```bash
    npm run build
    ```
    This will compile TypeScript files from `src/` into `public/js/`.
4.  **Run the frontend:**
    Open the `public/index.html` file in your web browser. For local development, it's recommended to use a live server extension (like Live Server for VS Code) or a simple static file server to host `public/` directory. The backend's CORS configuration specifically allows requests from `http://127.0.0.1:5500`, which is the default address for Live Server.

## Development Conventions

-   Frontend logic is written in TypeScript, ensuring type safety and better maintainability.
-   The codebase is organized into client and server components, each with its own `package.json` for dependency management.
-   A clear separation of concerns is maintained in the frontend using the MVC pattern.
-   The server provides RESTful API endpoints for interaction with the client.
