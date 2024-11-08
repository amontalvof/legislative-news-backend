import { createConnection } from 'mysql2/promise';

export const connect = async () => {
    return createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT),
    });
};
