# Legislative News Aggregator

## Frontend Application Technologies

-   TypeScript
-   React
-   React Router Dom
-   TanStack Query
-   Material-UI

## Backend Application Technologies

-   TypeScript
-   Node.js
-   Express

## Database Technologies

-   MySql

> Steps to run the applications

1.  Clone the repository
2.  Run `npm install` in the root directory in both frontend and backend directories
3.  Fill in the `.env` file in the backend directory use the .en.template file as a guide
4.  In your MySql database run the fallowing script

```sql
CREATE DATABASE IF NOT EXISTS legislative_news;

-- Use the database
USE legislative_news;

-- Create the articles table
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    articleId VARCHAR(100) NOT NULL,
    author VARCHAR(255),
    title VARCHAR(255),
    description TEXT,
    url VARCHAR(500),
    urlToImage VARCHAR(500),
    publishedAt DATETIME,
    content TEXT,
    state VARCHAR(255),
    category VARCHAR(255),
    sourceName VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_state_category ON articles (state, category);

CREATE INDEX idx_publishedAt ON articles (publishedAt);

ALTER TABLE articles
ADD FULLTEXT INDEX idx_title_description (title, description);

ALTER TABLE articles ADD UNIQUE (articleId);
```

5. Run `npm run dev` in the root directory to start both the frontend and backend applications
6. To populate the database with articles do the following `POST` request using Postman or any other API client to `http://localhost:8080/seed`. You can configure the request body to your liking. Here is an example of the request body

```json
{
    "token": "TOKEN_FROM_ENV_FILE",
    "from": "2024-10-03",
    "to": "2024-10-30",
    "pageSize": 5
}
```

7.  Open your browser and navigate to `http://localhost:3000` to view the application

> Note: The application is still in development and more features will be added in the future
