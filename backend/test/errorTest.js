async function runErrorTest() {
  const baseURL = 'http://localhost:5000';
  console.log('--- STARTING ERROR HANDLING TESTS ---');

  // 1. Missing file in register
  try {
    console.log('\n1. Register without file:');
    const formData = new FormData();
    formData.append('recordId', 'REC-ERR-1');
    const res = await fetch(`${baseURL}/api/register`, { method: 'POST', body: formData });
    const data = await res.json();
    console.log('Status:', res.status, 'Response:', data);
  } catch (e) {
    console.error(e);
  }

  // 2. Duplicate record ID in register
  try {
    console.log('\n2. Register duplicate record ID:');
    const formData = new FormData();
    formData.append('recordId', 'REC-DUP-TEST');
    const fileBlob = new Blob(['File content 1'], { type: 'text/plain' });
    formData.append('file', fileBlob, 'file.txt');

    // First registration
    await fetch(`${baseURL}/api/register`, { method: 'POST', body: formData });

    // Second registration (duplicate)
    const formData2 = new FormData();
    formData2.append('recordId', 'REC-DUP-TEST');
    formData2.append('file', fileBlob, 'file.txt');
    const dupRes = await fetch(`${baseURL}/api/register`, { method: 'POST', body: formData2 });
    const dupData = await dupRes.json();
    console.log('Status:', dupRes.status, 'Response:', dupData);
  } catch (e) {
    console.error(e);
  }

  // 3. Record not found in GET
  try {
    console.log('\n3. Get non-existent record ID:');
    const res = await fetch(`${baseURL}/api/record/NON-EXISTENT-ID-9999`);
    const data = await res.json();
    console.log('Status:', res.status, 'Response:', data);
  } catch (e) {
    console.error(e);
  }

  console.log('\n--- ERROR HANDLING TESTS COMPLETE ---');
}

runErrorTest();
