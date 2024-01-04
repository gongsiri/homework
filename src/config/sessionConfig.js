const sessionConfig = () => {
    return {
        secret: 'secretKey',
        resave: false,
        saveUninitialized: true
    }
}

module.exports = sessionConfig