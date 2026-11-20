/*
Rejects requests that were not signed by Slack.
The signing secret is taken from SLACK_SIGNING_SECRET and must be set before startup.
 */

'use strict';

const crypto = require('crypto');

const SIGNATURE_VERSION = 'v0';
const SIGNATURE_PATTERN = /^v0=[0-9a-f]{64}$/;
const TIMESTAMP_PATTERN = /^\d+$/;
const MAX_REQUEST_AGE_SECONDS = 5 * 60;

const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

if (!slackSigningSecret) {
    throw new Error('SLACK_SIGNING_SECRET environment variable is required');
}

function unauthorized(res) {
    return res.status(401).send('Verification failed');
}

function validateMessage(req, res, next) {
    const slackSignature = req.headers['x-slack-signature'];
    const timestamp = req.headers['x-slack-request-timestamp'];

    if (typeof slackSignature !== 'string' || !SIGNATURE_PATTERN.test(slackSignature)) {
        return unauthorized(res);
    }

    if (typeof timestamp !== 'string' || !TIMESTAMP_PATTERN.test(timestamp)) {
        return unauthorized(res);
    }

    const requestTimestamp = Number(timestamp);
    const now = Math.floor(Date.now() / 1000);
    // Reject timestamps more than five minutes from the server clock, in either
    // direction, so a captured request cannot be replayed.
    if (!Number.isSafeInteger(requestTimestamp)
        || Math.abs(now - requestTimestamp) > MAX_REQUEST_AGE_SECONDS) {
        return unauthorized(res);
    }

    const rawBody = typeof req.rawBody === 'string' ? req.rawBody : '';
    const sigBasestring = `${SIGNATURE_VERSION}:${timestamp}:${rawBody}`;
    const mySignature = `${SIGNATURE_VERSION}=${crypto.createHmac('sha256', slackSigningSecret)
        .update(sigBasestring, 'utf8')
        .digest('hex')}`;

    const expected = Buffer.from(mySignature, 'utf8');
    const received = Buffer.from(slackSignature, 'utf8');

    // timingSafeEqual throws when the buffers have different lengths.
    if (expected.length !== received.length) {
        return unauthorized(res);
    }

    if (!crypto.timingSafeEqual(expected, received)) {
        return unauthorized(res);
    }

    return next();
}

module.exports = validateMessage;
