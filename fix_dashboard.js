const fs = require('fs');

let file = fs.readFileSync('dashboard.html', 'utf8');

const regex = /\$\{contenuTicket\}[\s\S]*?<\/html>/;
if (regex.test(file)) {
    const replacement = `\${contenuTicket}
                    </body>
                </html>
            \`);
            fenetreImpression.document.close();
        }
    </script>
    <script>
        function toggleMobileSidebar() {
            document.querySelector('.sidebar').classList.toggle('active');
            document.getElementById('sidebarOverlay').classList.toggle('active');
            // Empêcher le scroll du body quand le menu est ouvert
            document.body.style.overflow = document.querySelector('.sidebar').classList.contains('active') ? 'hidden' : '';
        }
    </script>
</body>
</html>`;
    file = file.replace(regex, replacement);
    fs.writeFileSync('dashboard.html', file, 'utf8');
    console.log("Fixed dashboard.html!");
} else {
    console.log("Regex didn't match!");
}
