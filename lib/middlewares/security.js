/*
This code, taking (and modified) from https://medium.com/@rajat_sriv/verifying-requests-from-slack-using-node-js-69a8b771b704
will make sure only your organization can access your slack bot
Since your rest service will be publicly available, this is a crucial security measure
 */

'use strict';

const crypto = require('crypto');
const qs = require('qs');


async function validateMessage(req, res, next) {
    const slackSigningSecret = '<YOUR SIGNING SECRET>';
    const slackSignature = req.headers['x-slack-signature'];
    const requestBody = qs.stringify(req.body, {format: 'RFC1738'});
    const timestamp = req.headers['x-slack-request-timestamp'];
    const time = Math.floor(new Date().getTime() / 1000);
    if (Math.abs(time - timestamp) > 300) {
        return res.status(400).send('Ignore this request.');
    }
    if (!slackSigningSecret) {
        return res.status(400).send('Slack signing secret is empty.');
    }
    const sigBasestring = `v0:${timestamp}:${requestBody}`;
    const mySignature = `v0=${
        crypto.createHmac('sha256', slackSigningSecret)
            .update(sigBasestring, 'utf8')
            .digest('hex')}`;
    if (mySignature && slackSignature &&
        crypto.timingSafeEqual(
            Buffer.from(mySignature, 'utf8'),
            Buffer.from(slackSignature, 'utf8'))
    ) {
        next();
    } else {
        return res.status(400).send('Verification failed');
    }
}

module.exports = validateMessage;

