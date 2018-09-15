import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';
import dotenv from 'dotenv'
import nunjucks from 'nunjucks';
import path from 'path';

/*
 * Load .env
 */
dotenv.config();

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

/*// Setup nunjucks templating engine
nunjucks.configure('views', {
    autoescape: true,
    express: app
});*/

app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'html');
nunjucks.configure(app.get('views'), {
    autoescape: true,
    express: app
});



// connect to db
initializeDb( db => {

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/api', api({ config, db }));

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
	});

});

export default app;
