import express from 'express';

const indexRouter = express.Router();

/* GET home page. */
indexRouter.get('/', (req, res) => res.status(200).json({ message: 'Welcome to Express API template' }));

export default indexRouter;
