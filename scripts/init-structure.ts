import { execSync } from 'child_process';
import fs from 'fs';

// Create base folders if they don't exist
['src/controllers', 'src/routes', 'src/middleware', 'src/utils', 'src/modules/health'].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Optionally, initialize a README in src/
if (!fs.existsSync('src/README.md')) {
  fs.writeFileSync('src/README.md', '# Project Management API Source Code\n');
}

console.log('Project structure initialized.');
