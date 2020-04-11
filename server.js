const express = require('express');
const app = express();
const fs = require('fs');

// Dynamically load routes from /routes
const routePath = './lib/routes/';
fs.readdirSync(routePath).forEach((file) => {
    const route = routePath + file;
    // eslint-disable-next-line global-require
    require(route)(app);
});

app.listen(5000, () => {
    // eslint-disable-next-line no-console
    console.log('Node server is running on port 5000');
});
