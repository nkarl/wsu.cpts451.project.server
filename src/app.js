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
 * API: request SELECT data.
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
    const query = request.query;
    let statement,
        values = [];
    for (let k in request.query) {
        values = [...values, request.query[k]];
    }

    if (query.state !== undefined && query.city !== undefined) {
        /*
         * get businesses from a pair of state and city queries
         * */
        statement = 'SELECT * FROM business WHERE state=$1 AND city=$2;';
    } else if (query.state !== undefined && query.city === undefined) {
        /*
         * get cities from a state query
         * */
        statement =
            'SELECT DISTINCT city FROM business WHERE business.state=$1;';
    } else {
        /*
         * default case; select all states
         * */
        statement = 'SELECT DISTINCT state FROM business;';
    }

    const result = await selectComponentQuery(statement, values);
    console.log(result);
    if (result) {
        response.send(result);
    } else {
        response.send({
            statement: statement,
            values: values,
        });
    }
};

const testGetData = async (request, response) => {
    const query = request.query;
    let statement,
        values = [];
    console.log(query);
    for (let k in query) {
        values = [...values, query[k]];
    }
    console.log(values);

    if (values.length === 0) {
        statement = 'SELECT DISTINCT state FROM business;';
    } else if (values.length === 1 && 'state' in query) {
        statement =
            'SELECT DISTINCT city FROM business WHERE business.state=$1;';
    } else if (values.length === 2 && 'city' in query) {
        statement =
            'SELECT DISTINCT zipcode FROM business WHERE business.state=$1 AND business.city=$2;';
    } else if (values.length === 3 && 'zipcode' in query) {
        statement =
            'SELECT DISTINCT * FROM business WHERE business.state=$1 AND business.city=$2 AND business.zipcode=$3;';
    }
    const result = await selectComponentQuery(statement, values);
    console.log(result);
    response.send(result);
};

const testGetZip = async (request, response) => {
    const query = request.query;
    let statement,
        values = [];
    console.log(query);
    for (let k in query) {
        console.log(`${k}=${query[k]}`);
        values = [...values, query[k]];
    }
    console.log(values);

    //statement =
    //'SELECT DISTINCT * FROM business WHERE business.state=$1 AND business.city=$2 AND business.zipcode=$3;';
    statement =
        'SELECT DISTINCT zipcode FROM business WHERE business.state=$1 AND business.city=$2;';
    const result = await selectComponentQuery(statement, values);
    console.log(result);
    response.send(result);
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
app.get('/v1/test', testGetData);
app.get('/v1/testGetZip', testGetZip);

export default app;
