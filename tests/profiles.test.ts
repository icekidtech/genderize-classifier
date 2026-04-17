import http from 'http';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(
  method: string,
  path: string,
  body?: any
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsedData = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode || 500, data: parsedData });
        } catch (e) {
          resolve({ status: res.statusCode || 500, data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  log('='.repeat(60), 'blue');
  log('STAGE 1: PROFILES API TEST SUITE', 'blue');
  log('='.repeat(60), 'blue');

  let passed = 0;
  let failed = 0;

  try {
    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 1: Create a profile
    log('\n[TEST 1] POST /api/profiles - Create new profile', 'yellow');
    try {
      const response = await makeRequest('POST', '/api/profiles', { name: 'ella' });
      if (response.status === 201 && response.data.status === 'success') {
        log('✓ Profile created successfully', 'green');
        log(`  ID: ${response.data.data.id}`, 'green');
        log(`  Status: ${response.status}`, 'green');
        passed++;
      } else {
        log(`✗ Expected 201, got ${response.status}`, 'red');
        log(`  Response: ${JSON.stringify(response.data)}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`✗ Test failed: ${error}`, 'red');
      failed++;
    }

    // Test 2: Test idempotency (create same profile again)
    log('\n[TEST 2] POST /api/profiles - Idempotency (duplicate name)', 'yellow');
    try {
      const response = await makeRequest('POST', '/api/profiles', { name: 'ella' });
      if (
        response.status === 200 &&
        response.data.status === 'success' &&
        response.data.message === 'Profile already exists'
      ) {
        log('✓ Idempotency working - returned existing profile', 'green');
        log(`  Status: ${response.status}`, 'green');
        log(`  Message: ${response.data.message}`, 'green');
        passed++;
      } else {
        log(`✗ Expected 200 with existing profile message`, 'red');
        log(`  Got status: ${response.status}`, 'red');
        log(`  Response: ${JSON.stringify(response.data)}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`✗ Test failed: ${error}`, 'red');
      failed++;
    }

    // Test 3: Missing name parameter
    log('\n[TEST 3] POST /api/profiles - Missing name (error handling)', 'yellow');
    try {
      const response = await makeRequest('POST', '/api/profiles', {});
      if (response.status === 400 && response.data.status === 'error') {
        log('✓ Correctly rejected request with missing name', 'green');
        log(`  Status: ${response.status}`, 'green');
        log(`  Message: ${response.data.message}`, 'green');
        passed++;
      } else {
        log(`✗ Expected 400, got ${response.status}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`✗ Test failed: ${error}`, 'red');
      failed++;
    }

    // Test 4: Invalid name type
    log('\n[TEST 4] POST /api/profiles - Invalid type (error handling)', 'yellow');
    try {
      const response = await makeRequest('POST', '/api/profiles', { name: 123 });
      if (response.status === 422 && response.data.status === 'error') {
        log('✓ Correctly rejected request with invalid type', 'green');
        log(`  Status: ${response.status}`, 'green');
        log(`  Message: ${response.data.message}`, 'green');
        passed++;
      } else {
        log(`✗ Expected 422, got ${response.status}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`✗ Test failed: ${error}`, 'red');
      failed++;
    }

    // Test 5: Create another profile (for testing GET)
    log('\n[TEST 5] POST /api/profiles - Create another profile (for GET tests)', 'yellow');
    let secondProfileId = '';
    try {
      const response = await makeRequest('POST', '/api/profiles', { name: 'john' });
      if (response.status === 201 && response.data.status === 'success') {
        secondProfileId = response.data.data.id;
        log('✓ Second profile created successfully', 'green');
        log(`  ID: ${secondProfileId}`, 'green');
        passed++;
      } else {
        log(`✗ Failed to create second profile`, 'red');
        failed++;
      }
    } catch (error) {
      log(`✗ Test failed: ${error}`, 'red');
      failed++;
    }

    // Test 6: Create third profile for filtering tests
    log('\n[TEST 6] POST /api/profiles - Create third profile (for filtering)', 'yellow');
    let thirdProfileId = '';
    try {
      const response = await makeRequest('POST', '/api/profiles', { name: 'emma' });
      if (response.status === 201 && response.data.status === 'success') {
        thirdProfileId = response.data.data.id;
        log('✓ Third profile created successfully', 'green');
        log(`  ID: ${thirdProfileId}`, 'green');
        passed++;
      } else {
        log(`✗ Failed to create third profile`, 'red');
        failed++;
      }
    } catch (error) {
      log(`✗ Test failed: ${error}`, 'red');
      failed++;
    }

    // Test 7: GET profile by ID
    if (secondProfileId) {
      log('\n[TEST 7] GET /api/profiles/:id - Retrieve profile by ID', 'yellow');
      try {
        const response = await makeRequest('GET', `/api/profiles/${secondProfileId}`, undefined);
        if (
          response.status === 200 &&
          response.data.status === 'success' &&
          response.data.data.id === secondProfileId
        ) {
          log('✓ Profile retrieved successfully', 'green');
          log(`  Name: ${response.data.data.name}`, 'green');
          log(`  Gender: ${response.data.data.gender}`, 'green');
          log(`  Age: ${response.data.data.age}`, 'green');
          log(`  Country: ${response.data.data.country_id}`, 'green');
          passed++;
        } else {
          log(`✗ Expected 200, got ${response.status}`, 'red');
          failed++;
        }
      } catch (error) {
        log(`✗ Test failed: ${error}`, 'red');
        failed++;
      }
    }

    // Test 8: GET non-existent profile
    log('\n[TEST 8] GET /api/profiles/:id - Profile not found', 'yellow');
    try {
      const fakeId = '00000000-0000-7000-8000-000000000000';
      const response = await makeRequest('GET', `/api/profiles/${fakeId}`, undefined);
      if (response.status === 404 && response.data.status === 'error') {
        log('✓ Correctly returned 404 for non-existent profile', 'green');
        log(`  Status: ${response.status}`, 'green');
        log(`  Message: ${response.data.message}`, 'green');
        passed++;
      } else {
        log(`✗ Expected 404, got ${response.status}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`✗ Test failed: ${error}`, 'red');
      failed++;
    }

    // Test 9: GET all profiles (list)
    log('\n[TEST 9] GET /api/profiles - List all profiles', 'yellow');
    try {
      const response = await makeRequest('GET', '/api/profiles', undefined);
      if (
        response.status === 200 &&
        response.data.status === 'success' &&
        Array.isArray(response.data.data) &&
        response.data.count >= 3
      ) {
        log('✓ Profiles listed successfully', 'green');
        log(`  Total profiles: ${response.data.count}`, 'green');
        log(`  Returned: ${response.data.data.length}`, 'green');
        passed++;
      } else {
        log(`✗ Expected 200 with profiles array`, 'red');
        log(`  Status: ${response.status}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`✗ Test failed: ${error}`, 'red');
      failed++;
    }

    // Test 10: Filter profiles by gender
    log('\n[TEST 10] GET /api/profiles - Filter by gender', 'yellow');
    try {
      const response = await makeRequest('GET', '/api/profiles?gender=male', undefined);
      if (
        response.status === 200 &&
        response.data.status === 'success' &&
        Array.isArray(response.data.data)
      ) {
        const allMale = response.data.data.every((p: any) => p.gender === 'male' || p.gender === null);
        if (allMale || response.data.data.length === 0) {
          log('✓ Gender filter applied correctly', 'green');
          log(`  Results: ${response.data.count}`, 'green');
          passed++;
        } else {
          log(`✗ Filter returned mixed genders`, 'red');
          failed++;
        }
      } else {
        log(`✗ Expected 200, got ${response.status}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`✗ Test failed: ${error}`, 'red');
      failed++;
    }

    // Test 11: Case-insensitive filtering
    log('\n[TEST 11] GET /api/profiles - Case-insensitive filtering', 'yellow');
    try {
      const response = await makeRequest('GET', '/api/profiles?gender=MALE&age_group=ADULT', undefined);
      if (response.status === 200 && response.data.status === 'success') {
        log('✓ Case-insensitive filtering works', 'green');
        log(`  Results: ${response.data.count}`, 'green');
        passed++;
      } else {
        log(`✗ Expected 200, got ${response.status}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`✗ Test failed: ${error}`, 'red');
      failed++;
    }

    // Test 12: DELETE profile
    if (thirdProfileId) {
      log('\n[TEST 12] DELETE /api/profiles/:id - Delete profile', 'yellow');
      try {
        const response = await makeRequest('DELETE', `/api/profiles/${thirdProfileId}`, undefined);
        if (response.status === 204) {
          log('✓ Profile deleted successfully (204 No Content)', 'green');
          log(`  Status: ${response.status}`, 'green');
          passed++;
        } else {
          log(`✗ Expected 204, got ${response.status}`, 'red');
          failed++;
        }
      } catch (error) {
        log(`✗ Test failed: ${error}`, 'red');
        failed++;
      }
    }

    // Test 13: DELETE non-existent profile
    log('\n[TEST 13] DELETE /api/profiles/:id - Delete non-existent profile', 'yellow');
    try {
      const fakeId = '00000000-0000-7000-8000-000000000000';
      const response = await makeRequest('DELETE', `/api/profiles/${fakeId}`, undefined);
      if (response.status === 404 && response.data.status === 'error') {
        log('✓ Correctly returned 404 for non-existent profile', 'green');
        log(`  Status: ${response.status}`, 'green');
        passed++;
      } else {
        log(`✗ Expected 404, got ${response.status}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`✗ Test failed: ${error}`, 'red');
      failed++;
    }

    // Test 14: Empty name
    log('\n[TEST 14] POST /api/profiles - Empty name (error handling)', 'yellow');
    try {
      const response = await makeRequest('POST', '/api/profiles', { name: '' });
      if (response.status === 400 && response.data.status === 'error') {
        log('✓ Correctly rejected request with empty name', 'green');
        log(`  Status: ${response.status}`, 'green');
        passed++;
      } else {
        log(`✗ Expected 400, got ${response.status}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`✗ Test failed: ${error}`, 'red');
      failed++;
    }

    // Test 15: Whitespace-only name
    log('\n[TEST 15] POST /api/profiles - Whitespace-only name', 'yellow');
    try {
      const response = await makeRequest('POST', '/api/profiles', { name: '   ' });
      if (response.status === 400 && response.data.status === 'error') {
        log('✓ Correctly rejected whitespace-only name', 'green');
        log(`  Status: ${response.status}`, 'green');
        passed++;
      } else {
        log(`✗ Expected 400, got ${response.status}`, 'red');
        failed++;
      }
    } catch (error) {
      log(`✗ Test failed: ${error}`, 'red');
      failed++;
    }

    // Print summary
    log('\n' + '='.repeat(60), 'blue');
    log('TEST SUMMARY', 'blue');
    log('='.repeat(60), 'blue');
    log(`Total Tests: ${passed + failed}`, 'blue');
    log(`Passed: ${passed}`, 'green');
    log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    log('='.repeat(60), 'blue');

    if (failed === 0) {
      log('\n✓ ALL TESTS PASSED!', 'green');
      process.exit(0);
    } else {
      log(`\n✗ ${failed} TEST(S) FAILED`, 'red');
      process.exit(1);
    }
  } catch (error) {
    log(`Fatal error: ${error}`, 'red');
    process.exit(1);
  }
}

// Run tests
runTests();