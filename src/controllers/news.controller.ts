import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import NodeCache from 'node-cache';
import { connect } from '../database/connection';
import { generateUniqueId } from '../utils/general';
import { verify } from '../utils/jwt';

const cache = new NodeCache({ stdTTL: Number(process.env.cacheTime || 0) }); // Cache duration in seconds (5 minutes)

export const retrieveArticles = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const {
            state,
            category,
            search,
            sort,
            page = 1,
            pageSize = 10,
        } = req.query;
        const cacheKey = JSON.stringify({
            state,
            category,
            search,
            sort,
            page,
            pageSize,
        });

        // Check if the data is in the cache
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        let baseQuery = `FROM articles`;
        let filters = [];
        let queryParams: any[] = [];

        if (state) {
            filters.push(`state = ?`);
            queryParams.push(state);
        }
        if (category) {
            filters.push(`category = ?`);
            queryParams.push(category);
        }

        if (search) {
            const keywords = (search as string).split(',').filter(Boolean);
            const searchConditions = keywords
                .map(() => `title LIKE ? OR description LIKE ?`)
                .join(' OR ');
            filters.push(`(${searchConditions})`);
            keywords.forEach((keyword) => {
                queryParams.push(`%${keyword}%`, `%${keyword}%`);
            });
        }

        const whereClause =
            filters.length > 0 ? `WHERE ` + filters.join(' AND ') : '';

        let orderByClause = 'ORDER BY publishedAt DESC';
        if (sort) {
            const categories = (sort as string).split(',').filter(Boolean);
            const sortConditions = categories
                .map((_category) => `category = ? DESC`)
                .join(', ');
            orderByClause = `ORDER BY ${sortConditions}, publishedAt DESC`;
            queryParams.push(...categories);
        }

        const countQuery = `SELECT COUNT(*) as total ${baseQuery} ${whereClause}`;
        const dataQuery = `SELECT * ${baseQuery} ${whereClause} ${orderByClause} LIMIT ? OFFSET ?`;
        queryParams.push(
            parseInt(pageSize as string),
            (parseInt(page as string) - 1) * parseInt(pageSize as string)
        );

        const connection = await connect();
        const [countRows] = await connection.query(countQuery, queryParams);
        const totalCount = (countRows as any)[0].total;
        const [dataRows] = await connection.query(dataQuery, queryParams);
        await connection.end();

        const responseData = {
            totalCount,
            page: parseInt(page as string),
            pageSize: parseInt(pageSize as string),
            totalPages: Math.ceil(totalCount / parseInt(pageSize as string)),
            rows: dataRows,
        };

        // Store the data in the cache
        cache.set(cacheKey, responseData);

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({
            message: 'An error occurred while fetching news articles.',
        });
    }
};

export const retrieveArticleById = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const cacheKey = `article_${id}`;

        // Check if the data is in the cache
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        const connection = await connect();
        const [rows] = await connection.query(
            'SELECT * FROM articles WHERE id = ? OR articleId = ?',
            [id, id]
        );
        await connection.end();
        if ((rows as any).length === 0) {
            return res.status(404).json({ message: 'Article not found.' });
        }

        const article = (rows as any)[0];

        // Store the data in the cache
        cache.set(cacheKey, article);

        res.json(article);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({
            message: `An error occurred while fetching the article with id ${req.params.id}.`,
        });
    }
};

export const insertArticle = async (req: Request, res: Response) => {
    try {
        const {
            author,
            title,
            description,
            url,
            urlToImage,
            publishedAt,
            content,
            state,
            category,
            sourceName,
        } = req.body;
        const token = req.header('Authorization')?.replace('Bearer ', '') ?? '';
        const isTokenValid = verify(token);
        if (!isTokenValid) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const articleId = generateUniqueId({
            title,
            author,
            dateTime: publishedAt,
        });

        const connection = await connect();
        const [rows] = await connection.query(
            'INSERT INTO articles (author, title, description, url, urlToImage, publishedAt, content, state, category, sourceName, articleId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                author,
                title,
                description,
                url,
                urlToImage,
                new Date(publishedAt),
                content,
                state,
                category,
                sourceName,
                articleId,
            ]
        );
        await connection.end();
        const newArticle = {
            id: (rows as any).insertId,
            author,
            title,
            description,
            url,
            urlToImage,
            publishedAt: new Date(publishedAt),
            content,
            state,
            category,
            sourceName,
            articleId,
        };
        //@ts-ignore
        req.io.emit('new-article', newArticle);
        res.status(201).json(newArticle);
    } catch (error: any) {
        console.error('Error inserting news:', error);
        if (error.sqlState === '23000') {
            return res.status(400).json({
                message: 'Article already exists in the database.',
            });
        } else {
            res.status(500).json({
                message: 'An error occurred while inserting the news article.',
            });
        }
    }
};
