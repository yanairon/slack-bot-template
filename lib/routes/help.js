'use strict';
const validateMessage = require('../middlewares/security');
const fs = require('file-system');
const path = require('path');

function help(app) {
    app.post(`/help`,
        validateMessage,
        async (req, res) => {
            // Get content from the help file
            const jsonPath = path.join(__dirname, '..', '..', 'resources', 'help.json');
            const help = fs.readFileSync(jsonPath);

            // Convert to JSON type
            const jsonHelp = JSON.parse(help);

            res.json(jsonHelp);
        });
}

module.exports = help;
