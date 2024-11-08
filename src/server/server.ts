import { createServer } from 'http';
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Server } from 'socket.io';
import seedRoute from '../routes/seed.route';
import newsRoute from '../routes/news.route';
import authRoute from '../routes/auth.route';

const app: Application = express();
const port = process.env.PORT || '8080';

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: Number(process.env.windowMs || 15) * 60 * 1000,
    max: Number(process.env.amountOfRequests || 100),
    message:
        'Too many requests from this IP, please try again after 15 minutes',
});

const middlewares = () => {
    app.use(
        cors({
            origin: process.env.REACT_APP_URL, // Replace with your React app URL
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        })
    );
    app.use(express.json());
    app.use(express.static('public'));
    app.use(limiter);
};

const routes = (io: Server) => {
    app.use('/seed', seedRoute);
    app.use('/auth', authRoute);
    app.use(
        '/news',
        (req, _res, next) => {
            //@ts-ignore
            req.io = io;
            next();
        },
        newsRoute
    );
};

const wsListeners = (io: Server) => {
    io.on('connection', (socket) => {
        console.log('Client connected', socket.id);

        socket.on('disconnect', () => {
            console.log('Client disconnected', socket.id);
        });
    });
};

export const main = async () => {
    middlewares();
    const server = createServer(app);
    const io = new Server(server, {
        cors: {
            origin: process.env.REACT_APP_URL,
            methods: ['GET', 'POST'],
        },
    });
    wsListeners(io);
    routes(io);
    await server.listen(port);
    console.log(`Server running on port: ${port}`);
};
