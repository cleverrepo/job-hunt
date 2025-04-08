import cron from 'cron';
import https from 'https'; // or keep http if your API doesn't support HTTPS
import { URL } from 'url';

// Validate environment variable first
if (!process.env.API_URL) {
  throw new Error('API_URL environment variable is not defined');
}

// Parse URL once at startup
let apiUrl;
try {
  apiUrl = new URL(process.env.API_URL);
} catch (err) {
  throw new Error(`Invalid API_URL: ${err.message}`);
}

const job = new cron.CronJob(
  '*/14 * * * *', // Every 14 minutes
  async () => {
    try {
      const request = https.request(apiUrl, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('GET request succeeded');
          } else {
            console.error(`Request failed with status ${res.statusCode}`);
            console.error('Response:', data);
          }
        });
      });

      request.on('error', (err) => {
        console.error('Request error:', err);
      });

      request.end();
    } catch (err) {
      console.error('Unexpected error in cron job:', err);
    }
  },
  null, // onComplete
  true, // auto start
  'UTC' // timezone
);

// Handle process termination
process.on('SIGTERM', () => {
  job.stop();
  console.log('Cron job stopped gracefully');
});

process.on('SIGINT', () => {
  job.stop();
  console.log('Cron job stopped gracefully');
});

export default job;