import { User } from './entities/User';
import { ApolloServer } from 'apollo-server-express';
import path from 'path';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import { userResolver } from './resolvers/user';
import { Context } from './types';


export default async () => {
	// create connection
	await createConnection({
		type: 'postgres',
		host: 'localhost',
		port: 5432,
		username: 'postgres',
		password: 'Shadow@0802',
		database: 'test',
		logging: true,
		synchronize: true,
		migrations: [path.join(__dirname, './migrations/*')],
		entities: [User],
	});
	// connection.runMigrations()

	// Init apollo server

	return new ApolloServer({
		schema: await buildSchema({
			resolvers: [userResolver],
			validate: false,
		}),
		context: ({ req, res }): Context => ({
			req,
			res,
		}),
	});
};
