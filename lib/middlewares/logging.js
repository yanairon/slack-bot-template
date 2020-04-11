'use strict';
const logger = {
    info: (props, text) => {
        // you logger implementation, do something with props and text
        console.log(text);
        console.log(props);
    }
};

async function logRequest(req, res, next) {
    const channel = req.body.channel_name;
    const user = req.body.user_name;
    const command = req.body.command;

    const props = {
        slack_channel: channel,
        slack_user: user,
        slack_command: command,
        slack_search_text: req.body.text
    };

    logger.info(props, `New request [${command}] for user: ${user}, channel: ${channel}`);

    next();
}

module.exports = logRequest;
