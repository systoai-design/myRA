import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, '..', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.html')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // Replace case-sensitive exact matches
    const newContent = content.replace(/myRA/g, 'MyRA');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        console.log('Updated', file);
    }
});

// Also update index.html
const indexHtmlPath = path.join(__dirname, '..', 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    const newIndexHtml = indexHtml.replace(/myRA/g, 'MyRA');
    if (indexHtml !== newIndexHtml) {
        fs.writeFileSync(indexHtmlPath, newIndexHtml);
        console.log('Updated', indexHtmlPath);
    }
}
