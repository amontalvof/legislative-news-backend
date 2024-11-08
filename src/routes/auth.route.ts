import { body } from 'express-validator';
import { loginUser, registerUser } from '../controllers/auth.controller';

const { Router } = require('express');

const router = Router();

router.post(
    '/register',
    [
        body('fullName')
            .isString()
            .trim()
            .withMessage('Full name must be a string')
            .isLength({ min: 1 })
            .withMessage('Full name must not be empty')
            .escape(),
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Email must be valid'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
            .withMessage(
                'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            ),
        body('preferredTopics')
            .optional({ nullable: true })
            .isArray()
            .withMessage('Preferred topics must be an array')
            .custom(
                (topics) =>
                    topics === null ||
                    topics.every((topic: string) => typeof topic === 'string')
            )
            .withMessage('Each topic must be a string'),
    ],
    registerUser
);

router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Email must be valid'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
            .withMessage(
                'Password must contain at least one uppercase letter, one lowercase letter, and one number'
            ),
    ],
    loginUser
);

export default router;
