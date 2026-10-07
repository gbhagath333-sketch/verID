const fs = require('fs');
const path = require('path');
const http = require('http');

// Simple integration test using native Node modules or fetch
async function runIntegrationTest() {
  const baseURL = 'http://localhost:5000';
  
  console.log('--- STARTING VERID BACKEND INTEGRATION TEST ---');

  // 1. Test GET /api/health
  try {
    console.log('\n1. Testing GET /api/health ...');
    const res = await fetch(`${baseURL}/api/health`);
    const health = await res.json();
    console.log('Health Response:', JSON.stringify(health, null, 2));
  } catch (err) {
    console.error('Health test failed:', err.message);
  }

  // Create temporary test file
  const testFilePath = path.join(__dirname, 'test-doc.txt');
  fs.writeFileSync(testFilePath, 'VerID Tamper Proof Verification Document Content 2026!');

  const recordId = `TEST-REC-${Date.now()}`;

  // 2. Test POST /api/register
  try {
    console.log(`\n2. Testing POST /api/register with recordId: ${recordId} ...`);
    const formData = new FormData();
    formData.append('recordId', recordId);
    const fileBlob = new Blob([fs.readFileSync(testFilePath)], { type: 'text/plain' });
    formData.append('file', fileBlob, 'test-doc.txt');

    const regRes = await fetch(`${baseURL}/api/register`, {
      method: 'POST',
      body: formData
    });
    const regData = await regRes.json();
    console.log('Register Response:', JSON.stringify(regData, null, 2));

    if (!regData.success) {
      console.error('Registration failed!');
    }
  } catch (err) {
    console.error('Register test error:', err.message);
  }

  // 3. Test POST /api/verify (Authentic)
  try {
    console.log(`\n3. Testing POST /api/verify with SAME file ...`);
    const formData = new FormData();
    formData.append('recordId', recordId);
    const fileBlob = new Blob([fs.readFileSync(testFilePath)], { type: 'text/plain' });
    formData.append('file', fileBlob, 'test-doc.txt');

    const verRes = await fetch(`${baseURL}/api/verify`, {
      method: 'POST',
      body: formData
    });
    const verData = await verRes.json();
    console.log('Verify Response (Should be authentic: true):', JSON.stringify(verData, null, 2));
  } catch (err) {
    console.error('Verify test error:', err.message);
  }

  // 4. Test POST /api/verify (Tampered file)
  try {
    console.log(`\n4. Testing POST /api/verify with TAMPERED file ...`);
    const formData = new FormData();
    formData.append('recordId', recordId);
    const tamperedBlob = new Blob(['TAMPERED CONTENT!'], { type: 'text/plain' });
    formData.append('file', tamperedBlob, 'test-doc.txt');

    const verRes = await fetch(`${baseURL}/api/verify`, {
      method: 'POST',
      body: formData
    });
    const verData = await verRes.json();
    console.log('Verify Response (Should be authentic: false):', JSON.stringify(verData, null, 2));
  } catch (err) {
    console.error('Tampered verify test error:', err.message);
  }

  // 5. Test GET /api/record/:recordId
  try {
    console.log(`\n5. Testing GET /api/record/${recordId} ...`);
    const recRes = await fetch(`${baseURL}/api/record/${recordId}`);
    const recData = await recRes.json();
    console.log('Get Record Response:', JSON.stringify(recData, null, 2));
  } catch (err) {
    console.error('Get Record test error:', err.message);
  }

  // Clean up
  if (fs.existsSync(testFilePath)) {
    fs.unlinkSync(testFilePath);
  }

  console.log('\n--- INTEGRATION TEST COMPLETE ---');
}

runIntegrationTest();

