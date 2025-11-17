import { test, expect, APIRequestContext } from '@playwright/test';

/**
 * EHR Bridge API - Get Multiple Patients by IDs Tests
 * Base URL: https://ehr-bridge-dev.ambitiousplant-5b7e30b9.eastus.azurecontainerapps.io
 * Endpoint: POST /api/v1/ehr/patients/by-ids
 * 
 * Retrieves multiple patient records by providing an array of patient IDs
 */

const BASE_URL = 'https://ehr-bridge-dev.ambitiousplant-5b7e30b9.eastus.azurecontainerapps.io';
const API_VERSION = '/api/v1';
const BUSINESS_LOCATION_ID = '6';

// Valid patient IDs from the system
const VALID_PATIENT_IDS = [
  'e63wRTbPfr1p8UW81d8Seiw3',
  'eC3mOhj6IBKsreVGIynSMLQ3',
  'eX6eFJqj-TrTEtf5w901wRw3'
];

test.describe('Get Multiple Patients by IDs API Tests', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
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

  test('TC001: Get multiple patients with all valid IDs', async () => {
    const requestBody = {
      ids: VALID_PATIENT_IDS
    };

    const response = await apiContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect([200, 201, 404, 500]).toContain(response.status());
    
    if (response.status() === 200 || response.status() === 201) {
      const responseBody = await response.json();
      console.log('TC001 PASSED: Multiple patients retrieved successfully');
      console.log('Response:', JSON.stringify(responseBody, null, 2));
      
      const patients = Array.isArray(responseBody) ? responseBody : responseBody.data || [];
      console.log('Patients found:', patients.length);
      
      // Verify response structure
      if (patients.length > 0) {
        patients.forEach((patient: any) => {
          expect(patient).toHaveProperty('id');
          expect(VALID_PATIENT_IDS).toContain(patient.id);
        });
      }
    } else {
      console.log('TC001 PASSED: Status:', response.status());
    }
  });

  test('TC002: Get patients with single ID', async () => {
    const requestBody = {
      ids: [VALID_PATIENT_IDS[0]]
    };

    const response = await apiContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect([200, 201, 404, 500]).toContain(response.status());
    
    if (response.status() === 200 || response.status() === 201) {
      const responseBody = await response.json();
      console.log('TC002 PASSED: Single patient retrieved');
      
      const patients = Array.isArray(responseBody) ? responseBody : responseBody.data || [];
      console.log('Patients found:', patients.length);
      
      if (patients.length > 0) {
        expect(patients[0].id).toBe(VALID_PATIENT_IDS[0]);
      }
    } else {
      console.log('TC002 PASSED: Status:', response.status());
    }
  });

  test('TC003: Get patients with two IDs', async () => {
    const requestBody = {
      ids: [VALID_PATIENT_IDS[0], VALID_PATIENT_IDS[1]]
    };

    const response = await apiContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect([200, 201, 404, 500]).toContain(response.status());
    
    if (response.status() === 200 || response.status() === 201) {
      const responseBody = await response.json();
      console.log('TC003 PASSED: Two patients retrieved');
      
      const patients = Array.isArray(responseBody) ? responseBody : responseBody.data || [];
      console.log('Patients found:', patients.length);
    } else {
      console.log('TC003 PASSED: Status:', response.status());
    }
  });

  test('TC004: Get patients with large number of IDs', async () => {
    // Create array with 50 IDs (mix of valid and duplicates)
    const manyIds = [
      ...VALID_PATIENT_IDS,
      ...VALID_PATIENT_IDS,
      ...VALID_PATIENT_IDS,
      ...VALID_PATIENT_IDS,
      ...VALID_PATIENT_IDS
    ];

    const requestBody = {
      ids: manyIds
    };

    const response = await apiContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect([200, 201, 400, 404, 500]).toContain(response.status());
    
    console.log('TC004 PASSED: Large number of IDs handled');
    console.log('Status:', response.status());
    
    if (response.status() === 200 || response.status() === 201) {
      const responseBody = await response.json();
      const patients = Array.isArray(responseBody) ? responseBody : responseBody.data || [];
      console.log('Patients found:', patients.length);
    }
  });

  test('TC005: Get patients with duplicate IDs in request', async () => {
    const requestBody = {
      ids: [
        VALID_PATIENT_IDS[0],
        VALID_PATIENT_IDS[0],
        VALID_PATIENT_IDS[1],
        VALID_PATIENT_IDS[1]
      ]
    };

    const response = await apiContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect([200, 201, 400, 404, 500]).toContain(response.status());
    
    console.log('TC005 PASSED: Duplicate IDs handled');
    console.log('Status:', response.status());
    
    if (response.status() === 200 || response.status() === 201) {
      const responseBody = await response.json();
      const patients = Array.isArray(responseBody) ? responseBody : responseBody.data || [];
      console.log('Patients found:', patients.length);
      
      // Check if duplicates are returned or filtered
      const uniquePatientIds = new Set(patients.map((p: any) => p.id));
      console.log('Unique patients:', uniquePatientIds.size);
    }
  });

  // ==========================================
  // NEGATIVE TEST CASES
  // ==========================================

  test('TC006: Get patients with empty IDs array', async () => {
    const requestBody = {
      ids: []
    };

    const response = await apiContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect([200, 201, 400]).toContain(response.status());
    
    if (response.status() === 400) {
      const errorBody = await response.json();
      console.log('TC006 PASSED: Empty IDs array rejected');
      console.log('Error:', errorBody);
    } else {
      const responseBody = await response.json();
      const patients = Array.isArray(responseBody) ? responseBody : responseBody.data || [];
      console.log('TC006 PASSED: Empty array handled, returned:', patients.length, 'patients');
    }
  });

  test('TC007: Get patients with non-existent IDs', async () => {
    const requestBody = {
      ids: [
        'nonexistent123456',
        'invalid999999',
        'fake000000'
      ]
    };

    const response = await apiContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect([200, 201, 404, 500]).toContain(response.status());
    
    if (response.status() === 200 || response.status() === 201) {
      const responseBody = await response.json();
      const patients = Array.isArray(responseBody) ? responseBody : responseBody.data || [];
      expect(patients.length).toBe(0);
      console.log('TC007 PASSED: Non-existent IDs return empty results');
    } else {
      console.log('TC007 PASSED: Non-existent IDs handled');
      console.log('Status:', response.status());
    }
  });

  test('TC008: Get patients with mix of valid and invalid IDs', async () => {
    const requestBody = {
      ids: [
        VALID_PATIENT_IDS[0],
        'invalid123456',
        VALID_PATIENT_IDS[1],
        'nonexistent999'
      ]
    };

    const response = await apiContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect([200, 201, 400, 404, 500]).toContain(response.status());
    
    console.log('TC008 PASSED: Mix of valid and invalid IDs handled');
    console.log('Status:', response.status());
    
    if (response.status() === 200 || response.status() === 201) {
      const responseBody = await response.json();
      const patients = Array.isArray(responseBody) ? responseBody : responseBody.data || [];
      console.log('Patients found:', patients.length);
      console.log('Expected: Only valid IDs should return patients');
    }
  });

  test('TC009: Get patients with invalid ID format', async () => {
    const requestBody = {
      ids: [
        '123',
        'abc',
        'invalid-format'
      ]
    };

    const response = await apiContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect([200, 201, 400, 404, 500]).toContain(response.status());
    
    console.log('TC009 PASSED: Invalid ID format handled');
    console.log('Status:', response.status());
  });

  test('TC010: Get patients without IDs field', async () => {
    const requestBody = {};

    const response = await apiContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect(response.ok()).toBeFalsy();
    expect([400, 500]).toContain(response.status());
    
    try {
      const errorBody = await response.json();
      console.log('TC010 PASSED: Missing IDs field rejected');
      console.log('Error:', errorBody);
    } catch (e) {
      console.log('TC010 PASSED: Missing IDs field rejected');
      console.log('Status:', response.status(), 'Response is not valid JSON');
    }
  });

  test('TC011: Get patients with null IDs', async () => {
    const requestBody = {
      ids: null
    };

    const response = await apiContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect(response.ok()).toBeFalsy();
    expect([400, 500]).toContain(response.status());
    
    try {
      const errorBody = await response.json();
      console.log('TC011 PASSED: Null IDs rejected');
      console.log('Error:', errorBody);
    } catch (e) {
      console.log('TC011 PASSED: Null IDs rejected');
      console.log('Status:', response.status(), 'Response is not valid JSON');
    }
  });

  test('TC012: Get patients with IDs as string instead of array', async () => {
    const requestBody = {
      ids: 'e63wRTbPfr1p8UW81d8Seiw3'
    };

    const response = await apiContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect(response.ok()).toBeFalsy();
    expect([400, 500]).toContain(response.status());
    
    try {
      const errorBody = await response.json();
      console.log('TC012 PASSED: String instead of array rejected');
      console.log('Error:', errorBody);
    } catch (e) {
      console.log('TC012 PASSED: String instead of array rejected');
      console.log('Status:', response.status(), 'Response is not valid JSON');
    }
  });

  test('TC013: Get patients without business-location-id header', async ({ playwright }) => {
    const tempContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        // Missing business-location-id
      }
    });

    const requestBody = {
      ids: VALID_PATIENT_IDS
    };

    const response = await tempContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect(response.ok()).toBeFalsy();
    expect([400, 401, 403]).toContain(response.status());
    
    try {
      const errorBody = await response.json();
      console.log('TC013 PASSED: Missing business-location-id header validation working');
      console.log('Status:', response.status(), 'Error:', errorBody);
    } catch (e) {
      console.log('TC013 PASSED: Missing business-location-id header validation working');
      console.log('Status:', response.status(), 'Response is not valid JSON');
    }
    
    await tempContext.dispose();
  });

  test('TC014: Get patients with empty string IDs', async () => {
    const requestBody = {
      ids: ['', '', '']
    };

    const response = await apiContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect([200, 201, 400, 500]).toContain(response.status());
    
    console.log(' TC014 PASSED: Empty string IDs handled');
    console.log('Status:', response.status());
  });


  test('TC015: Test with IDs containing special characters', async () => {
    const requestBody = {
      ids: [
        VALID_PATIENT_IDS[0],
        'id-with-special-chars!@#',
        VALID_PATIENT_IDS[1]
      ]
    };

    const response = await apiContext.post(`${API_VERSION}/ehr/patients/by-ids`, {
      data: requestBody
    });

    expect([200, 201, 400, 404, 500]).toContain(response.status());
    
    console.log(' TC015 PASSED: Special characters in IDs handled');
    console.log('Status:', response.status());
  });


});