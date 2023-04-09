import cors from 'cors';
import logger from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import querystring from 'querystring';
import url from 'url';
import indexRouter from './routes/index';

const app = express();

import { Client, Pool } from 'pg';

const DATABASE = new Pool({
    host: 'localhost',
    database: 'yelpdb',
    user: 'postgres',
    password: 'pass1234',
    port: 5432,
});

/*
 * API: SELECT data.
 * */
const selectComponentQuery = async (statement, values = []) => {
    let _, result;
    const CLIENT = await DATABASE.connect();
    try {
        _ = await CLIENT.query('BEGIN');
        result = await CLIENT.query(statement, values);
    } catch (err) {
        _ = await CLIENT.query('ROLLBACK');
        console.log('ERROR: Unable to submit query.');
        console.log(err);
    } finally {
        CLIENT.release();
        return result.rows;
    }
};

/*
 * GET: parametrized queries for page components
 * */
const getData = async (request, response) => {
    let state = request.query.state;
    let city = request.query.city;
    console.log('query.state=', state);
    console.log('query.city=', city);

    let statement, values;

    if (state !== undefined && city !== undefined) {
        /*
         * get businesses from a pair of state and city queries
         * */
        statement = 'SELECT * FROM business WHERE state=$1 AND city=$2;';
        values = [state, city];
    } else if (state !== undefined && city === undefined) {
        /*
         * get cities from a state query
         * */
        statement =
            'SELECT DISTINCT city FROM business WHERE business.state=$1;';
        values = [state];
    } else {
        /*
         * default case; select all states
         * */
        statement = 'SELECT DISTINCT state FROM business;';
        values = [];
    }
    const result = await selectComponentQuery(statement, values);
    console.log(result);
    if (result) {
        response.send(result);
    }
};

const corsOptions = {};
//app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

app.use('/v1', indexRouter);
app.get('/v1/get', getData);

export default app;
