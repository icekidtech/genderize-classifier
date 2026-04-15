import http from 'http';

const BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/api/classify';

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let passedTests = 0;
let failedTests = 0;

type ColorKey = keyof typeof colors;

function log(message: string, color: ColorKey = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function assert(condition: boolean, message: string): void {
  if (condition) {
    log(`  ✓ ${message}`, 'green');
    passedTests++;
  } else {
    log(`  ✗ ${message}`, 'red');
    failedTests++;
  }
}

interface HttpResponse {
  statusCode: number;
  headers: { [key: string]: string | string[] | undefined };
  body: unknown;
}

function makeRequest(path: string, method: string = 'GET'): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk: Buffer) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 500,
          headers: res.headers,
          body: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', (error: Error) => {
      reject(error);
    });

    req.end();
  });
}

async function runTests(): Promise<void> {
  log('\n🧪 Genderize API Classifier Endpoint Test Suite\n', 'blue');

  try {
    // Test 1: Valid name with valid data
    log('Test 1: Valid name (John)', 'yellow');
    let res = await makeRequest(`${ENDPOINT}?name=john`);
    const data1 = res.body as any;
    assert(res.statusCode === 200, 'HTTP 200 status');
    assert(data1.status === 'success', 'Response status is "success"');
    assert(data1.data, 'Data object exists');
    assert(data1.data.name === 'john', 'Name field matches input');
    assert(data1.data.gender, 'Gender field exists');
    assert(typeof data1.data.probability === 'number', 'Probability is a number');
    assert(typeof data1.data.sample_size === 'number', 'Count renamed to sample_size');
    assert(typeof data1.data.is_confident === 'boolean', 'is_confident is boolean');
    assert(data1.data.processed_at, 'processed_at timestamp exists');
    assert(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(data1.data.processed_at),
      'processed_at is ISO 8601 format'
    );
    assert(res.headers['access-control-allow-origin'] === '*', 'CORS header present');

    // Test 2: Confidence scoring logic (high confidence case)
    log('\nTest 2: Confidence scoring - high confidence', 'yellow');
    res = await makeRequest(`${ENDPOINT}?name=michael`);
    if (res.statusCode === 200 && (res.body as any).status === 'success') {
      const { probability, sample_size, is_confident } = (res.body as any).data;
      const expectedConfident = probability >= 0.7 && sample_size >= 100;
      assert(
        is_confident === expectedConfident,
        `Confidence correct: prob=${probability}, size=${sample_size}, confident=${is_confident}`
      );
    }

    // Test 3: Missing name parameter (400)
    log('\nTest 3: Missing name parameter', 'yellow');
    res = await makeRequest(ENDPOINT);
    const data3 = res.body as any;
    assert(res.statusCode === 400, 'HTTP 400 status');
    assert(data3.status === 'error', 'Response status is "error"');
    assert(
      data3.message.includes('Missing') || data3.message.includes('empty'),
      'Error message mentions missing/empty'
    );

    // Test 4: Empty name parameter (400)
    log('\nTest 4: Empty name parameter', 'yellow');
    res = await makeRequest(`${ENDPOINT}?name=`);
    assert(res.statusCode === 400, 'HTTP 400 status');
    assert((res.body as any).status === 'error', 'Response status is "error"');

    // Test 5: Whitespace-only name (400)
    log('\nTest 5: Whitespace-only name', 'yellow');
    res = await makeRequest(`${ENDPOINT}?name=%20%20%20`);
    assert(res.statusCode === 400, 'HTTP 400 status (trimmed to empty)');

    // Test 6: Non-string name - numeric (422)
    log('\nTest 6: Non-string name (numeric)', 'yellow');
    res = await makeRequest(`${ENDPOINT}?name=123`);
    const data6 = res.body as any;
    assert(res.statusCode === 422, 'HTTP 422 status');
    assert(data6.status === 'error', 'Response status is "error"');
    assert(data6.message.includes('string'), 'Error message mentions string type');

    // Test 7: Valid name but low confidence (sample_size < 100)
    log('\nTest 7: Name with low confidence', 'yellow');
    res = await makeRequest(`${ENDPOINT}?name=alexzandria`);
    const data7 = res.body as any;
    assert(res.statusCode === 200, 'HTTP 200 status');
    if (data7.data && data7.data.sample_size < 100) {
      assert(data7.data.is_confident === false, 'is_confident is false when sample_size < 100');
    } else {
      // If prediction has high confidence, just verify structure
      assert(data7.status === 'success', 'Response status is success');
    }

    // Test 8: Whitespace trimming
    log('\nTest 8: Whitespace trimming', 'yellow');
    res = await makeRequest(`${ENDPOINT}?name=%20alice%20`);
    const data8 = res.body as any;
    assert(res.statusCode === 200, 'HTTP 200 status');
    assert(data8.data.name === 'alice', 'Name trimmed correctly');

    // Test 9: Timestamp is generated fresh
    log('\nTest 9: Fresh timestamp on each request', 'yellow');
    const res1 = await makeRequest(`${ENDPOINT}?name=sophia`);
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
    const res2 = await makeRequest(`${ENDPOINT}?name=sophia`);
    if (res1.statusCode === 200 && res2.statusCode === 200) {
      const data9_1 = res1.body as any;
      const data9_2 = res2.body as any;
      assert(
        data9_1.data.processed_at !== data9_2.data.processed_at,
        'Timestamps differ (not hardcoded)'
      );
    }

    // Test 10: Multiple concurrent requests
    log('\nTest 10: Multiple concurrent requests', 'yellow');
    const promises = [
      makeRequest(`${ENDPOINT}?name=john`),
      makeRequest(`${ENDPOINT}?name=mary`),
      makeRequest(`${ENDPOINT}?name=david`)
    ];
    const results = await Promise.all(promises);
    assert(results.every(r => r.statusCode === 200), 'All concurrent requests succeeded');

    // Test 11: Response structure validation
    log('\nTest 11: Response structure validation', 'yellow');
    res = await makeRequest(`${ENDPOINT}?name=emma`);
    const data11 = res.body as any;
    const hasRequiredFields =
      data11.data &&
      'name' in data11.data &&
      'gender' in data11.data &&
      'probability' in data11.data &&
      'sample_size' in data11.data &&
      'is_confident' in data11.data &&
      'processed_at' in data11.data;
    assert(hasRequiredFields, 'All required fields present in response');

    // Test 12: Verify count is renamed to sample_size (not both)
    log('\nTest 12: Count renamed to sample_size (not both)', 'yellow');
    res = await makeRequest(`${ENDPOINT}?name=james`);
    if (res.statusCode === 200 && (res.body as any).status === 'success') {
      const data12 = res.body as any;
      assert('sample_size' in data12.data, 'Has sample_size field');
      assert(!('count' in data12.data), 'Does not have count field (renamed)');
    }

    // Summary
    log('\n' + '='.repeat(50), 'blue');
    log(`✓ Passed: ${passedTests}`, 'green');
    log(`✗ Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
    log('='.repeat(50) + '\n', 'blue');

    if (failedTests > 0) {
      process.exit(1);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`\n❌ Connection Error: ${errorMessage}`, 'red');
    log('\nMake sure the server is running:', 'yellow');
    log('  npm start', 'yellow');
    process.exit(1);
  }
}

runTests();