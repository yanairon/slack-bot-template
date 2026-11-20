'use strict';

process.env.SLACK_SIGNING_SECRET = 'test-signing-secret';

const assert = require('assert');
const crypto = require('crypto');
const http = require('http');
const path = require('path');
const {spawnSync} = require('child_process');
const {once} = require('events');
const {describe, it, before, after} = require('node:test');
const app = require('../server');

const SECRET = process.env.SLACK_SIGNING_SECRET;
const BODY = 'text=ping';

let server;
let port;

function nowSeconds() {
    return Math.floor(Date.now() / 1000);
}

function sign(body, timestamp, secret = SECRET) {
    const base = `v0:${timestamp}:${body}`;
    const digest = crypto.createHmac('sha256', secret)
        .update(base, 'utf8')
        .digest('hex');
    return `v0=${digest}`;
}

function post({
    body = BODY,
    timestamp = String(nowSeconds()),
    signature = sign(body, timestamp),
    includeSignature = true,
    includeTimestamp = true
} = {}) {
    const headers = {
        'content-type': 'application/x-www-form-urlencoded',
        'content-length': Buffer.byteLength(body)
    };

    if (includeSignature) {
        headers['x-slack-signature'] = signature;
    }
    if (includeTimestamp) {
        headers['x-slack-request-timestamp'] = timestamp;
    }

    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: '127.0.0.1',
            port,
            path: '/help',
            method: 'POST',
            headers
        }, (res) => {
            res.resume();
            res.on('end', () => resolve(res.statusCode));
        });
        req.on('error', reject);
        req.end(body);
    });
}

describe('Slack request signatures', () => {
    before(async () => {
        server = app.listen(0, '127.0.0.1');
        if (!server.listening) {
            await once(server, 'listening');
        }
        port = server.address().port;
    });

    after(async () => {
        if (!server) {
            return;
        }
        await new Promise((resolve, reject) => {
            server.close((error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    });

    it('returns 200 for a valid signature', async () => {
        const status = await post();
        assert.strictEqual(status, 200);
    });

    it('returns 401 for a bad signature', async () => {
        const timestamp = String(nowSeconds());
        const status = await post({
            timestamp,
            signature: sign(BODY, timestamp, 'wrong-secret')
        });
        assert.strictEqual(status, 401);
    });

    it('returns 401 when the signature header is missing', async () => {
        const status = await post({includeSignature: false});
        assert.strictEqual(status, 401);
    });

    it('returns 401 for a short signature', async () => {
        const status = await post({signature: 'v0=abc'});
        assert.strictEqual(status, 401);
    });

    it('returns 401 when the timestamp header is missing', async () => {
        const status = await post({includeTimestamp: false});
        assert.strictEqual(status, 401);
    });

    it('returns 401 for a timestamp older than five minutes', async () => {
        const timestamp = String(nowSeconds() - (5 * 60) - 1);
        const status = await post({
            timestamp,
            signature: sign(BODY, timestamp)
        });
        assert.strictEqual(status, 401);
    });
});

describe('startup', () => {
    it('fails fast when SLACK_SIGNING_SECRET is missing', () => {
        const env = Object.assign({}, process.env);
        delete env.SLACK_SIGNING_SECRET;

        const result = spawnSync(process.execPath, ['server.js'], {
            cwd: path.join(__dirname, '..'),
            env,
            encoding: 'utf8'
        });

        assert.notStrictEqual(result.status, 0);
        assert.match(`${result.stderr}`, /SLACK_SIGNING_SECRET/);
    });
});
