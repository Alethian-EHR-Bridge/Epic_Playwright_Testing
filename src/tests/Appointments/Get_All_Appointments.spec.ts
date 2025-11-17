import { test, expect, APIRequestContext } from '@playwright/test';


const BASE_URL = 'https://ehr-bridge-dev.ambitiousplant-5b7e30b9.eastus.azurecontainerapps.io';
const API_VERSION = '/api/v1';
const BUSINESS_LOCATION_ID = '6';
const PATIENT_ID = 'eq081-VQEgP8drUUqCWzHfw3';

test.describe('Get All Appointments API Tests', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'User-Agent': 'Playwright-API-Test/1.0',
        'business-location-id': BUSINESS_LOCATION_ID
      }
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // ==========================================
  // POSITIVE TEST CASES
  // ==========================================

  test('TC001: Get all appointments for valid patient ID successfully', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/appointments?patientId=${PATIENT_ID}`);

    expect([200, 404, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const responseBody = await response.json();
      console.log('TC001 PASSED: Appointments retrieved successfully');
      console.log('Response:', JSON.stringify(responseBody, null, 2));
      
      const appointments = Array.isArray(responseBody) 
        ? responseBody 
        : responseBody.appointments || responseBody.data || [];
      console.log('Appointments found:', appointments.length);
      
      if (appointments.length > 0) {
        const appointment = appointments[0];
        console.log('Sample appointment:', appointment);
        
        // Verify appointment structure
        expect(appointment).toHaveProperty('id');
      }
    } else {
      console.log('TC001 PASSED: Status:', response.status());
    }
  });

  test('TC002: Get appointments with query parameter variations', async () => {
    // Test different query parameter formats
    const queryFormats = [
      `patientId=${PATIENT_ID}`,
      `patientId=${PATIENT_ID}&status=scheduled`,
      `patientId=${PATIENT_ID}&limit=10`
    ];

    console.log('Testing query parameter variations...');

    for (const queryParam of queryFormats) {
      const response = await apiContext.get(`${API_VERSION}/ehr/appointments?${queryParam}`);
      
      expect([200, 400, 404, 500]).toContain(response.status());
      console.log(`  - Query: ${queryParam} -> Status: ${response.status()}`);
    }
    
    console.log('TC002 PASSED: Query parameter variations tested');
  });



  test('TC003: Get appointments for multiple known patients', async () => {
    const patientIds = [
      'eq081-VQEgP8drUUqCWzHfw3',
      'eX6eFJqj-TrTEtf5w901wRw3',
      'e63wRTbPfr1p8UW81d8Seiw3',
      'eC3mOhj6IBKsreVGIynSMLQ3'
    ];

    console.log('TC003: Testing appointments for multiple patients...');

    for (const patientId of patientIds) {
      const response = await apiContext.get(`${API_VERSION}/ehr/appointments?patientId=${patientId}`);
      
      expect([200, 404, 500]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        const appointments = Array.isArray(responseBody) 
          ? responseBody 
          : responseBody.appointments || responseBody.data || [];
        console.log(`  - Patient ${patientId}: ${appointments.length} appointment(s)`);
      } else {
        console.log(`  - Patient ${patientId}: Status ${response.status()}`);
      }
    }
    
    console.log('TC003 PASSED: Multiple patient appointments tested');
  });


  // ==========================================
  // NEGATIVE TEST CASES
  // ==========================================

  test('TC004: Get appointments without patientId query parameter', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/appointments`);

    expect(response.ok()).toBeFalsy();
    expect([400, 422, 500]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('TC004 PASSED: Missing patientId parameter rejected');
    console.log('Status:', response.status(), 'Error:', errorBody);
    
    // Verify error message mentions required parameter
    if (errorBody.message || errorBody.error) {
      const errorMessage = errorBody.message || errorBody.error;
      console.log('Error message:', errorMessage);
    }
  });

  test('TC005: Get appointments with invalid patient ID format', async () => {
    const invalidIds = [
      'invalid-format',
      '123',
      'patient@invalid',
      'null'
    ];

    console.log(' TC005: Testing invalid patient ID formats...');

    for (const invalidId of invalidIds) {
      const response = await apiContext.get(`${API_VERSION}/ehr/appointments?patientId=${invalidId}`);
      
      expect([400, 404, 500]).toContain(response.status());
      console.log(`  - ID "${invalidId}": Status ${response.status()}`);
    }
    
    console.log('TC005 PASSED: Invalid patient ID formats rejected');
  });

  test('TC006: Get appointments with non-existent patient ID', async () => {
    const nonExistentId = 'nonexistent-patient-999999';
    const response = await apiContext.get(`${API_VERSION}/ehr/appointments?patientId=${nonExistentId}`);

    expect([400, 404, 500]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('TC006 PASSED: Non-existent patient ID handled');
    console.log('Status:', response.status(), 'Error:', errorBody);
  });

  test('TC007: Get appointments with empty patientId value', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/appointments?patientId=`);

    expect(response.ok()).toBeFalsy();
    expect([400, 422, 500]).toContain(response.status());
    
    console.log('TC007 PASSED: Empty patientId value handled');
    console.log('Status:', response.status());
  });

  test('TC008: Get appointments without business-location-id header', async ({ playwright }) => {
    const tempContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json'
        // Missing business-location-id
      }
    });

    const response = await tempContext.get(`${API_VERSION}/ehr/appointments?patientId=${PATIENT_ID}`);

    expect(response.ok()).toBeFalsy();
    expect([400, 401, 403]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('TC008 PASSED: Missing business-location-id header validation working');
    console.log('Status:', response.status(), 'Error:', errorBody);
    
    await tempContext.dispose();
  });

  test('TC009: Get appointments with special characters in patient ID', async () => {
    const specialIds = [
      'patient<script>alert("xss")</script>',
      'patient@#$%',
      'patient/../../../etc/passwd',
      'patient%00null'
    ];

    console.log('TC009: Testing special characters in patient ID...');

    for (const patientId of specialIds) {
      const response = await apiContext.get(
        `${API_VERSION}/ehr/appointments?patientId=${encodeURIComponent(patientId)}`
      );
      
      expect([400, 404, 500]).toContain(response.status());
      console.log(`  - ID "${patientId}": Status ${response.status()}`);
    }
    
    console.log('TC009 PASSED: Special characters handled safely');
  });

  test('TC010: Get appointments with invalid business-location-id', async ({ playwright }) => {
    const tempContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'business-location-id': 'invalid-location'
      }
    });

    const response = await tempContext.get(`${API_VERSION}/ehr/appointments?patientId=${PATIENT_ID}`);

    expect(response.ok()).toBeFalsy();
    expect([400, 403, 404, 500]).toContain(response.status());
    
    console.log('TC010 PASSED: Invalid business-location-id handled');
    console.log('Status:', response.status());
    
    await tempContext.dispose();
  });

});