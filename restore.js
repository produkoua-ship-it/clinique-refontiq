const fs = require('fs');

const missingContent = `                            <i class="fa-solid fa-calendar-day"></i> Aujourd'hui
                        </button>
                    </div>

                    <!-- Bande des 14 jours scrollable -->
                    <div class="calendar-strip" id="calendar-strip"></div>

                    <!-- Liste des RDV du jour sélectionné -->
                    <div style="margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--border);">
                        <h3 id="rdv-section-title">Rendez-vous du jour</h3>
                        <div id="list-rdv-dynamique" class="appointment-list">
                            <div class="appointment-card" onclick="window.location.href='dossier-patient.html?id=1'">
                                <div class="appointment-time">
                                    <span class="time">09:00</span>
                                    <span class="duration">30 min</span>
                                </div>
                                <div class="appointment-info">
                                    <div class="appointment-header">
                                        <div class="patient-name">Mme Kouassi Adèle</div>
                                        <span class="appointment-status status-confirmed">Confirmé</span>
                                    </div>
                                    <div class="appointment-reason">Migraine sévère</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <!-- Tab 2: Créer RDV -->
            <div class="tab-content" id="tab-new">
                <div class="card">
                    <form id="form-rendez-vous" onsubmit="enregistrerRendezVous(event)">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="patient">Patient *</label>
                                <select id="patient_id" required>
                                     <option value="">Chargement des patients...</option>
                                 </select>
                            </div>
                            <div class="form-group">
                                <label for="medecin">Médecin *</label>
                                <select id="medecin" required>
                                    <option value="">Sélectionner un médecin</option>
                                    <option value="1">Dr. Duval</option>
                                    <option value="2">Dr. Martin</option>
                                    <option value="3">Dr. Kouassi</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="date">Date *</label>
                                <input type="date" id="date_rdv" required>
                            </div>
                            <div class="form-group">
                                <label for="time">Heure *</label>
                                <input type="time" id="heure_rdv" required>
                            </div>
                            <div class="form-group">
                                <label for="duration">Durée *</label>
                                <select id="duration" required>
                                    <option value="15">15 minutes</option>
                                    <option value="30" selected>30 minutes</option>
                                    <option value="45">45 minutes</option>
                                    <option value="60">1 heure</option>
                                    <option value="90">1h30</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="type">Type de RDV *</label>
                                <select id="type" required>
                                    <option value="">Sélectionner</option>
                                    <option value="consultation">Consultation standard</option>
                                    <option value="suivi">Suivi / Contrôle</option>
                                    <option value="bilan">Bilan de santé</option>
                                    <option value="vaccination">Vaccination</option>
                                    <option value="urgence">Urgence</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group full-width">
                            <label for="reason">Motif du rendez-vous *</label>
                            <input type="text" id="reason" required
                                placeholder="Ex: Consultation de suivi, bilan annuel...">
                        </div>

                        <div class="form-group full-width">
                            <label for="notes">Notes additionnelles</label>
                            <textarea id="notes_rdv"
                                placeholder="Motif de consultation ou notes..."></textarea>
                        </div>

                        <div class="form-group full-width">
                            <label for="reminder">Rappel patient</label>
                            <select id="reminder">
                                <option value="none">Aucun rappel</option>
                                <option value="1day">1 jour avant</option>
                                <option value="2days" selected>2 jours avant</option>
                                <option value="1week">1 semaine avant</option>
                            </select>
                        </div>

                        <div style="display: flex; gap: 12px; margin-top: 24px;">
                            <button type="button" class="btn" onclick="switchTab('calendar')"
                                style="background: var(--bg); color: var(--text-light);">
                                <i class="fa-solid fa-times"></i>
                                Annuler
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fa-solid fa-calendar-check"></i>
                                Confirmer le rendez-vous
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Tableau de liste des RDV -->
                <div class="card" style="margin-top: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; font-weight: 700; color: var(--primary);">
                            <i class="fa-solid fa-list-ul" style="margin-right: 8px;"></i>Liste des rendez-vous enregistrés
                        </h3>
                        <button onclick="chargerListeRDV()" class="btn" style="background: var(--bg); color: var(--text-light); padding: 8px 16px; font-size: 0.85rem;">
                            <i class="fa-solid fa-rotate-right"></i> Actualiser
                        </button>
                    </div>
                    <div style="overflow-x: auto;">
                        <table class="patients-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Date &amp; Heure</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="table-rdv-body">
                                <tr>
                                    <td>
                                        <div style="display:flex; align-items:center; gap:12px;">
                                            <div style="width:36px; height:36px; border-radius:50%; background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.9rem;">
                                                KA
                                            </div>
                                            <div>
                                                <div style="font-weight:600; color:var(--text);">Kouassi Adèle</div>
                                                <div style="font-size:0.75rem; color:var(--text-light);">+225 01 02 03 04 05</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style="font-weight:600; color:var(--text);">Aujourd'hui</div>
                                        <div style="font-size:0.8rem; color:var(--text-light);">09:00 (30 min)</div>
                                    </td>
                                    <td>
                                        <span class="badge-confirme">Confirmé</span>
                                    </td>
                                    <td>
                                        <div style="display:flex; gap:8px;">
                                            <button class="btn-action" title="Modifier"><i class="fa-solid fa-pen" style="color:var(--primary);"></i></button>
                                            <button class="btn-action" title="Annuler"><i class="fa-solid fa-ban" style="color:var(--danger);"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Tab 3: Confirmations -->
            <div class="tab-content" id="tab-confirmed">`;

let file = fs.readFileSync('rendez-vous.html', 'utf8');

const target = `                        <button class="btn-today" onclick="reinitialiserCalendrier(new Date().toISOString().split('T')[0])">
            <!-- Tab 3: Confirmations -->
            <div class="tab-content" id="tab-confirmed">`;

if (file.includes(target)) {
    file = file.replace(target, `                        <button class="btn-today" onclick="reinitialiserCalendrier(new Date().toISOString().split('T')[0])">\n` + missingContent);
    fs.writeFileSync('rendez-vous.html', file, 'utf8');
    console.log('Restored content successfully.');
} else {
    console.log('Could not find the target string to replace.');
}
