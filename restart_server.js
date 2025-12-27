const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Restarting MatinaCloset server...');

// Kill processes on ports 4000 and 4001
exec('netstat -ano | findstr :4000', (error, stdout) => {
  if (stdout) {
    const lines = stdout.trim().split('\n');
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const pid = parts[parts.length - 1];
        console.log(`Killing process ${pid} on port 4000...`);
        exec(`taskkill /F /PID ${pid}`);
      }
    });
  }
});

exec('netstat -ano | findstr :4001', (error, stdout) => {
  if (stdout) {
    const lines = stdout.trim().split('\n');
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const pid = parts[parts.length - 1];
        console.log(`Killing process ${pid} on port 4001...`);
        exec(`taskkill /F /PID ${pid}`);
      }
    });
  }
});

// Wait a moment then start the server
setTimeout(() => {
  console.log('🚀 Starting fresh server...');
  const server = require('./server/server');
}, 2000);
