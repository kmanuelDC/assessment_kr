import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { PrismaClient } from '@prisma/client';
import resolversFactory from './resolvers.js';

const PORT = process.env.PORT || 4000;
const prisma = new PrismaClient();

const typeDefs = readFileSync(new URL('./schema.graphql', import.meta.url), 'utf8');
const resolvers = resolversFactory(prisma);


const server = new ApolloServer({
    typeDefs,
    resolvers,
});


await server.start();


const app = express();


app.use(
    cors({
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
    })
);


app.use(
    '/graphql',
    bodyParser.json(),
    expressMiddleware(server, {
        context: async ({ req }) => ({
            prisma,
            token: req.headers.authorization || null,
        }),
    })
);


app.get('/live', (_, res) => res.json({ ok: true }));


app.listen(PORT, () => {
    console.log(`🚀 GraphQL listo en http://localhost:${PORT}/graphql`);
});
