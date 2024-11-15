const approuter = require("@sap/approuter");
const jwtDecode = require("jwt-decode");
const xsenv = require('@sap/xsenv');
const xssec = require('@sap/xssec');

let ar = approuter();
ar.beforeRequestHandler.use((req, res, next) => {
    //based on node_modules/@sap/approuter/lib/middleware/request-handler.js
    //getToken is used to provide access token - we can make the path config tight
    if(!req.routerConfig.getToken){
        req.routerConfig.getToken = function(req,next){
            xsenv.loadEnv();
            let token = {};
            const services = xsenv.getServices({ xsuaa: { tag: 'xsuaa' } });
            xssec.createSecurityContext(req.user.token.accessToken, services.xsuaa, (err, securityContext) => {
                if (err) {
                    console.error('Error exchanging token:', err);
                    next(err,null);
                }
                const xsuaaToken = securityContext.getTokenInfo().getTokenValue();
                next(undefined,xsuaaToken);
            });
        }
    }
    console.log(`incoming token ${req.method} ${req.originalUrl} ${(req.headers && req.headers.authorization)?req.headers.authorization:'empty'}`);
    next();
});

require("@sap/xsenv").loadEnv();
ar.beforeRequestHandler.use("/getAppVariables", (req, res) => {
    if (process.env.appid == null) {
        res.statusCode = 403;
        res.end("Missing Appid");
    }
    res.end(JSON.stringify(process.env.appid));
});


ar.beforeRequestHandler.use("/getUserInfo", (req, res) => {
    if (!req.user) {
        res.statusCode = 403;
        res.end("Missing JWT Token");
    }
    res.statusCode = 200;
    let decodedJWTToken = jwtDecode(req.user.token.accessToken);
    res.end(JSON.stringify({
        decodedJWTToken
    }));
});

ar.beforeRequestHandler.use("/getUserToken", (req, res) => {
    if (!req.user) {
        res.statusCode = 403;
        res.end("Missing JWT Token");
    }
    res.statusCode = 200;
    let encodedJWTToken = req.user.token.accessToken;
    res.end(JSON.stringify({
        encodedJWTToken
    }));
});



ar.beforeRequestHandler.use("/exchangeToken", (req, res) => {

    xsenv.loadEnv();
    let token = {};
    const services = xsenv.getServices({ xsuaa: { tag: 'xsuaa' } });
    xssec.createSecurityContext(req.user.token.accessToken, services.xsuaa, (err, securityContext) => {
        if (err) {
            console.error('Error exchanging token:', err);
            return res.status(500).json({ message: 'Token exchange failed', error: err.message });
        }
        const xsuaaToken = securityContext.getTokenInfo().getTokenValue();
        token = jwtDecode(xsuaaToken);
        res.statusCode = 200;
        res.end(JSON.stringify({ token }));
    });

});

ar.start();