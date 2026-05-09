const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function check() {
    try {
        const configContent = fs.readFileSync('supabase-config.js', 'utf8');
        const url = configContent.match(/SUPABASE_URL:\s*['"](.+?)['"]/)[1];
        const key = configContent.match(/SUPABASE_KEY:\s*['"](.+?)['"]/)[1];

        const supabase = createClient(url, key);

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0];
        
        console.log('Today:', today);
        console.log('Current Time:', currentTime);
        
        const { data, error } = await supabase
            .from('rendez_vous')
            .select('id, heure, statut, patient_id, patients(nom, prenom)')
            .eq('date', today);
            
        if (error) {
            console.error('Error:', error);
        } else if (!data || data.length === 0) {
            console.log('No appointments found for today in the database.');
        } else {
            console.log('Appointments for today:');
            data.forEach(r => {
                const name = r.patients ? `${r.patients.nom} ${r.patients.prenom}` : 'Unknown';
                console.log(`- ${r.heure} | ${name} | Status: ${r.statut}`);
            });
        }
    } catch (e) {
        console.error('Script error:', e.message);
    }
}

check();
