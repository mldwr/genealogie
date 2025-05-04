// Test script for historization logic
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://fvhgvfdnfqbdsxiekbvo.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY; // Set this environment variable before running
const supabase = createClient(supabaseUrl, supabaseKey);

async function testHistorization() {
  try {
    console.log('Starting historization test...');

    // 1. Create a test record
    const now = new Date().toISOString();
    const testPerson = {
      Familienname: 'TestName',
      Vorname: 'TestVorname',
      Geschlecht: 'männlich',
      Geburtsjahr: '1900',
      Seite: 1,
      Laufendenr: 9999, // Use a high number to avoid conflicts
      Eintragsnr: 9999,
      valid_from: now,
      valid_to: null,
      updated_by: 'test@example.com'
    };

    console.log('Creating test record...');
    const { data: createdPerson, error: createError } = await supabase
      .from('deport')
      .insert(testPerson)
      .select();

    if (createError) {
      throw new Error(`Failed to create test record: ${createError.message}`);
    }

    console.log('Test record created:', createdPerson[0].id);
    const personId = createdPerson[0].id;

    // 2. Update the record
    console.log('Updating test record...');

    // First, get the current record
    const { data: currentRecord, error: fetchError } = await supabase
      .from('deport')
      .select('*')
      .eq('id', personId)
      .is('valid_to', null)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch current record: ${fetchError.message}`);
    }

    // Update the current record by setting valid_to
    const updateTime = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('deport')
      .update({
        valid_to: updateTime,
        updated_by: 'test@example.com'
      })
      .eq('id', personId);

    if (updateError) {
      throw new Error(`Failed to update current record: ${updateError.message}`);
    }

    // Create a new version of the record
    const { data: newRecord, error: insertError } = await supabase
      .from('deport')
      .insert({
        ...currentRecord,
        Familienname: 'UpdatedName', // Change some data
        valid_from: updateTime,
        valid_to: null,
        updated_by: 'test@example.com'
      })
      .select();

    if (insertError) {
      throw new Error(`Failed to create new version: ${insertError.message}`);
    }

    console.log('Record updated, new version created:', newRecord[0].id);

    // 3. Fetch the current record
    console.log('Fetching current record...');
    const { data: currentVersion, error: currentError } = await supabase
      .from('deport')
      .select('*')
      .eq('id', personId)
      .is('valid_to', null)
      .single();

    if (currentError && currentError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is expected
      throw new Error(`Failed to fetch current version: ${currentError.message}`);
    }

    if (currentVersion) {
      console.log('Current version:', {
        id: currentVersion.id,
        Familienname: currentVersion.Familienname,
        valid_from: currentVersion.valid_from,
        valid_to: currentVersion.valid_to
      });
    } else {
      console.log('No current version found with the original ID (expected)');
    }

    // 4. Fetch the history of the record
    console.log('Fetching record history...');
    const { data: history, error: historyError } = await supabase
      .from('deport')
      .select('*')
      .eq('id', personId)
      .order('valid_from', { ascending: false });

    if (historyError) {
      throw new Error(`Failed to fetch history: ${historyError.message}`);
    }

    console.log('Record history:');
    history.forEach((record, index) => {
      console.log(`Version ${index + 1}:`, {
        id: record.id,
        Familienname: record.Familienname,
        valid_from: record.valid_from,
        valid_to: record.valid_to
      });
    });

    // 5. Clean up test data
    console.log('Cleaning up test data...');
    // Delete the original record
    const { error: deleteError1 } = await supabase
      .from('deport')
      .delete()
      .eq('id', personId);

    if (deleteError1) {
      console.warn(`Warning: Failed to delete original test record: ${deleteError1.message}`);
    }

    // Delete the new record
    const { error: deleteError2 } = await supabase
      .from('deport')
      .delete()
      .eq('id', newRecord[0].id);

    if (deleteError2) {
      console.warn(`Warning: Failed to delete new test record: ${deleteError2.message}`);
    }

    console.log('Test completed successfully!');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testHistorization();
