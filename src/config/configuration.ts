export default () => ({
    port: process.env.PORT,
    frontend_url: process.env.FRONTEND_URL,
    jwt: {
        access_token: {
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            expires_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
        },
        refresh_token: {
            secret: process.env.JWT_REFRESH_TOKEN_SECRET,
            expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
        },
    },
    cookie: {
        secret: process.env.COOKIE_SECRET,
        access_token_max_age: process.env.COOKIE_ACCESS_TOKEN_MAX_AGE,
        refresh_token_max_age: process.env.COOKIE_REFRESH_TOKEN_MAX_AGE,
    },
    database: {
        url: process.env.POSTGRES_URL,
    }
});