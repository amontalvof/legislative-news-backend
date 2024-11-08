import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const verify = (token: string) => {
    try {
        jwt.verify(token, JWT_SECRET);
        return true;
    } catch (error: any) {
        console.error('Error verifying token:', error.message);
        return false;
    }
};
