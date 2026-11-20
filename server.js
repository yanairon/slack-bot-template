'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

if (!process.env.SLACK_SIGNING_SECRET) {
    throw new Error('SLACK_SIGNING_SECRET environment variable is required');
}

const app = express();

function captureRawBody(req, res, buf) {
    req.rawBody = buf.toString('utf8');
}

app.use(express.json({verify: captureRawBody}));
app.use(express.urlencoded({extended: true, verify: captureRawBody}));

const routePath = path.join(__dirname, 'lib', 'routes');
fs.readdirSync(routePath).forEach((file) => {
    // eslint-disable-next-line global-require
    require(path.join(routePath, file))(app);
});

if (require.main === module) {
    app.listen(5000, () => {
        // eslint-disable-next-line no-console
        console.log('Node server is running on port 5000');
    });
}

module.exports = app;
