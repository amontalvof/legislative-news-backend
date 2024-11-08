const { Router } = require('express');
import { query, param, body } from 'express-validator';
import {
    insertArticle,
    retrieveArticleById,
    retrieveArticles,
} from '../controllers/news.controller';

const router = Router();

router.get(
    '/',
    [
        query('state').optional().isString().trim().escape(),
        query('topic').optional().isString().trim().escape(),
        query('search').optional().isString().trim().escape(),
        query('sort').optional().isString().trim().escape(),
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('pageSize').optional().isInt({ min: 1 }).toInt(),
    ],
    retrieveArticles
);

router.get(
    '/:id',
    [param('id').isAlphanumeric().withMessage('ID must be alphanumeric')],
    retrieveArticleById
);

router.post(
    '/',
    [
        body('author')
            .isString()
            .trim()
            .escape()
            .withMessage('Author must be a string')
            .optional({ nullable: true }),
        body('title')
            .isString()
            .trim()
            .escape()
            .withMessage('Title must be a string')
            .optional({ nullable: true }),
        body('description')
            .isString()
            .trim()
            .escape()
            .withMessage('Description must be a string')
            .optional({ nullable: true }),
        body('url')
            .isURL()
            .withMessage('URL must be valid')
            .optional({ nullable: true }),
        body('urlToImage')
            .isURL()
            .withMessage('URL to image must be valid')
            .optional({ nullable: true }),
        body('publishedAt')
            .isISO8601()
            .toDate()
            .withMessage('Published date must be a valid ISO 8601 date'),
        body('content')
            .isString()
            .trim()
            .escape()
            .withMessage('Content must be a string')
            .optional({ nullable: true }),
        body('state')
            .isString()
            .trim()
            .escape()
            .withMessage('State must be a string'),
        body('category')
            .isString()
            .trim()
            .escape()
            .withMessage('Category must be a string'),
        body('sourceName')
            .isString()
            .trim()
            .escape()
            .withMessage('Source name must be a string')
            .optional({ nullable: true }),
    ],
    insertArticle
);

export default router;
