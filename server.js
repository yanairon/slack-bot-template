const express = require('express');
const app = express();
const fs = require("fs");

// Dynamically load routes from /routes
const routePath = "./lib/routes/";
fs.readdirSync(routePath).forEach(function(file) {
    const route = routePath + file;
    require(route)(app);
});

app.listen(5000, function () {
    console.log('Node server is running on port 5000');
});
