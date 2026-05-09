# 🏥 Clinique Refontiq - Système de Gestion Médicale

Système complet de gestion clinique pour médecins, infirmières et réceptionnistes.

## 📋 Vue d'ensemble

Ce dashboard médical a été conçu avec un design system moderne adapté pour le secteur médical, basé sur le design "Indigo Professional" de SkillSwap mais avec une palette de couleurs médicales professionnelles.

### 🎨 Design System

**Palette de couleurs médicales :**
- **Primary (Bleu Médical)** : `#0077b6` - Navigation, actions principales
- **Secondary (Vert Santé)** : `#2a9d8f` - Succès, confirmations
- **Accent (Orange Alerte)** : `#e76f51` - Urgences, alertes
- **Background** : `#f8fafc` - Fond léger et propre
- **Text** : `#1e293b` - Texte principal
- **Text Light** : `#64748b` - Texte secondaire

**Typographie :**
- **Headings** : Space Grotesk (moderne, technique)
- **Body** : Inter (lisibilité optimale)

**Composants UI :**
- Coins arrondis : 8-16px
- Ombres douces avec teinte bleu
- Bordures subtiles 1px
- Animations fluides (0.2s - 0.3s)

## 📁 Structure du Projet

```
refontiq-dashboard/
├── index.html              # Page de connexion
├── dashboard.html          # Tableau de bord principal
├── patients.html           # Gestion des patients (3 onglets)
├── consultations.html      # Gestion des consultations (3 onglets)
├── rendez-vous.html        # Gestion des rendez-vous
├── finance.html           # Gestion financière
├── stocks.html            # Gestion des stocks
├── messagerie.html        # Messagerie interne
├── alertes.html          # Système d'alertes
└── parametres.html        # Paramètres utilisateur
```

## 🔐 Authentification

### Comptes de démonstration

**Médecin :**
- Email : `dr.duval@refontiq.ci`
- Mot de passe : `medecin2024`

**Infirmière :**
- Email : `infirmiere.martin@refontiq.ci`
- Mot de passe : `infirmiere2024`

**Réceptionniste :**
- Email : `reception@refontiq.ci`
- Mot de passe : `reception2024`

### Gestion des rôles

Le système adapte l'interface selon le rôle de l'utilisateur :
- Médecin : Accès complet aux consultations et prescriptions
- Infirmière : Accès aux consultations et patients
- Réceptionniste : Accès aux rendez-vous, patients et accueil

## 📱 Pages et Fonctionnalités

### 1. Page de Connexion (`index.html`)
- Formulaire de connexion sécurisé
- Sélection du rôle
- Comptes de démonstration (accès rapide)
- Récupération de mot de passe (à implémenter)

### 2. Tableau de Bord (`dashboard.html`)
- **Statistiques du jour :**
  - Patients accueillis
  - Consultations effectuées
  - En attente
  - Revenus du jour

- **Patients récents :** Liste avec statut
- **Alertes :** Stock critique, RDV manqué, résultats
- **Actions rapides :** Nouveau patient, consultation, RDV, stocks, messagerie, factures

### 3. Gestion des Patients (`patients.html`)

**Onglet 1 - Liste des patients :**
- Tableau avec recherche
- Informations : Nom, date de naissance, téléphone, dernière visite, statut
- Clic pour voir la fiche détaillée

**Onglet 2 - Fiche détaillée :**
- Profil patient (avatar, âge, groupe sanguin, visites)
- Informations personnelles
- Informations médicales (allergies, maladies chroniques, médecin traitant)
- Historique médical (consultations précédentes)

**Onglet 3 - Nouveau patient :**
- Formulaire complet
- Informations personnelles (nom, prénom, date de naissance, sexe, téléphone, email, adresse)
- Informations médicales (groupe sanguin, médecin traitant, allergies, maladies chroniques)
- Notes additionnelles

### 4. Gestion des Consultations (`consultations.html`)

**Onglet 1 - Consultations du jour :**
- Timeline des consultations
- Types : Consultation standard, Urgence, Suivi, Planifié
- Durée et priorité
- Clic pour voir le compte-rendu

**Onglet 2 - Créer consultation :**
- Sélection du patient
- Type de consultation (standard, urgence, suivi, bilan, vaccination)
- Date, heure, durée estimée
- Priorité (normale, haute, urgente)
- Motif de consultation
- Symptômes observés
- Historique médical pertinent
- Notes du médecin (observations, prescriptions, recommandations)

**Onglet 3 - Comptes-rendus :**
- Liste des consultations terminées
- Comptes-rendus détaillés :
  - Motif
  - Symptômes
  - Diagnostic
  - Traitement
  - Observations
- Actions : Imprimer, Modifier

### 5. Pages restantes (à créer)

**Rendez-vous :**
- Calendrier des RDV
- Création de RDV
- Confirmations
- Rappels

**Finance :**
- Revenus/jour/mois/année
- Paiements en attente
- Facturation
- Rapports financiers

**Stocks :**
- Inventaire des médicaments
- Alertes de rupture
- Commandes fournisseurs
- Suivi des stocks

**Messagerie :**
- Boîte de réception
- Nouveau message
- Archives
- Notifications

**Alertes :**
- Alertes actives
- Historique
- Paramètres de notifications
- Types : Stock, RDV, Système

**Paramètres :**
- Profil utilisateur
- Configuration clinique
- Sécurité
- Préférences

## 🔗 Navigation

Toutes les pages sont interconnectées via la **sidebar de navigation** :
- **Principal** : Tableau de bord, Patients, Consultations, Rendez-vous
- **Gestion** : Finance, Stocks, Messagerie
- **Système** : Alertes, Paramètres

Chaque page met à jour la classe `active` sur l'onglet de navigation correspondant.

## 🎯 Cas d'usage

### Pour un Médecin
1. Se connecter avec le compte médecin
2. Voir les statistiques sur le dashboard
3. Consulter la liste des patients
4. Créer une nouvelle consultation
5. Rédiger le compte-rendu
6. Prescrire des traitements

### Pour une Infirmière
1. Se connecter avec le compte infirmière
2. Voir les patients en attente
3. Consulter les dossiers médicaux
4. Suivre les recommandations du médecin
5. Mettre à jour les informations patients

### Pour un Réceptionniste
1. Se connecter avec le compte réceptionniste
2. Créer un nouveau patient
3. Planifier des rendez-vous
4. Gérer les paiements
5. Communiquer avec les patients

## 🔧 Personnalisation

### Modifier les couleurs

Dans chaque fichier HTML, modifiez les variables CSS dans `:root` :

```css
:root {
    --primary: #0077b6;        /* Bleu principal */
    --secondary: #2a9d8f;      /* Vert succès */
    --accent: #e76f51;         /* Orange alerte */
    /* ... autres variables */
}
```

### Adapter les textes

Tous les textes sont en français. Pour adapter :
- Modifiez les titres dans le HTML
- Adaptez les placeholders des formulaires
- Personnalisez les messages d'alerte

## 📊 Intégration Supabase (à venir)

### Structure de base de données

```sql
-- Tables principales
users (id, email, password, role, nom, prenom, created_at)
patients (id, nom, prenom, date_naissance, sexe, telephone, email, adresse, groupe_sanguin, allergies, maladies, created_at)
consultations (id, patient_id, medecin_id, type, date, heure, duree, priorite, motif, symptomes, historique, notes, status, created_at)
appointments (id, patient_id, medecin_id, date, heure, statut, notes, created_at)
payments (id, patient_id, consultation_id, montant, methode, statut, date_paiement, created_at)
inventory (id, nom, categorie, quantite, seuil_alerte, fournisseur, created_at)
messages (id, expediteur_id, destinataire_id, sujet, contenu, lu, created_at)
alerts (id, type, message, priorite, lu, created_at)
```

### Étapes d'intégration

1. **Créer un projet Supabase**
   - Aller sur https://supabase.com
   - Créer un nouveau projet
   - Activer l'authentification par email/mot de passe

2. **Configurer la base de données**
   - Exécuter le SQL ci-dessus dans l'éditeur Supabase
   - Configurer les Row Level Security (RLS)
   - Créer les politiques d'accès par rôle

3. **Intégrer dans les fichiers HTML**
   - Ajouter le SDK Supabase dans chaque page
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```
   - Initialiser la connexion
   ```javascript
   const supabase = supabase.createClient('VOTRE_URL', 'VOTRE_KEY');
   ```

4. **Remplacer les données mock par des appels API**
   - Remplacer les tableaux JavaScript par des requêtes Supabase
   - Gérer les erreurs
   - Afficher les états de chargement

## 🎨 Responsivité

Le design est **100% responsive** :

- **Desktop (> 1200px)** : Sidebar visible, layout complet
- **Tablette (768px - 1200px)** : Sidebar masquée, grid ajusté
- **Mobile (< 768px)** : Sidebar masquée, layout vertical, formulaires en colonne unique

## 🚀 Lancement

### 1. Ouvrir la page de connexion
```bash
# Dans un navigateur
open index.html
```

### 2. Se connecter
Utiliser un compte de démonstration ou créer un compte Supabase

### 3. Naviguer
Explorer les différentes pages et fonctionnalités

## 📝 Améliorations futures

- [ ] Intégration complète de Supabase
- [ ] Authentification multi-facteurs (2FA)
- [ ] Notifications push
- [ ] Export PDF des comptes-rendus
- [ ] Intégration téléphonie (appels SIP)
- [ ] Module de facturation avancé
- [ ] API pour applications mobiles
- [ ] Tableau de bord analytics
- [ ] Gestion des fichiers médicaux
- [ ] Intégration avec laboratoires

## 🤝 Support

Pour toute question ou amélioration :
- Créer une issue sur GitHub
- Contacter l'équipe de développement
- Consulter la documentation

## 📄 Licence

Ce projet est propriété de Clinique Refontiq © 2026

---

**Créé avec ❤️ pour le système de santé ivoirien**