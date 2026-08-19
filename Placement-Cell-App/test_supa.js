const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://qcmjmdsoygrfcitnnqac.supabase.co";
const SUPABASE_KEY = "sb_publishable__scO4pQv-Xft14X53GiO0Q_XoD4VwNz";

async function testInit() {
    const client = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data: studentsData, error: sErr } = await client.from('students').select('*');
    console.log("Students Error:", sErr);
    console.log("Students Data Length:", studentsData ? studentsData.length : 0);

    const { data: teachersData, error: tErr } = await client.from('teachers').select('*');
    console.log("Teachers Data Length:", teachersData ? teachersData.length : 0);
}
testInit();
