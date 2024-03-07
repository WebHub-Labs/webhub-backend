import dotenv from 'dotenv'
dotenv.config()
export default {
    port: process.env.PORT || 8080,
    database_URL: process.env.DATABASE_URI || 'http://localhost/8080',
}