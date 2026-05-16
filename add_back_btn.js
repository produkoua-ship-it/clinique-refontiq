const fs = require('fs');
const path = require('path');

const dir = 'app';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'dashboard.html');

const injection = `<a href="dashboard.html" class="mobile-back-header-btn" style="display: none; background: rgba(14, 165, 233, 0.1); color: var(--primary); width: 40px; height: 40px; border-radius: 12px; align-items: center; justify-content: center; text-decoration: none; flex-shrink: 0; margin-right: 12px;"><i class="fa-solid fa-arrow-left"></i></a>`;

files.forEach(file => {
    let filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already injected
    if (content.includes('mobile-back-header-btn')) {
        console.log(`Skipping ${file} - already injected`);
        return;
    }

    // Replace <h1>Title</h1> with the flex container
    // We'll search for <div class="page-title"> and the next line <h1>...</h1>
    // Actually, finding <h1> and prepending the injection if it's inside <div class="page-title"> is safer.
    
    // Regex to match <div class="page-title">...<h1>...</h1>
    // Some pages just have <h1> inside <div class="card-header"> or something.
    // Let's just find the first <h1> and inject the button right before it, wrapping it if necessary.
    
    const h1Match = content.match(/<h1(.*?)>(.*?)<\/h1>/i);
    if (h1Match) {
        const originalH1 = h1Match[0];
        const newH1 = `<div style="display: flex; align-items: center;">
                            ${injection}
                            ${originalH1.replace('style="', 'style="margin:0; ')}
                        </div>`;
        
        // Only replace the FIRST occurrence
        content = content.replace(originalH1, newH1);
        
        fs.writeFileSync(filePath, content);
        console.log(`Injected into ${file}`);
    } else {
        console.log(`No <h1> found in ${file}`);
    }
});
