const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://qcmjmdsoygrfcitnnqac.supabase.co";
const SUPABASE_KEY = "sb_publishable__scO4pQv-Xft14X53GiO0Q_XoD4VwNz";

async function checkAll() {
    const client = createClient(SUPABASE_URL, SUPABASE_KEY);
    const tables = ['students', 'teachers', 'training_programs', 'placement_activities', 'exams', 'exam_attempts', 'class_incharge'];
    
    for (const table of tables) {
        const { error } = await client.from(table).select('*').limit(1);
        if (error) {
            console.log(`Table ${table} Error:`, error.message, error.code);
        } else {
            console.log(`Table ${table} OK`);
        }
    }
}
checkAll();
