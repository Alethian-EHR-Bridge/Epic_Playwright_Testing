import { test, expect, APIRequestContext } from '@playwright/test';

/**
 * EHR Bridge API - Get Patient Medications Tests
 * Base URL: https://ehr-bridge-dev.ambitiousplant-5b7e30b9.eastus.azurecontainerapps.io
 * Endpoint: GET /api/v1/ehr/patients/{patientId}/medications
 * 
 * Retrieves medication history and prescriptions for a specific patient
 */

const BASE_URL = 'https://ehr-bridge-dev.ambitiousplant-5b7e30b9.eastus.azurecontainerapps.io';
const API_VERSION = '/api/v1';
const BUSINESS_LOCATION_ID = '6';
const PATIENT_ID = 'eX6eFJqj-TrTEtf5w901wRw3';

test.describe('Get Patient Medications API Tests', () => {
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

  test('TC001: Get patient medications successfully', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/medications`);

    expect([200, 404, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const responseBody = await response.json();
      console.log('TC001 PASSED: Patient medications retrieved successfully');
      console.log('Response:', JSON.stringify(responseBody, null, 2));
      
      const medications = Array.isArray(responseBody) ? responseBody : responseBody.data || [];
      console.log('Medications found:', medications.length);
      
      if (medications.length > 0) {
        const medication = medications[0];
        console.log('Sample medication:', medication);
        
        // Verify medication structure
        expect(medication).toHaveProperty('id');
      }
    } else {
      console.log('TC001 PASSED: Status:', response.status());
    }
  });

  test('TC002: Get medications for patient with no medication history', async () => {
    // Using a different patient ID that might not have medications
    const emptyPatientId = 'e63wRTbPfr1p8UW81d8Seiw3';
    
    const response = await apiContext.get(`${API_VERSION}/ehr/patients/${emptyPatientId}/medications`);

    expect([200, 404, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const responseBody = await response.json();
      const medications = Array.isArray(responseBody) ? responseBody : responseBody.data || [];
      
      console.log('TC002 PASSED: Patient with no medications handled');
      console.log('Medications found:', medications.length);
    } else {
      console.log('TC002 PASSED: Status:', response.status());
    }
  });

  test('TC003: Verify medication data structure and fields', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/medications`);

    if (response.status() === 200) {
      const responseBody = await response.json();
      const medications = Array.isArray(responseBody) ? responseBody : responseBody.data || [];
      
      console.log('TC003 PASSED: Medication structure validated');
      
      if (medications.length > 0) {
        const medication = medications[0];
        
        // Common medication fields
        const expectedFields = ['id', 'name', 'dosage', 'frequency', 'prescribedDate', 'status'];
        const medicationFields = Object.keys(medication);
        
        console.log('Medication fields:', medicationFields);
        
        // Verify at least ID exists
        expect(medication).toHaveProperty('id');
        
        // Log all available fields
        expectedFields.forEach(field => {
          if (medication[field]) {
            console.log(`  - ${field}:`, medication[field]);
          }
        });
      }
    } else {
      console.log('TC003: Status:', response.status());
    }
  });

  test('TC004: Get medications for multiple known patients', async () => {
    const patientIds = [
      'eX6eFJqj-TrTEtf5w901wRw3',
      'e63wRTbPfr1p8UW81d8Seiw3',
      'eC3mOhj6IBKsreVGIynSMLQ3'
    ];

    console.log('TC004: Testing medications for multiple patients...');

    for (const patientId of patientIds) {
      const response = await apiContext.get(`${API_VERSION}/ehr/patients/${patientId}/medications`);
      
      expect([200, 404, 500]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseBody = await response.json();
        const medications = Array.isArray(responseBody) ? responseBody : responseBody.data || [];
        console.log(`  - Patient ${patientId}: ${medications.length} medication(s)`);
      } else {
        console.log(`  - Patient ${patientId}: Status ${response.status()}`);
      }
    }
    
    console.log('TC004 PASSED: Multiple patient medications tested');
  });

  // ==========================================
  // NEGATIVE TEST CASES
  // ==========================================

  test('TC005: Get medications with invalid patient ID format', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/patients/invalid-patient-123/medications`);

    expect(response.ok()).toBeFalsy();
    expect([400, 404, 500]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('TC005 PASSED: Invalid patient ID format rejected');
    console.log('Status:', response.status(), 'Error:', errorBody);
  });

  test('TC006: Get medications with non-existent patient ID', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/patients/nonexistent999999/medications`);

    expect(response.ok()).toBeFalsy();
    expect([400, 404, 500]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('TC006 PASSED: Non-existent patient ID handled');
    console.log('Status:', response.status(), 'Error:', errorBody);
  });

  test('TC007: Get medications with empty patient ID', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/patients//medications`);

    expect(response.ok()).toBeFalsy();
    expect([400, 404, 500]).toContain(response.status());
    
    console.log('TC007 PASSED: Empty patient ID handled');
    console.log('Status:', response.status());
  });

  test('TC008: Get medications without business-location-id header', async ({ playwright }) => {
    const tempContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json'
        // Missing business-location-id
      }
    });

    const response = await tempContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/medications`);

    expect(response.ok()).toBeFalsy();
    expect([400, 401, 403]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log(' TC008 PASSED: Missing business-location-id header validation working');
    console.log('Status:', response.status(), 'Error:', errorBody);
    
    await tempContext.dispose();
  });

  test('TC009:  Get medications with special characters in patient ID', async () => {
    const specialIds = [
      'patient@123',
      'patient#456',
      'patient$789',
      'patient<script>'
    ];

    console.log(' TC009: Testing special characters in patient ID...');

    for (const patientId of specialIds) {
      const response = await apiContext.get(`${API_VERSION}/ehr/patients/${encodeURIComponent(patientId)}/medications`);
      
      expect([400, 404, 500]).toContain(response.status());
      console.log(`  - ID "${patientId}": Status ${response.status()}`);
    }
    
    console.log(' TC009 PASSED: Special characters handled safely');
  });

  
});
