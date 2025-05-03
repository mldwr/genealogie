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
      version: 'inserted',
      valid_from: now,
      valid_to: null,
      updated_at: now,
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
        updated_at: updateTime,
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
        id: undefined, // Let Supabase generate a new ID
        Familienname: 'UpdatedName', // Change some data
        version: 'inserted',
        logical_id: personId,
        valid_from: updateTime,
        valid_to: null,
        updated_at: updateTime,
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
      .eq('logical_id', personId)
      .is('valid_to', null)
      .single();
      
    if (currentError) {
      throw new Error(`Failed to fetch current version: ${currentError.message}`);
    }
    
    console.log('Current version:', {
      id: currentVersion.id,
      logical_id: currentVersion.logical_id,
      Familienname: currentVersion.Familienname,
      valid_from: currentVersion.valid_from,
      valid_to: currentVersion.valid_to
    });
    
    // 4. Fetch the history of the record
    console.log('Fetching record history...');
    const { data: history, error: historyError } = await supabase
      .from('deport')
      .select('*')
      .or(`id.eq.${personId},logical_id.eq.${personId}`)
      .order('valid_from', { ascending: false });
      
    if (historyError) {
      throw new Error(`Failed to fetch history: ${historyError.message}`);
    }
    
    console.log('Record history:');
    history.forEach((record, index) => {
      console.log(`Version ${index + 1}:`, {
        id: record.id,
        logical_id: record.logical_id,
        Familienname: record.Familienname,
        valid_from: record.valid_from,
        valid_to: record.valid_to,
        version: record.version
      });
    });
    
    // 5. Clean up test data
    console.log('Cleaning up test data...');
    for (const record of history) {
      const { error: deleteError } = await supabase
        .from('deport')
        .delete()
        .eq('id', record.id);
        
      if (deleteError) {
        console.warn(`Warning: Failed to delete test record ${record.id}: ${deleteError.message}`);
      }
    }
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testHistorization();
