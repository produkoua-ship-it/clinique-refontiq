/**
 * Refontiq AI Core - Powered by Google Gemini
 */

const AICore = {
    isOpen: false,
    userRole: 'Personnel',
    userName: 'Utilisateur',
    API_KEY: 'AIzaSyDe_Ie3Wn1FAHh2GNvhLf3Bnb7yb55D6tc', // Nouvelle clé fournie par l'utilisateur
    
    init() {
        // Assistant IA désactivé à la demande de l'utilisateur
        return;
        this.injectHTML();
        this.loadUserContext();
        this.bindEvents();
        this.addWelcomeMessage();
    },

    injectHTML() {
        if (document.getElementById('ai-assistant-container')) return;
        const container = document.createElement('div');
        container.id = 'ai-assistant-container';
        container.innerHTML = `
            <button class="ai-trigger-btn" id="ai-trigger">
                <i class="fa-solid fa-sparkles"></i>
            </button>
            <div class="ai-panel" id="ai-panel">
                <div class="ai-header">
                    <div style="width:40px; height:40px; background:rgba(255,255,255,0.2); border-radius:10px; display:flex; align-items:center; justify-content:center;">
                        <i class="fa-solid fa-brain"></i>
                    </div>
                    <div class="ai-header-info">
                        <h4>Refontiq AI (Gemini 1.5)</h4>
                        <p id="ai-status">Intelligence Active</p>
                    </div>
                    <button id="ai-close" style="margin-left:auto; background:none; border:none; color:white; cursor:pointer; font-size:1.2rem;">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </div>
                <div class="ai-chat-area" id="ai-chat"></div>
                <div class="ai-suggestions" id="ai-suggestions"></div>
                <form class="ai-input-area" id="ai-form">
                    <input type="text" id="ai-input" placeholder="Demandez n'importe quoi à l'IA..." autocomplete="off">
                    <button type="submit" class="ai-send-btn">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        `;
        document.body.appendChild(container);
    },

    loadUserContext() {
        const u = localStorage.getItem('currentUser');
        if (u) {
            const user = JSON.parse(u);
            this.userRole = user.role || 'Personnel';
            this.userName = user.name || 'Utilisateur';
        }
    },

    bindEvents() {
        document.getElementById('ai-trigger').onclick = () => this.togglePanel();
        document.getElementById('ai-close').onclick = () => this.togglePanel();
        document.getElementById('ai-form').onsubmit = (e) => {
            e.preventDefault();
            this.handleUserMessage();
        };
    },

    togglePanel() {
        this.isOpen = !this.isOpen;
        document.getElementById('ai-panel').classList.toggle('active', this.isOpen);
        if (this.isOpen) {
            document.getElementById('ai-input').focus();
            this.updateSuggestions();
        }
    },

    addMessage(text, type = 'bot') {
        const chat = document.getElementById('ai-chat');
        const msg = document.createElement('div');
        msg.className = `ai-message ${type}`;
        // Nettoyage des étoiles Markdown si présentes
        msg.innerHTML = text.replace(/\*\*/g, '').replace(/\*/g, '');
        chat.appendChild(msg);
        chat.scrollTop = chat.scrollHeight;
    },

    addWelcomeMessage() {
        this.addMessage(`Bonjour ${this.userName}. Je suis votre assistant Gemini intégré à Refontiq. Je peux analyser vos patients, vos finances et vos lits en temps réel. Que puis-je faire pour vous ?`);
    },

    updateSuggestions() {
        const chips = document.getElementById('ai-suggestions');
        const suggestions = ["État des lits ?", "Rapport financier ?", "Chercher un patient"];
        chips.innerHTML = suggestions.map(s => `<div class="ai-chip" onclick="AICore.sendSuggestion('${s}')">${s}</div>`).join('');
    },

    sendSuggestion(text) {
        document.getElementById('ai-input').value = text;
        this.handleUserMessage();
    },

    async handleUserMessage() {
        const input = document.getElementById('ai-input');
        const text = input.value.trim();
        if (!text) return;

        this.addMessage(text, 'user');
        input.value = '';
        
        const chat = document.getElementById('ai-chat');
        const typing = document.createElement('div');
        typing.className = 'ai-message bot';
        typing.id = 'ai-typing';
        typing.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Gemini réfléchit...';
        chat.appendChild(typing);
        chat.scrollTop = chat.scrollHeight;

        try {
            await this.callGemini(text);
        } catch (err) {
            console.error("Erreur Gemini Core:", err);
            this.addMessage("Désolé, j'ai rencontré une difficulté technique pour contacter mon cerveau central. Cela peut être dû à un problème de réseau ou à une restriction de la clé API. Veuillez réessayer dans quelques instants.");
        } finally {
            const t = document.getElementById('ai-typing');
            if (t) t.remove();
        }
    },

    async callGemini(userQuery) {
        // 1. Collecte du contexte de la clinique
        const stats = {
            patients: document.getElementById('val-patients')?.textContent || 'Non visible actuellement',
            consultations: document.getElementById('val-consultations')?.textContent || 'Non visible actuellement',
            revenus: document.getElementById('val-revenus')?.textContent || 'Non visible actuellement',
            rdv_aujourdhui: document.getElementById('val-rdv')?.textContent || 'Non visible actuellement',
            lits: document.getElementById('val-lits')?.textContent || 'Non visible actuellement',
            impayes: document.getElementById('stat-pending')?.textContent || 'Non visible actuellement'
        };

        const systemPrompt = `Tu es l'IA experte de la Clinique Refontiq. Tu aides le personnel médical.
        Données actuelles : 
        - Patients: ${stats.patients}
        - Consultations: ${stats.consultations}
        - Revenus: ${stats.revenus}
        - RDV: ${stats.rdv_aujourdhui}
        - Lits: ${stats.lits}
        - Impayés: ${stats.impayes}

        Consignes : Réponds en français, de manière détaillée, sans étoiles (*) ni dièses (#).
        Question : ${userQuery}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Erreur API");
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiText = data.candidates[0].content.parts[0].text;
            this.addMessage(aiText);
        } else {
            throw new Error("Format de réponse invalide");
        }
    }
};

document.addEventListener('DOMContentLoaded', () => AICore.init());
