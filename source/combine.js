const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { exec } = require('child_process');

const directory = 'source'; 
const outputFile = 'bundle.js'; 

const files = glob.sync(path.join(directory, '**/*.js'));

if (files.length === 0) {
    console.error('No JavaScript files found to bundle!');
    process.exit(1);
}

const content = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');

fs.mkdirSync(path.dirname(outputFile), { recursive: true });

fs.writeFileSync(outputFile, content);
console.log(`Bundle created at ${outputFile}`);

exec(`node ${outputFile}`, (err, stdout, stderr) => {
    if (err) {
        console.error(`Error executing file: ${err.message}`);
        return;
    }
    if (stderr) {
        console.error(`Error output: ${stderr}`);
    }
    console.log(`Output:\n${stdout}`);
});
