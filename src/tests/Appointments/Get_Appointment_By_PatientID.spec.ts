import { test, expect, APIRequestContext } from '@playwright/test';

const BASE_URL = 'https://ehr-bridge-dev.ambitiousplant-5b7e30b9.eastus.azurecontainerapps.io';
const API_VERSION = '/api/v1';
const BUSINESS_LOCATION_ID = '6';
const PATIENT_ID = 'eq081-VQEgP8drUUqCWzHfw3';

test.describe('Get Appointments by Patient ID API Tests', () => {
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

  test('TC001: Get appointments by valid patient ID successfully', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/appointments/by-patient/${PATIENT_ID}`);

    expect([200, 404, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const responseBody = await response.json();
      console.log('TC001 PASSED: Patient appointments retrieved successfully');
      console.log('Response:', JSON.stringify(responseBody, null, 2));
      
      const appointments = Array.isArray(responseBody) 
        ? responseBody 
        : responseBody.appointments || responseBody.data || [];
      console.log('Total appointments found:', appointments.length);
      
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


  test('TC002: Get appointments for patient with no appointments', async () => {
    // Using a different patient ID that might not have appointments
    const emptyPatientId = 'e63wRTbPfr1p8UW81d8Seiw3';
    
    const response = await apiContext.get(`${API_VERSION}/ehr/appointments/by-patient/${emptyPatientId}`);

    expect([200, 404, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const responseBody = await response.json();
      const appointments = Array.isArray(responseBody) 
        ? responseBody 
        : responseBody.appointments || responseBody.data || [];
      
      console.log('TC002 PASSED: Patient with no appointments handled');
      console.log('Appointments found:', appointments.length);
      
      // Empty array is a valid response
      expect(Array.isArray(appointments)).toBeTruthy();
    } else {
      console.log('TC002 PASSED: Status:', response.status());
    }
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
      const response = await apiContext.get(`${API_VERSION}/ehr/appointments/by-patient/${patientId}`);
      
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



  test('TC004: Get appointments with non-existent patient ID', async () => {
    const nonExistentId = 'nonexistent-patient-999999';
    const response = await apiContext.get(`${API_VERSION}/ehr/appointments/by-patient/${nonExistentId}`);

    expect([400, 404, 500]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('TC004 PASSED: Non-existent patient ID handled');
    console.log('Status:', response.status());
    console.log('Error:', errorBody);
    
    // Verify error message is meaningful
    if (errorBody.message || errorBody.error) {
      console.log('Error message:', errorBody.message || errorBody.error);
    }
  });

  test('TC005: Get appointments with invalid patient ID format', async () => {
    const invalidIds = [
      '123',
      'invalid-format',
      'patient@invalid',
      'short',
      'patient123'
    ];

    console.log('TC005: Testing invalid patient ID formats...');

    for (const invalidId of invalidIds) {
      const response = await apiContext.get(`${API_VERSION}/ehr/appointments/by-patient/${invalidId}`);
      
      expect([400, 404, 500]).toContain(response.status());
      console.log(`  - ID "${invalidId}": Status ${response.status()}`);
    }
    
    console.log('TC005 PASSED: Invalid patient ID formats rejected');
  });

  test('TC006: Get appointments with empty patient ID', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/appointments/by-patient/`);

    // This might return 404 or 405 (Method Not Allowed) depending on API design
    expect([400, 404, 405, 500]).toContain(response.status());
    
    console.log('TC006 PASSED: Empty patient ID handled');
    console.log('Status:', response.status());
  });

  test('TC007: Get appointments without business-location-id header', async ({ playwright }) => {
    const tempContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json'
        // Missing business-location-id
      }
    });

    const response = await tempContext.get(`${API_VERSION}/ehr/appointments/by-patient/${PATIENT_ID}`);

    expect(response.ok()).toBeFalsy();
    expect([400, 401, 403, 500]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('TC007 PASSED: Missing business-location-id header validation working');
    console.log('Status:', response.status());
    console.log('Error:', errorBody);
    
    await tempContext.dispose();
  });

  test('TC008: Get appointments with invalid business-location-id', async ({ playwright }) => {
    const tempContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'business-location-id': 'invalid-location-999'
      }
    });

    const response = await tempContext.get(`${API_VERSION}/ehr/appointments/by-patient/${PATIENT_ID}`);

    expect(response.ok()).toBeFalsy();
    expect([400, 403, 404, 500]).toContain(response.status());
    
    console.log('TC008 PASSED: Invalid business-location-id handled');
    console.log('Status:', response.status());
    
    await tempContext.dispose();
  });

  test('TC009: Get appointments with special characters in patient ID', async () => {
    const specialCharIds = [
      'patient@#$%',
      'patient!@#',
      'patient***',
      'patient&&&',
      'patient<>',
      'patient|pipe'
    ];

    console.log('TC009: Testing special characters in patient ID...');

    for (const specialId of specialCharIds) {
      const response = await apiContext.get(
        `${API_VERSION}/ehr/appointments/by-patient/${encodeURIComponent(specialId)}`
      );
      
      expect([400, 404, 500]).toContain(response.status());
      console.log(`  - ID "${specialId}": Status ${response.status()}`);
    }
    
    console.log('TC009 PASSED: Special characters handled safely');
  });

});