#!/usr/bin/env node
const https = require('https');

const hookType = process.argv[2] || 'unknown';
const token = process.env.SLACK_BOT_TOKEN;
const channel = process.env.SLACK_NOTIFY_CHANNEL || '#general';

if (!token) {
  process.stderr.write('SLACK_BOT_TOKEN not set — skipping\n');
  process.exit(0);
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { raw += c; });
process.stdin.on('end', () => {
  let data = {};
  try { data = JSON.parse(raw); } catch {}

  let text;
  if (hookType === 'task_created') {
    const title = data.title || data.task_title || data.name || '(제목 없음)';
    text = `[film-lab] :clipboard: 새 태스크: *${title}*`;
  } else if (hookType === 'task_completed') {
    const title = data.title || data.task_title || data.name || '(제목 없음)';
    const owner = data.owner || data.assignee || '?';
    text = `[film-lab] :white_check_mark: 완료: *${title}* (${owner})`;
  } else {
    text = `[film-lab] 이벤트: ${hookType} — ${JSON.stringify(data)}`;
  }

  const payload = JSON.stringify({ channel, text });
  const req = https.request({
    hostname: 'slack.com',
    path: '/api/chat.postMessage',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, res => {
    let body = '';
    res.on('data', c => { body += c; });
    res.on('end', () => {
      try {
        const r = JSON.parse(body);
        if (!r.ok) process.stderr.write(`Slack error: ${r.error}\n`);
      } catch {}
    });
  });

  req.on('error', err => { process.stderr.write(`Slack request failed: ${err.message}\n`); });
  req.write(payload);
  req.end();
});
