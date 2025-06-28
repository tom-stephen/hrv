const fs = require('fs');
const FormData = require('form-data');

async function testUpload() {
  try {
    const fetch = (await import('node-fetch')).default;
    const form = new FormData();
    form.append('hrvFile', fs.createReadStream('../../1711030771.gzip'));
    form.append('userEmail', 'athlete@test.com');

    const response = await fetch('http://localhost:5002/api/hrv/upload', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('HRV Record:', result.hrvRecord);
      console.log('User:', result.user);
    } else {
      console.log('❌ Upload failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUpload(); 