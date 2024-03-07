import express from 'express';
import expressLoader from './express';
import mongooseLoader from './mongoose';


export default async ({ expressApp }: { expressApp: express.Application }) => {
    const mongoConnection = await mongooseLoader();
    console.log('MongoDB Intialized');
    await expressLoader({ app: expressApp });
    console.log('Express Intialized');

    // Initialize the other components like redis and others
}