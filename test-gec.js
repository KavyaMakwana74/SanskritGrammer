const fs = require('fs');
const engine = require('./js/sanskrit-grammar-engine.js');

const raw = fs.readFileSync('sanskrit_gec_training_data.csv', 'utf8');
const lines = raw.trim().split('\n').slice(1);

console.log('Testing ' + lines.length + ' rows from sanskrit_gec_training_data.csv:');

let passed = 0;
let failed = 0;

function norm(s) {
    return s.replace(/\s+/g, ' ')
            .replace(/[।॥,\.!\?;:()\[\]"'`]/g, '')
            .trim();
}

lines.forEach((l, i) => {
    if (!l.trim()) return;
    // CSV parser handling commas inside quotes if any, or standard split
    const parts = l.split(',');
    if (parts.length < 3) return;
    const id = parts[0].trim();
    const rawInput = parts[3] ? parts[3].trim() : parts[1].replace(/^correct sanskrit:\s*/, '').trim();
    const target = parts[2].trim();
    const cat = parts[4] ? parts[4].trim() : '';

    const res = engine.analyzeAndCorrect(rawInput);
    const got = res.corrected;
    const isMatch = (norm(got) === norm(target)) || (got.trim() === target.trim());

    if (isMatch) {
        passed++;
        console.log('PASS ' + id + ': ' + rawInput + ' -> ' + got);
    } else {
        failed++;
        console.log('FAIL ' + id + ' (' + cat + '):');
        console.log('  Input:    ' + rawInput);
        console.log('  Expected: ' + target);
        console.log('  Got:      ' + got);
        console.log('  Issues:   ' + JSON.stringify(res.issues.map(x => x.origToken + ' -> ' + x.correctedToken + ' (' + x.category + ')')));
    }
});

console.log('\nResult: ' + passed + ' / ' + (passed + failed) + ' passed (' + Math.round(passed / (passed + failed) * 100) + '%)');
