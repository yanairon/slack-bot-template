/*
This middleware will allow every command who use it to have a help parameter resulting in a short help being presented
Help files are stored in the resources/ directory, and can be written using https://api.slack.com/tools/block-kit-builder
 */

'use strict';

const fs = require('fs');
const path = require('path');

async function provideHelp(req, res, next) {
    if (req.body.text.toLowerCase().trim() === 'help') {
        const command = req.body.command;

        // Get content from the help file
        const jsonPath = path.join(__dirname, '..', '..', 'resources', `${command.replace('/', '')}.json`);
        try {
            const help = fs.readFileSync(jsonPath);

            // Convert to JSON type
            const jsonHelp = JSON.parse(help);

            res.json(jsonHelp);
        } catch (e) {
            next();
        }
    } else {
        next();
    }
}

module.exports = provideHelp;
