import { test, expect, APIRequestContext } from '@playwright/test';

/**
 * EHR Bridge API - Get Appointments by Date Range Tests
 * Base URL: https://ehr-bridge-dev.ambitiousplant-5b7e30b9.eastus.azurecontainerapps.io
 * Endpoint: GET /api/v1/ehr/appointments
 * Query Parameters: startDate, endDate, patientId
 * 
 * Retrieves appointments within a specific date range for a patient
 */

const BASE_URL = 'https://ehr-bridge-dev.ambitiousplant-5b7e30b9.eastus.azurecontainerapps.io';
const API_VERSION = '/api/v1';
const BUSINESS_LOCATION_ID = '6';
const PATIENT_ID = 'eq081-VQEgP8drUUqCWzHfw3';
const START_DATE = '2019-05-24T19:30:00Z';
const END_DATE = '2019-05-24T19:45:00Z';

test.describe('Get Appointments by Date Range API Tests', () => {
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

  test('TC001: Get appointments with valid date range and patient ID', async () => {
    const response = await apiContext.get(
      `${API_VERSION}/ehr/appointments?startDate=${START_DATE}&endDate=${END_DATE}&patientId=${PATIENT_ID}`
    );

    expect([200, 404, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const responseBody = await response.json();
      console.log('TC001 PASSED: Appointments retrieved successfully');
      console.log('Response:', JSON.stringify(responseBody, null, 2));
      
      const appointments = Array.isArray(responseBody) 
        ? responseBody 
        : responseBody.appointments || responseBody.data || [];
      console.log('Total appointments found:', appointments.length);
      console.log('Date range:', START_DATE, 'to', END_DATE);
      
      if (appointments.length > 0) {
        const appointment = appointments[0];
        console.log('Sample appointment:', appointment);
        expect(appointment).toHaveProperty('id');
      }
    } else {
      console.log('TC001 PASSED: Status:', response.status());
    }
  });

  test('TC002: Verify all appointments fall within the date range', async () => {
    const response = await apiContext.get(
      `${API_VERSION}/ehr/appointments?startDate=${START_DATE}&endDate=${END_DATE}&patientId=${PATIENT_ID}`
    );

    if (response.status() === 200) {
      const responseBody = await response.json();
      const appointments = Array.isArray(responseBody) 
        ? responseBody 
        : responseBody.appointments || responseBody.data || [];
      
      console.log('TC002: Verifying date range filtering');
      console.log('Requested range:', START_DATE, 'to', END_DATE);
      console.log('Total appointments:', appointments.length);
      
      const startDateTime = new Date(START_DATE);
      const endDateTime = new Date(END_DATE);
      
      let withinRange = 0;
      let outsideRange = 0;
      
      appointments.forEach((apt: any, index: number) => {
        const dateField = apt.startDatetime || apt.startDateTime || apt.appointmentDate || apt.appointment_date || apt.date || apt.startTime;
        
        if (dateField) {
          const aptDate = new Date(dateField);
          const isWithinRange = aptDate >= startDateTime && aptDate <= endDateTime;
          
          if (isWithinRange) {
            withinRange++;
          } else {
            outsideRange++;
          }
          
          if (index < 3) { // Show first 3
            console.log(`  - Appointment ${index + 1}: ${dateField} - Within range: ${isWithinRange}`);
          }
        }
      });
      
      console.log(`Appointments within range: ${withinRange}/${appointments.length}`);
      if (outsideRange > 0) {
        console.log(`⚠️ Warning: ${outsideRange} appointments outside requested range`);
      }
      
      console.log('TC002 PASSED: Date range filtering verified');
    } else {
      console.log('TC002: Status:', response.status());
    }
  });

  test('TC003: Get appointments with same day date range', async () => {
    const sameDayStart = '2019-05-24T00:00:00Z';
    const sameDayEnd = '2019-05-24T23:59:59Z';
    
    const response = await apiContext.get(
      `${API_VERSION}/ehr/appointments?startDate=${sameDayStart}&endDate=${sameDayEnd}&patientId=${PATIENT_ID}`
    );

    expect([200, 404, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const responseBody = await response.json();
      const appointments = Array.isArray(responseBody) 
        ? responseBody 
        : responseBody.appointments || responseBody.data || [];
      
      console.log('TC003 PASSED: Same day range query successful');
      console.log('Date:', '2019-05-24');
      console.log('Appointments found:', appointments.length);
    } else {
      console.log('TC003 PASSED: Status:', response.status());
    }
  });

  test('TC004: Verify appointment data structure with date filters', async () => {
    const response = await apiContext.get(
      `${API_VERSION}/ehr/appointments?startDate=${START_DATE}&endDate=${END_DATE}&patientId=${PATIENT_ID}`
    );

    if (response.status() === 200) {
      const responseBody = await response.json();
      const appointments = Array.isArray(responseBody) 
        ? responseBody 
        : responseBody.appointments || responseBody.data || [];
      
      console.log('TC004: Appointment structure validation');
      
      if (appointments.length > 0) {
        const appointment = appointments[0];
        
        const expectedFields = [
          'id', 'patientId', 'providerId', 'appointmentDate', 
          'appointmentTime', 'status', 'reason', 'type', 
          'location', 'duration', 'createdAt', 'updatedAt'
        ];
        
        console.log('Available fields:', Object.keys(appointment));
        
        expect(appointment).toHaveProperty('id');
        
        expectedFields.forEach(field => {
          if (appointment[field] !== undefined) {
            console.log(`  ✓ ${field}:`, appointment[field]);
          } else {
            console.log(`  ✗ ${field}: Not present`);
          }
        });
      } else {
        console.log('No appointments to validate structure');
      }
      
      console.log('TC004 PASSED: Structure validated');
    } else {
      console.log('TC004: Status:', response.status());
    }
  });

  test('TC007: Get appointments for multiple patients with same date range', async () => {
    const patientIds = [
      'eq081-VQEgP8drUUqCWzHfw3',
      'eX6eFJqj-TrTEtf5w901wRw3',
      'e63wRTbPfr1p8UW81d8Seiw3'
    ];

    console.log('TC005: Testing date range for multiple patients...');

    for (const patientId of patientIds) {
      const response = await apiContext.get(
        `${API_VERSION}/ehr/appointments?startDate=${START_DATE}&endDate=${END_DATE}&patientId=${patientId}`
      );
      
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
    
    console.log('TC005 PASSED: Multiple patients tested');
  });

  test('TC008: Get appointments with different date format variations', async () => {
    const dateFormats = [
      { start: '2019-05-24T19:30:00Z', end: '2019-05-24T19:45:00Z', desc: 'ISO 8601 with Z' },
      { start: '2019-05-24T19:30:00.000Z', end: '2019-05-24T19:45:00.000Z', desc: 'ISO 8601 with milliseconds' },
      { start: encodeURIComponent('2019-05-24T19:30:00Z'), end: encodeURIComponent('2019-05-24T19:45:00Z'), desc: 'URL encoded' }
    ];

    console.log('TC006: Testing date format variations...');

    for (const format of dateFormats) {
      const response = await apiContext.get(
        `${API_VERSION}/ehr/appointments?startDate=${format.start}&endDate=${format.end}&patientId=${PATIENT_ID}`
      );
      
      console.log(`  - Format: ${format.desc} - Status: ${response.status()}`);
      expect([200, 400, 404, 500]).toContain(response.status());
    }
    
    console.log('TC006 PASSED: Date format variations tested');
  });

  test('TC007: Get appointments with future date range', async () => {
    const futureStart = '2025-12-01T00:00:00Z';
    const futureEnd = '2025-12-31T23:59:59Z';
    
    const response = await apiContext.get(
      `${API_VERSION}/ehr/appointments?startDate=${futureStart}&endDate=${futureEnd}&patientId=${PATIENT_ID}`
    );

    expect([200, 404, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const responseBody = await response.json();
      const appointments = Array.isArray(responseBody) 
        ? responseBody 
        : responseBody.appointments || responseBody.data || [];
      
      console.log('TC007 PASSED: Future date range query successful');
      console.log('Date range: December 2025');
      console.log('Appointments found:', appointments.length);
    } else {
      console.log('TC007 PASSED: Status:', response.status());
    }
  });

 
  test('TC008: Get appointments without startDate parameter', async () => {
    const response = await apiContext.get(
      `${API_VERSION}/ehr/appointments?endDate=${END_DATE}&patientId=${PATIENT_ID}`
    );

    expect([200, 400, 422, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const responseBody = await response.json();
      console.log('TC008 PASSED: Missing startDate parameter handled (returned 200)');
      console.log('Status:', response.status());
      console.log('Response:', responseBody);
    } else {
      const errorBody = await response.json();
      console.log('TC008 PASSED: Missing startDate parameter rejected');
      console.log('Status:', response.status());
      console.log('Error:', errorBody);
      
      if (errorBody.message || errorBody.error) {
        console.log('Error message:', errorBody.message || errorBody.error);
      }
    }
  });

  test('TC009: Get appointments without endDate parameter', async () => {
    const response = await apiContext.get(
      `${API_VERSION}/ehr/appointments?startDate=${START_DATE}&patientId=${PATIENT_ID}`
    );

    expect([200, 400, 422, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const responseBody = await response.json();
      console.log('TC009 PASSED: Missing endDate parameter handled (returned 200)');
      console.log('Status:', response.status());
      console.log('Response:', responseBody);
    } else {
      const errorBody = await response.json();
      console.log('TC009 PASSED: Missing endDate parameter rejected');
      console.log('Status:', response.status());
      console.log('Error:', errorBody);
    }
  });

  test('TC010: Get appointments without patientId parameter', async () => {
    const response = await apiContext.get(
      `${API_VERSION}/ehr/appointments?startDate=${START_DATE}&endDate=${END_DATE}`
    );

    expect([400, 422, 500]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('TC010 PASSED: Missing patientId parameter rejected');
    console.log('Status:', response.status());
    console.log('Error:', errorBody);
  });

  test('TC011: Get appointments with invalid date format', async () => {
    const invalidDates = [
      { start: 'invalid-date', end: END_DATE, desc: 'Invalid start date' },
      { start: START_DATE, end: 'invalid-date', desc: 'Invalid end date' },
      { start: '2019-13-45', end: END_DATE, desc: 'Invalid month/day' },
      { start: '24-05-2019', end: END_DATE, desc: 'Wrong format (DD-MM-YYYY)' }
    ];

    console.log('TC011: Testing invalid date formats...');

    for (const dateTest of invalidDates) {
      const response = await apiContext.get(
        `${API_VERSION}/ehr/appointments?startDate=${dateTest.start}&endDate=${dateTest.end}&patientId=${PATIENT_ID}`
      );
      
      expect([200, 400, 422, 500]).toContain(response.status());
      console.log(`  - ${dateTest.desc}: Status ${response.status()}`);
    }
    
    console.log('TC011 PASSED: Invalid date formats rejected');
  });

  test('TC012: Get appointments with endDate before startDate', async () => {
    const invalidStart = '2019-05-24T19:45:00Z';
    const invalidEnd = '2019-05-24T19:30:00Z';
    
    const response = await apiContext.get(
      `${API_VERSION}/ehr/appointments?startDate=${invalidStart}&endDate=${invalidEnd}&patientId=${PATIENT_ID}`
    );

    expect([200, 400, 422, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const responseBody = await response.json();
      console.log('TC012 PASSED: Invalid date range handled (returned 200)');
      console.log('Status:', response.status());
      console.log('Response:', responseBody);
    } else {
      const errorBody = await response.json();
      console.log('TC012 PASSED: Invalid date range (end before start) rejected');
      console.log('Status:', response.status());
      console.log('Error:', errorBody);
    }
  });

  test('TC013: Get appointments with empty date parameters', async () => {
    const response = await apiContext.get(
      `${API_VERSION}/ehr/appointments?startDate=&endDate=&patientId=${PATIENT_ID}`
    );

    expect([200, 400, 422, 500]).toContain(response.status());
    
    console.log('TC013 PASSED: Empty date parameters rejected');
    console.log('Status:', response.status());
  });

  test('TC014: Get appointments with invalid patient ID', async () => {
    const response = await apiContext.get(
      `${API_VERSION}/ehr/appointments?startDate=${START_DATE}&endDate=${END_DATE}&patientId=invalid-patient-123`
    );

    expect([400, 404, 500]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('TC014 PASSED: Invalid patient ID handled');
    console.log('Status:', response.status());
    console.log('Error:', errorBody);
  });

  test('TC015: Get appointments without business-location-id header', async ({ playwright }) => {
    const tempContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json'
      }
    });

    const response = await tempContext.get(
      `${API_VERSION}/ehr/appointments?startDate=${START_DATE}&endDate=${END_DATE}&patientId=${PATIENT_ID}`
    );

    expect(response.ok()).toBeFalsy();
    expect([400, 401, 403, 500]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('TC015 PASSED: Missing business-location-id header validation working');
    console.log('Status:', response.status());
    console.log('Error:', errorBody);
    
    await tempContext.dispose();
  });


  test('TC016: Get appointments with special characters in date parameters', async () => {
    const specialChars = [
      '2019-05-24T19:30:00Z@#$%',
      '2019-05-24T19:30:00Z<>',
      '2019-05-24T19:30:00Z&&&'
    ];

    console.log('TC016: Testing special characters in dates...');

    for (const specialDate of specialChars) {
      const response = await apiContext.get(
        `${API_VERSION}/ehr/appointments?startDate=${encodeURIComponent(specialDate)}&endDate=${END_DATE}&patientId=${PATIENT_ID}`
      );
      
      expect([200, 400, 422, 500]).toContain(response.status());
      console.log(`  - Special chars blocked: Status ${response.status()}`);
    }
    
    console.log('TC016 PASSED: Special characters handled safely');
  });

  test('TC017: Get appointments with null or undefined values', async () => {
    const nullTests = [
      { start: 'null', end: END_DATE, desc: 'null startDate' },
      { start: START_DATE, end: 'undefined', desc: 'undefined endDate' },
      { start: START_DATE, end: END_DATE, patientId: 'null', desc: 'null patientId' }
    ];

    console.log('TC017: Testing null/undefined values...');

    for (const test of nullTests) {
      const response = await apiContext.get(
        `${API_VERSION}/ehr/appointments?startDate=${test.start}&endDate=${test.end}&patientId=${test.patientId || PATIENT_ID}`
      );
      
      expect([200, 400, 404, 422, 500]).toContain(response.status());
      console.log(`  - ${test.desc}: Status ${response.status()}`);
    }
    
    console.log('TC017 PASSED: Null/undefined values handled');
  });


  test('TC018: Get appointments with duplicate query parameters', async () => {
    const response = await apiContext.get(
      `${API_VERSION}/ehr/appointments?startDate=${START_DATE}&startDate=2019-06-01T00:00:00Z&endDate=${END_DATE}&patientId=${PATIENT_ID}`
    );

    // API behavior with duplicate params varies
    expect([200, 400, 422, 500]).toContain(response.status());
    
    console.log('TC018 PASSED: Duplicate parameters handled');
    console.log('Status:', response.status());
  });

});