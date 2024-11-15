const cds = require('@sap/cds');

// Add custom middleware to intercept incoming requests
cds.on('bootstrap', app => {
    // Middleware to log Authorization token
    app.use((req, res, next) => {
        const authHeader = req.headers['authorization'];

        if (authHeader) {
            // Log the token
            console.log('Authorization Token:', authHeader);
        } else {
            console.log('No Authorization Token provided');
        }

        // Proceed to the next middleware or handler
        next();
    });
});

// Serve CAP OData and REST services
module.exports = cds.server;%
