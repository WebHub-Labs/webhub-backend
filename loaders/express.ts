import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import loginRouter from '../routes/login';
import registerUser from '../routes/registerUser';
import registerShop from '../routes/registerShop';
import productRouter from '../routes/products';

export default async ({ app }: { app: express.Application }) => {

    app.get('/status', (req: Request, res: Response) => { res.status(200).end(); });
    app.head('/status', (req: Request, res: Response) => { res.status(200).end(); });
    app.use(cors());
    app.use(express.json());

    app.use("/login", loginRouter);
    app.use("/register/user", registerUser);
    app.use("/register/shop", registerShop);
    app.use("/products", productRouter);

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        if (err.message === "Unauthorized Request") {
            return res.status(500).json("Unauthorized");
        } else if (err.message === "Posting is only allowed after 5 am.") {
            res.status(403).json({ error: "Posting is only allowed after 5 am." });
        }
    });
    return app
}