import cors from 'cors';
import logger from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import querystring from 'querystring';
import url from 'url';
import indexRouter from './routes/index';

const app = express();

import { Pool } from 'pg';

const DATABASE = new Pool({
    host: 'localhost',
    database: 'yelpdb',
    user: 'postgres',
    password: 'pass1234',
    port: 5432,
});

const getStates = async (request, response) => {
    //response.header('Access-Control-Allow-Origin', '*');
    //response.header(
    //'Access-Control-Allow-Methods',
    //'GET, POST, OPTIONS, PUT, DELETE'
    //);
    //response.header(
    //'Access-Control-Allow-Headers',
    //'Origin, X-Requested-With, Content-Type, Accept'
    //);
    try {
        await DATABASE.connect();
        await DATABASE.query('BEGIN');
        let statement = 'SELECT DISTINCT state FROM business;';
        const result = await DATABASE.query(statement);
        console.log(result.rows);
        //response.status(200).json({ message: result.rows });
        response.send(result.rows);
        //console.log(response.json(result.rows));
        //await DATABASE.query('ROLLBACK');
    } catch (err) {
        await DATABASE.query('ROLLBACK');
        console.log(response, err);
    } finally {
        //DATABASE.end();
        //console.log('DATABASE IS STILL OPEN.');
    }
};

const getData = async (request, response) => {
    let state = request.query.state;
    let city = request.query.city;

    let result;
    let result_debug;
    try {
        await DATABASE.connect();
        await DATABASE.query('BEGIN');

        if (state !== undefined && city !== undefined) {
            /*
             * get businesses from a pair of state and city queries
             * */
            const statement =
                'SELECT DISTINCT name FROM business WHERE state=$1 AND city="$2";';
            const value = [state, city];
            result_debug = { statement: statement, value: value };
            result = await DATABASE.query(statement, value);
        } else if (state !== undefined && city === undefined) {
            /*
             * get cities from a state query
             * */
            /* query cities */
            const statement =
                'SELECT DISTINCT city FROM business WHERE business.state=$1;';
            const value = [state];
            result_debug = { statement: statement, value: value };
            result = await DATABASE.query(statement, value);
        } else {
            /*
             * default case; select all states
             * */
            const statement = 'SELECT DISTINCT state FROM business;';
            result = await DATABASE.query(statement);
        }
    } catch (err) {
        await DATABASE.query('ROLLBACK');
        console.log(response, err);
        console.log('query.state=', state);
        console.log('query.city=', city);
        console.log('statement=', result_debug);
        response.send(result_debug);
    } finally {
        if (result !== undefined) {
            console.log(result.rows);
            response.send(result.rows);
        }
        //DATABASE.end();
        //console.log('DATABASE IS STILL OPEN.');
    }
};

const corsOptions = {};
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, "public")));

app.use('/v1', indexRouter);
app.get('/v1/states', getStates);
app.get('/v1/req', getData);

export default app;
