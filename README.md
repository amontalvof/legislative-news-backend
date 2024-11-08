# Legislative News Aggregator Backend

## System Design Considerations

1. News Aggregation

    - Aggregation Strategy: Implement a cron job that regularly fetches news articles from external sources. We could use a third-party news APIs. Depending on the requirements, this job could run hourly or daily.
    - Deduplication: To handle duplicate articles from different sources, I consider implementing a hash-based deduplication mechanism is the best option. Generate a unique hash (based on the title, author, and published date, etc) for each article before saving. If the hash already exists in the database, skip saving the duplicate.

2. Scalability

    - Database Design and Indexing: I use a relational database like MySQL or we can use PostgreSQL also to store articles with indexed fields for state, category, published date, title and description. Indexing these fields will optimize query performance for filtering and searching.
    - Handling Large Volumes of Data: As the database grows, I consider implementing a data partitioning strategy, especially if each state and topic has a large number of associated articles. This would distribute data across multiple database servers to improve access speed.
    - API Performance: I use pagination on the /news endpoint to limit the number of articles returned per request, helping to reduce load on both the backend and frontend.

3. Search Optimization

    - Text Search Indexing: For efficient keyword searches in title and description I implement full-text search indexing. Alternatively, We can consider using a dedicated search engine like Elasticsearch if we are going to handle a very high volume of articles, because it’s optimized for fast text searches and can rank results by relevance.
    - Caching Search Results: Cache frequently searched queries or common filters to reduce database load, particularly if your dataset is very large. You could use Redis or a similar caching mechanism to store popular queries for quick access. In this application I implement a simple in-memory cache to store the search results for a short period of time.
    - Incremental Updates: If our news sources update regularly, we need to consider implementing incremental updates that only fetch and add new articles to the database, rather than replacing existing articles. This would keep the system’s data fresh without fully re-fetching the entire dataset, which can be resource-intensive.

## Backend Application Technologies

-   TypeScript
-   Node.js
-   Express
-   Json Web Token
-   Websockets

## Database Technologies

-   MySql

> Steps to run the applications

1.  Clone the repository
2.  Run `npm install` in the root directory
3.  Fill in the `.env` file, use the `.env.template` file as a guide
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

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) DEFAULT 'user',
    preferredTopics JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

5. Run `npm run dev` in the root directory to start the backend application
6. To populate the database with articles do the following `POST` request using Postman or any other API client to `http://localhost:8080/seed`. You can configure the request body to your liking. You need to provide a valid JSON Web token in the body. Here is an example of the request body

```json
{
    "token": "JWT_TOKEN",
    "from": "2024-10-03",
    "to": "2024-10-30",
    "pageSize": 5
}
```

7.  To get a JWT_TOKEN you need to register a user by sending a `POST` request to `http://localhost:8080/register` with the following request body. Here is an example of the request body, after the register you need to login to get the JWT_TOKEN.

```json
{
    "fullName": "John Doe",
    "email": "john@mail.com",
    "password": "Password123"
}
```

8.  To login send a `POST` request to `http://localhost:8080/login` with the following request body. Here is an example of the request body, after the login you will get the JWT_TOKEN.

```json
{
    "email": "john@mail.com",
    "password": "Password123"
}
```

9.  To get the articles send a `GET` request to `GET /news?state=x&topic=y&search=keyword&page=1&pageSize=5` with the following query parameters. As you can notice the endpoint is paginated, you can change the page and pageSize query parameters to get the desired number of articles.

10. To get a single article send a `GET` request to `GET /news/:articleId` with the articleId as a parameter.

11. To add a new article, send a POST request to POST /news with the following request body. The articleId is a unique identifier for each article, generated from a combination of the article's title, author, and publishedAt date to prevent duplicate entries. Below is an example of the request body:

```json
{
    "author": "John Doe",
    "title": "Article Title",
    "description": "Article Description",
    "url": "https://www.example.com",
    "urlToImage": "https://www.example.com/image.jpg",
    "publishedAt": "2024-10-03T10:15:30Z",
    "content": "Article Content",
    "state": "state",
    "category": "category",
    "sourceName": "Source Name"
}
```

> To improve more this application, I would consider the implementation of automated unit and integration testing. Automated testing provides several benefits, including ensuring code quality, detecting bugs early, and reducing manual testing efforts. Unit tests verify individual components, making it easier to identify issues within specific functions or methods. Integration tests, on the other hand, validate how different components work together, helping to prevent issues in the overall system. Together, these tests increase the reliability, maintainability, and scalability of the codebase, leading to a more stable and high-quality application.

Testing Libraries for Express Applications:

-   Jest: A popular testing framework that provides a simple and flexible way to write test cases.
