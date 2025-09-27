import express, { ErrorRequestHandler } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import cors from 'cors';
import dotenv from 'dotenv';
import { IncomingMessage, ServerResponse, ClientRequest } from 'http';
dotenv.config();
const app = express();
const PORT = process.env.GATEWAY_PORT!;
const baseVersion = 'v1';

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.use(cors({
    origin: true, // Allow all origins
    credentials: true
}));
const commonProxyOptions = {
    changeOrigin: true,
    cookieDomainRewrite: 'localhost',
    onProxyReq: (proxyReq: ClientRequest, req: express.Request, res: express.Response) => {
        // You can add common headers or modifications here
        console.log(`Proxying request to: ${proxyReq.path}`);
    },
    onError: (err: ErrorRequestHandler, req: express.Request, res: express.Response) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error' });
    }
};

// Auth service proxy
app.use(
    `/${baseVersion}/auth`,
    createProxyMiddleware({
        ...commonProxyOptions,
        target: 'http://localhost:5001',
        pathRewrite: {
            [`^/${baseVersion}/auth`]: `/${baseVersion}/auth`,
        },
    })
);
app.use(
    `/${baseVersion}/tokenize`,
    createProxyMiddleware({
        ...commonProxyOptions,
        target: 'http://localhost:5002',
        pathRewrite: {
            [`^/${baseVersion}/tokenize`]: `/${baseVersion}/tokenize`,
        },
    })
);


const errorHandler: express.ErrorRequestHandler = (err: Error, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
};

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🌐 API Gateway running on http://localhost:${PORT}`);
});
