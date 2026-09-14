const { execSync } = require('child_process');
const fs = require('fs');
const creds = fs.readFileSync('C:/Users/KillerGrowth/.openclaw/workspace/References/credentials.md', 'utf8');
const token = creds.match(/cfut_[A-Za-z0-9_-]+/)[0];
process.env.CLOUDFLARE_API_TOKEN = token;
const r = execSync('npx wrangler pages deploy dist --project-name killergrowth-reporting --commit-dirty=true', { encoding: 'utf8' });
console.log(r);
