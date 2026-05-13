const fs = require('fs');
const content = fs.readFileSync('assets/mobile.css', 'utf8');
let balance = 0;
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let char of line) {
        if (char === '{') balance++;
        if (char === '}') balance--;
    }
    if (balance < 0) {
        console.log(`Unbalanced at line ${i + 1}: ${line}`);
        balance = 0; // reset
    }
}
console.log(`Final balance: ${balance}`);
