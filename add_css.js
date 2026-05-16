const fs = require('fs');

const cssToAppend = `
/* GLOBAL MOBILE BOTTOM NAV & QUICK ACTIONS */
@media (max-width: 1024px) {
    .mobile-bottom-nav {
        display: flex !important;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 70px;
        background: var(--card);
        border-top: 1px solid var(--border);
        z-index: 9999;
        justify-content: space-around;
        align-items: center;
        padding-bottom: env(safe-area-inset-bottom);
        box-shadow: 0 -4px 15px rgba(0,0,0,0.1);
        transform: translateZ(0);
    }
    [data-theme="dark"] .mobile-bottom-nav { background: #1e293b; }
    
    .mobile-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        color: var(--text-light);
        text-decoration: none;
        font-size: 0.7rem;
        font-weight: 600;
        flex: 1;
    }
    .mobile-nav-item.active { color: var(--primary); }
    .mobile-nav-item i { font-size: 1.2rem; }
    
    .mobile-nav-item.more-btn {
        background: var(--primary);
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        margin-top: -30px;
        box-shadow: 0 4px 15px rgba(14, 165, 233, 0.4);
        border: 4px solid var(--bg);
        justify-content: center;
        flex: none;
        cursor: pointer;
    }
    .mobile-nav-item.more-btn i { font-size: 1.4rem; }

    .mobile-quick-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(4px);
        z-index: 2200;
        display: none;
        opacity: 0;
        transition: 0.3s;
    }
    .mobile-quick-overlay.active { display: block; opacity: 1; }
    
    .mobile-quick-actions {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%) scale(0.9);
        width: 90%;
        max-width: 380px;
        background: var(--card);
        border-radius: 24px;
        padding: 30px 20px;
        z-index: 2300;
        transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        opacity: 0;
        pointer-events: none;
    }
    .mobile-quick-actions.active { 
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
        pointer-events: auto;
    }
    
    .quick-actions-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
    }
    .quick-action-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 15px;
        background: var(--bg);
        border-radius: 20px;
        text-decoration: none;
        color: var(--text);
        font-size: 0.8rem;
        font-weight: 600;
        transition: 0.2s;
        text-align: center;
    }
    .quick-action-item:active { transform: scale(0.95); background: var(--primary-light); }
    .quick-action-item i {
        width: 45px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-light);
        color: var(--primary);
        border-radius: 12px;
        font-size: 1.2rem;
        margin-bottom: 5px;
    }
}
`;

const filePath = 'assets/premium-style.css';
let content = fs.readFileSync(filePath, 'utf8');
if (!content.includes('GLOBAL MOBILE BOTTOM NAV')) {
    fs.appendFileSync(filePath, '\\n' + cssToAppend);
    console.log("CSS appended to premium-style.css");
} else {
    console.log("CSS already exists.");
}
