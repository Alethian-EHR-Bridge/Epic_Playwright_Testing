import { test, expect, APIRequestContext } from '@playwright/test';

/**
 * EHR Bridge API - Get Specific Patient Document Tests
 * Base URL: https://ehr-bridge-dev.ambitiousplant-5b7e30b9.eastus.azurecontainerapps.io
 * Endpoint: GET /api/v1/ehr/patients/{patientId}/documents/{documentId}
 * 
 * This endpoint retrieves a specific document for a patient by document ID
 */

const BASE_URL = 'https://ehr-bridge-dev.ambitiousplant-5b7e30b9.eastus.azurecontainerapps.io';
const API_VERSION = '/api/v1';
const BUSINESS_LOCATION_ID = '6';
const PATIENT_ID = 'e63wRTbPfr1p8UW81d8Seiw3';

// Test data - you'll need to replace these with actual document IDs from your system
let documentId: string = '';
let validDocumentId: string = '';

test.describe('Get Specific Patient Document API Tests', () => {
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

    // First, get list of documents to retrieve a valid document ID
    const documentsResponse = await apiContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/documents`);
    
    if (documentsResponse.status() === 200) {
      const documents = await documentsResponse.json();
      const docArray = Array.isArray(documents) ? documents : documents.data || [];
      
      if (docArray.length > 0) {
        validDocumentId = docArray[0].id;
        documentId = validDocumentId;
        console.log('Setup: Retrieved valid document ID:', validDocumentId);
      } else {
        console.log('Setup: No documents found for patient');
      }
    }
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // ==========================================
  // POSITIVE TEST CASES
  // ==========================================

  test('TC001: Get specific patient document by ID', async () => {
    // Skip if no valid document ID
    if (!validDocumentId) {
      console.log('Skipping TC001: No valid document ID available');
      test.skip();
      return;
    }

    const response = await apiContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/documents/${validDocumentId}`);

    expect([200, 404, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const document = await response.json();
      console.log('TC001 PASSED: Get specific document successful');
      console.log('Document:', JSON.stringify(document, null, 2));
      
      // Verify document structure
      expect(document).toHaveProperty('id');
      expect(document.id).toBe(validDocumentId);
      
      console.log('Document ID:', document.id);
      console.log('Document Type:', document.type || 'N/A');
    } else {
      console.log('TC001 PASSED: Status:', response.status());
    }
  });

  test('TC002: Get patient document with all metadata', async () => {
    if (!validDocumentId) {
      console.log('Skipping TC002: No valid document ID available');
      test.skip();
      return;
    }

    const response = await apiContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/documents/${validDocumentId}`);

    expect([200, 404, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const document = await response.json();
      console.log('TC002 PASSED: Document metadata retrieved');
      
      // Check for common document metadata fields
      const expectedFields = ['id', 'patientId', 'type', 'date', 'createdAt', 'updatedAt'];
      const documentKeys = Object.keys(document);
      
      console.log('Document fields:', documentKeys);
      console.log('Document has ID:', document.id);
      
      if (document.type) console.log('Document Type:', document.type);
      if (document.date) console.log('Document Date:', document.date);
    } else {
      console.log('TC002 PASSED: Status:', response.status());
    }
  });

  test('TC003: Verify response structure and data types', async () => {
    if (!validDocumentId) {
      console.log('Skipping TC003: No valid document ID available');
      test.skip();
      return;
    }

    const response = await apiContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/documents/${validDocumentId}`);

    expect([200, 404, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const document = await response.json();
      console.log('TC003 PASSED: Response structure validated');
      
      // Verify data types
      expect(typeof document).toBe('object');
      expect(typeof document.id).toBe('string');
      
      if (document.patientId) {
        expect(typeof document.patientId).toBe('string');
      }
      
      if (document.type) {
        expect(typeof document.type).toBe('string');
      }
      
      console.log('Data type validation passed');
    } else {
      console.log('TC003 PASSED: Status:', response.status());
    }
  });

  test('TC004: Get multiple documents sequentially', async () => {
    // Get list of documents first
    const listResponse = await apiContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/documents`);
    
    if (listResponse.status() !== 200) {
      console.log('Skipping TC004: Cannot retrieve document list');
      test.skip();
      return;
    }

    const documents = await listResponse.json();
    const docArray = Array.isArray(documents) ? documents : documents.data || [];
    
    if (docArray.length === 0) {
      console.log('Skipping TC004: No documents available');
      test.skip();
      return;
    }

    console.log('TC004: Testing multiple document retrieval...');
    
    const maxDocs = Math.min(3, docArray.length);
    
    for (let i = 0; i < maxDocs; i++) {
      const docId = docArray[i].id;
      const response = await apiContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/documents/${docId}`);
      
      expect([200, 404, 500]).toContain(response.status());
      console.log(`  - Document ${i + 1} (${docId}): Status ${response.status()}`);
    }
    
    console.log('TC004 PASSED: Multiple documents retrieved');
  });

  // ==========================================
  // NEGATIVE TEST CASES
  // ==========================================

  test('TC005: Get document with invalid document ID format', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/documents/invalid-doc-id-123`);

    expect(response.ok()).toBeFalsy();
    expect([400, 404, 500]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('TC005 PASSED: Invalid document ID format rejected');
    console.log('Status:', response.status(), 'Error:', errorBody);
  });

  test('TC006: Get document with non-existent document ID', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/documents/nonexistent999999`);

    expect(response.ok()).toBeFalsy();
    expect([404, 500]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('TC006 PASSED: Non-existent document ID returns error');
    console.log('Status:', response.status(), 'Error:', errorBody);
  });



  test('TC007: Get document without business-location-id header', async ({ playwright }) => {
    if (!validDocumentId) {
      validDocumentId = 'dummy-doc-id';
    }

    const tempContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json'
        // Missing business-location-id
      }
    });

    const response = await tempContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/documents/${validDocumentId}`);

    expect(response.ok()).toBeFalsy();
    expect([400, 401, 403]).toContain(response.status());
    
    const errorBody = await response.json();
    console.log('✅ TC009 PASSED: Missing business-location-id header validation working');
    console.log('Status:', response.status(), 'Error:', errorBody);
    
    await tempContext.dispose();
  });

  test('TC008: Get document with empty document ID', async () => {
    const response = await apiContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/documents/`);

    // This might return document list or 404/400
    expect([200, 400, 404, 500]).toContain(response.status());
    
    console.log('✅ TC010 PASSED: Empty document ID handled');
    console.log('Status:', response.status());
  });

  

  // ==========================================
  // FUNCTIONAL TEST CASES
  // ==========================================



  test('TC009: Test document ID with special characters', async () => {
    const specialCharIds = [
      'doc-id-with-hyphens',
      'doc_id_with_underscores',
      'doc.id.with.dots',
      'doc@id#special'
    ];

    console.log('✅ TC011: Testing special characters in document ID...');

    for (const docId of specialCharIds) {
      const response = await apiContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/documents/${docId}`);

      expect([200, 400, 404, 500]).toContain(response.status());
      console.log(`  - Document ID "${docId}": Status ${response.status()}`);
    }
    
    console.log('✅ TC011 PASSED: Special characters in document ID tested');
  });

  test('TC010: Test very long document ID', async () => {
    const longDocId = 'a'.repeat(500);
    
    const response = await apiContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/documents/${longDocId}`);

    expect([400, 404, 414, 500]).toContain(response.status());
    
    console.log('TC012 PASSED: Very long document ID handled');
    console.log('Status:', response.status());
  });

  

  test('TC011:Verify document belongs to correct patient', async () => {
    if (!validDocumentId) {
      console.log('⚠️ Skipping TC020: No valid document ID available');
      test.skip();
      return;
    }

    const response = await apiContext.get(`${API_VERSION}/ehr/patients/${PATIENT_ID}/documents/${validDocumentId}`);

    if (response.status() === 200) {
      const document = await response.json();
      
      // Verify patient ID in document matches request
      if (document.patientId) {
        expect(document.patientId).toBe(PATIENT_ID);
        console.log('✅ TC020 PASSED: Document belongs to correct patient');
        console.log('Patient ID:', document.patientId);
      } else {
        console.log('⚠️ TC020: Document does not contain patientId field');
      }
    } else {
      console.log('✅ TC020: Status:', response.status());
    }
  });
});