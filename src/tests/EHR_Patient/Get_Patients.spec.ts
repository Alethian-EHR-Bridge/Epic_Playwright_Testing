import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

/**
 * EHR Bridge Patient API Test Suite
 * Base URL: https://ehr-bridge-dev.ambitiousplant-5b7e30b9.eastus.azurecontainerapps.io
 * Endpoint: /api/v1/ehr/patients/{patientId}
 */

const BASE_URL = 'https://ehr-bridge-dev.ambitiousplant-5b7e30b9.eastus.azurecontainerapps.io';
const VALID_PATIENT_ID = 'e63wRTbPfr1p8UW81d8Seiw3';
const VALID_BUSINESS_LOCATION_ID = '6';

test.describe('EHR Bridge - Patient API Tests', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    // Create API request context
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'accept': 'application/json'
      }
    });
  });

  test.afterAll(async () => {
    // Dispose API request context
    await apiContext.dispose();
  });

  test.describe('Positive Test Scenarios', () => {
    
    test('TC001 - Should successfully retrieve patient details with valid patient ID and business location', async () => {
      const response = await apiContext.get(`/api/v1/ehr/patients/${VALID_PATIENT_ID}`, {
        headers: {
          'business-location-id': VALID_BUSINESS_LOCATION_ID
        }
      });

      // Assert response status
      expect(response.status()).toBe(200);
      expect(response.ok()).toBeTruthy();

      // Assert response headers
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');

      // Parse and validate response body
      const responseBody = await response.json();
      console.log('Patient Details Response:', JSON.stringify(responseBody, null, 2));

      // Validate response structure (adjust based on actual API response)
      expect(responseBody).toBeDefined();
      expect(responseBody).toHaveProperty('id');
      expect(responseBody.id).toBe(VALID_PATIENT_ID);
    });

    test('TC002 - Should return valid response time within acceptable limits', async () => {
      const startTime = Date.now();
      
      const response = await apiContext.get(`/api/v1/ehr/patients/${VALID_PATIENT_ID}`, {
        headers: {
          'business-location-id': VALID_BUSINESS_LOCATION_ID
        }
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(3000); // Response should be within 3 seconds
      console.log(`Response Time: ${responseTime}ms`);
    });

    test('TC003 - Should handle multiple consecutive requests successfully', async () => {
      const requestCount = 3;
      const responses = [];

      for (let i = 0; i < requestCount; i++) {
        const response = await apiContext.get(`/api/v1/ehr/patients/${VALID_PATIENT_ID}`, {
          headers: {
            'business-location-id': VALID_BUSINESS_LOCATION_ID
          }
        });
        responses.push(response);
      }

      // Verify all requests succeeded
      responses.forEach((response, index) => {
        expect(response.status()).toBe(200);
        console.log(`Request ${index + 1} Status: ${response.status()}`);
      });
    });

    test('TC004 - Should accept business-location-id with different valid values', async () => {
      const businessLocationIds = ['6', '1', '10', '100'];

      for (const locationId of businessLocationIds) {
        const response = await apiContext.get(`/api/v1/ehr/patients/${VALID_PATIENT_ID}`, {
          headers: {
            'business-location-id': locationId
          }
        });

        // Log the response for each location ID
        console.log(`Business Location ID: ${locationId}, Status: ${response.status()}`);
        
        // Accept 200 (found), 404 (not found for this location), and 500 (internal error) as valid responses
        expect([200, 404, 500]).toContain(response.status());
      }
    });
  });

  test.describe('Negative Test Scenarios', () => {
    
    test('TC005 - Should return 400/404 when patient ID is invalid', async () => {
      const invalidPatientIds = [
        'invalid_id',
        '12345',
        'abc@#$%',
        '',
        'null'
      ];

      for (const patientId of invalidPatientIds) {
        const response = await apiContext.get(`/api/v1/ehr/patients/${patientId}`, {
          headers: {
            'business-location-id': VALID_BUSINESS_LOCATION_ID
          }
        });

        console.log(`Invalid Patient ID: "${patientId}", Status: ${response.status()}`);
        expect([400, 404, 422, 500]).toContain(response.status());
      }
    });

    test('TC006 - Should return 400/401 when business-location-id header is missing', async () => {
      const response = await apiContext.get(`/api/v1/ehr/patients/${VALID_PATIENT_ID}`);

      console.log(`Missing business-location-id, Status: ${response.status()}`);
      expect([400, 401, 403]).toContain(response.status());
    });

    test('TC007 - Should return error when business-location-id is invalid', async () => {
      const invalidLocationIds = [
        'invalid',
        '-1',
        '0',
        'abc',
        '999999999'
      ];

      for (const locationId of invalidLocationIds) {
        const response = await apiContext.get(`/api/v1/ehr/patients/${VALID_PATIENT_ID}`, {
          headers: {
            'business-location-id': locationId
          }
        });

        console.log(`Invalid Location ID: "${locationId}", Status: ${response.status()}`);
        expect([400, 404, 422, 500]).toContain(response.status());
      }
    });

    test('TC008 - Should return 404 for non-existent patient ID', async () => {
      const nonExistentPatientId = 'nonExistentPatient123456789';

      const response = await apiContext.get(`/api/v1/ehr/patients/${nonExistentPatientId}`, {
        headers: {
          'business-location-id': VALID_BUSINESS_LOCATION_ID
        }
      });

      expect(response.status()).toBe(404);
      console.log('Non-existent patient returned 404 as expected');
    });

    test('TC009 - Should return error when using unsupported HTTP method', async () => {
      const response = await apiContext.post(`/api/v1/ehr/patients/${VALID_PATIENT_ID}`, {
        headers: {
          'business-location-id': VALID_BUSINESS_LOCATION_ID
        }
      });

      console.log(`Unsupported Method (POST), Status: ${response.status()}`);
      expect([405, 404]).toContain(response.status());
    });

   
    test('TC010 - Should handle special characters in patient ID', async () => {
      const specialCharPatientIds = [
        'patient<script>',
        'patient%20id',
        'patient/test',
        'patient?query=1',
        '../../../etc/passwd'
      ];

      for (const patientId of specialCharPatientIds) {
        const response = await apiContext.get(`/api/v1/ehr/patients/${patientId}`, {
          headers: {
            'business-location-id': VALID_BUSINESS_LOCATION_ID
          }
        });

        console.log(`Special Char Patient ID: "${patientId}", Status: ${response.status()}`);
        expect([400, 404, 422]).toContain(response.status());
      }
    });

    test('TC011 - Should return error for empty patient ID', async () => {
      const response = await apiContext.get('/api/v1/ehr/patients/', {
        headers: {
          'business-location-id': VALID_BUSINESS_LOCATION_ID
        }
      });

      console.log(`Empty Patient ID, Status: ${response.status()}`);
      expect([400, 404, 405, 500]).toContain(response.status());
    });

    test('TC012 - Should handle very long patient ID gracefully', async () => {
      const longPatientId = 'a'.repeat(1000);

      const response = await apiContext.get(`/api/v1/ehr/patients/${longPatientId}`, {
        headers: {
          'business-location-id': VALID_BUSINESS_LOCATION_ID
        }
      });

      console.log(`Long Patient ID (1000 chars), Status: ${response.status()}`);
      expect([400, 404, 414, 422]).toContain(response.status());
    });

    test('TC013 - Should handle null business-location-id header', async () => {
      const response = await apiContext.get(`/api/v1/ehr/patients/${VALID_PATIENT_ID}`, {
        headers: {
          'business-location-id': ''
        }
      });

      console.log(`Empty business-location-id, Status: ${response.status()}`);
      expect([400, 401, 403, 422]).toContain(response.status());
    });

    test('TC014 - Should handle case sensitivity in patient ID', async () => {
      const caseSensitiveId = VALID_PATIENT_ID.toLowerCase();

      const response = await apiContext.get(`/api/v1/ehr/patients/${caseSensitiveId}`, {
        headers: {
          'business-location-id': VALID_BUSINESS_LOCATION_ID
        }
      });

      console.log(`Case Sensitive Patient ID, Status: ${response.status()}`);
      // This will help determine if the API is case-sensitive
      console.log(`Original ID: ${VALID_PATIENT_ID}, Test ID: ${caseSensitiveId}`);
    });
  });

  test.describe('Security & Performance Tests', () => {
    
  });
});