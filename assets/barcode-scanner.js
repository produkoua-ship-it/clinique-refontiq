/**
 * Refontiq Barcode Scanner Utility
 * Detects rapid keyboard input (scanners) and triggers actions.
 */

const BarcodeScanner = {
    buffer: "",
    lastTime: 0,
    threshold: 30, // ms entre les touches (un humain tape > 80ms)
    callback: null,

    init(onScanCallback) {
        this.callback = onScanCallback;
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        console.log("[BarcodeScanner] Initialized and listening...");
    },

    handleKeyDown(e) {
        const currentTime = new Date().getTime();
        
        // Si c'est la touche 'Enter', on traite le buffer
        if (e.key === 'Enter') {
            if (this.buffer.length > 2) {
                console.log("[BarcodeScanner] Scan detected:", this.buffer);
                if (this.callback) this.callback(this.buffer);
                
                // UX: Vider le champ de saisie s'il y en a un de focus
                if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
                    document.activeElement.value = "";
                }
            }
            this.buffer = "";
            return;
        }

        // Vérifier si la touche est tapée assez vite pour être un scan
        if (currentTime - this.lastTime > this.threshold) {
            // Trop lent, ce n'est probablement pas un scanner, on vide le buffer
            this.buffer = "";
        }

        // Ajouter le caractère au buffer (ignorer les touches de contrôle)
        if (e.key.length === 1) {
            this.buffer += e.key;
        }

        this.lastTime = currentTime;
    }
};
