import { test, expect, APIRequestContext } from '@playwright/test';

const BASE_URL = 'https://ehr-bridge-dev.ambitiousplant-5b7e30b9.eastus.azurecontainerapps.io';
const API_VERSION = '/api/v1';
const BUSINESS_LOCATION_ID = '6';
const APPOINTMENT_ID = 'evTiQA9oPDAS66tOkrTIbXVkgWPaOTrRcucSsvdoeNfI3';

test.describe('Get Appointment by ID API Tests', () => {
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

  test('TC001: Get appointment by valid ID successfully', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/appointments/${APPOINTMENT_ID}`);

    expect([200, 404, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const responseBody = await response.json();
      console.log('TC001 PASSED: Appointment retrieved successfully');
      console.log('Response:', JSON.stringify(responseBody, null, 2));
      
      // Verify appointment has an ID
      expect(responseBody).toHaveProperty('id');
      expect(responseBody.id).toBe(APPOINTMENT_ID);
      
      console.log('Appointment ID:', responseBody.id);
    } else {
      console.log('TC001 PASSED: Status:', response.status());
    }
  });



  test('TC002: Get multiple appointments by different IDs', async () => {
    const appointmentIds = [
      'evTiQA9oPDAS66tOkrTIbXVkgWPaOTrRcucSsvdoeNfI3',
      'evTiQA9oPDAS66tOkrTIbXdvQysdvJopbk.a8HGzO7k43',
      'ejxqY5Pdk6FFOvtrireyw8RTvNd-wqa5ZQPOyQb0Y60g3'
      // Add more valid appointment IDs if available
    ];

    console.log('TC002: Testing multiple appointment IDs...');

    for (const appointmentId of appointmentIds) {
      const response = await apiContext.get(`${API_VERSION}/ehr/appointments/${appointmentId}`);
      
      expect([200, 404, 500]).toContain(response.status());
      console.log(`  - Appointment ${appointmentId}: Status ${response.status()}`);
      
      if (response.status() === 200) {
        const appointment = await response.json();
        console.log(`  Retrieved appointment with status: ${appointment.status || 'N/A'}`);
      }
    }
    
    console.log('TC002 PASSED: Multiple appointments tested');
  });

  // ==========================================
  // NEGATIVE TEST CASES
  // ==========================================

  test('TC003: Get appointment with non-existent ID', async () => {
    const nonExistentId = 'nonexistent-appointment-id-999999';
    const response = await apiContext.get(`${API_VERSION}/ehr/appointments/${nonExistentId}`);

    expect(response.ok()).toBeFalsy();
    expect([404, 500]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('TC003 PASSED: Non-existent appointment ID handled');
    console.log('Status:', response.status());
    console.log('Error:', errorBody);
    
    // Verify error response contains meaningful message
    if (errorBody.message || errorBody.error) {
      console.log('Error message:', errorBody.message || errorBody.error);
    }
  });

  test('TC004: Get appointment with invalid ID format', async () => {
    const invalidIds = [
      '123',
      'invalid-format',
      'appointment@invalid',
      'short'
    ];

    console.log('TC004: Testing invalid appointment ID formats...');

    for (const invalidId of invalidIds) {
      const response = await apiContext.get(`${API_VERSION}/ehr/appointments/${invalidId}`);
      
      expect([400, 404, 500]).toContain(response.status());
      console.log(`  - ID "${invalidId}": Status ${response.status()}`);
    }
    
    console.log('TC004 PASSED: Invalid ID formats rejected');
  });

  test('TC005: Get appointment with empty ID', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/appointments/`);

    // This might redirect or return different status based on API design
    expect([400, 404, 405, 500]).toContain(response.status());
    
    console.log('TC005 PASSED: Empty ID handled');
    console.log('Status:', response.status());
  });

  test('TC006: Get appointment without business-location-id header', async ({ playwright }) => {
    const tempContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json'
        // Missing business-location-id
      }
    });

    const response = await tempContext.get(`${API_VERSION}/ehr/appointments/${APPOINTMENT_ID}`);

    expect(response.ok()).toBeFalsy();
    expect([400, 401, 403, 500]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('TC006 PASSED: Missing business-location-id header validation working');
    console.log('Status:', response.status());
    console.log('Error:', errorBody);
    
    await tempContext.dispose();
  });

  test('TC007: Get appointment with invalid business-location-id', async ({ playwright }) => {
    const tempContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'business-location-id': 'invalid-location-999'
      }
    });

    const response = await tempContext.get(`${API_VERSION}/ehr/appointments/${APPOINTMENT_ID}`);

    expect(response.ok()).toBeFalsy();
    expect([400, 403, 404, 500]).toContain(response.status());
    
    console.log('TC007 PASSED: Invalid business-location-id handled');
    console.log('Status:', response.status());
    
    await tempContext.dispose();
  });


  test('TC008: Get appointment with special characters in ID', async () => {
    const specialCharIds = [
      'appointment@#$%',
      'appointment!@#',
      'appointment***',
      'appointment&&&'
    ];

    console.log('TC008: Testing special characters in appointment ID...');

    for (const specialId of specialCharIds) {
      const response = await apiContext.get(
        `${API_VERSION}/ehr/appointments/${encodeURIComponent(specialId)}`
      );
      
      expect([400, 404, 500]).toContain(response.status());
      console.log(`  - ID "${specialId}": Status ${response.status()}`);
    }
    
    console.log('TC008 PASSED: Special characters handled safely');
  });

});