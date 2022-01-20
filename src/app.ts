import cors from 'cors';
import express from 'express';
import session from 'express-session';
import 'reflect-metadata';
import { __prod__ } from './constants';
import apollo from './apollo';
require('dotenv').config()

const main = async () => {
	// Initialoze express app
	const app = express();

	// Use Middlewares
  console.log(process.env.CORS_ORIGIN);
	app.use(
		cors()
	);
	app.use(
    session({
      name: 'uid',
			secret: process.env['SESSION_SECRET']!,
			cookie: {
				httpOnly: true,
				secure: __prod__,
				maxAge: 1000 * 60 * 60 * 24,
				sameSite: 'lax', // csrf
			},
			resave: false,
			saveUninitialized: false,
		})
	);

	const apolloServer = await apollo()

  await apolloServer.start()
  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: true
    },
    path: '/graphql',
  })

	app.listen(parseInt(process.env.PORT!), () => {
		console.log('Server Started at 4000');
	});
};

main().catch((error) => {
	console.log('Server error --> ', error);
});
