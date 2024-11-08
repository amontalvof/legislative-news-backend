import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connect } from '../database/connection';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const registerUser = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { fullName, email, password, preferredTopics } = req.body;

    try {
        const connection = await connect();
        const hashedPassword = await bcrypt.hash(password, 10);
        const preferredTopicsJson = JSON.stringify(preferredTopics);
        const [result] = await connection.query(
            'INSERT INTO users (fullname, email, password, preferredTopics) VALUES (?, ?, ?, ?)',
            [fullName, email, hashedPassword, preferredTopicsJson]
        );

        await connection.end();

        res.status(201).json({
            message: 'User registered successfully',
            id: (result as any).insertId,
            fullName,
            email,
            password,
            preferredTopics,
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
        const connection = await connect();
        const [rows] = await connection.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        await connection.end();

        if ((rows as any).length === 0) {
            return res
                .status(401)
                .json({
                    message:
                        'Invalid credentials. Please double-check your email and password.',
                });
        }

        const user = (rows as any)[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res
                .status(401)
                .json({
                    message:
                        'Invalid credentials. Please double-check your email and password.',
                });
        }

        const token = jwt.sign(
            {
                id: user.id,
                fullName: user.fullname,
                preferredTopics: user.preferredTopics,
            },
            JWT_SECRET,
            {
                expiresIn: '1d',
            }
        );

        res.status(200).json({
            token,
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
