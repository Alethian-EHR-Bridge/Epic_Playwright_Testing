import { test, expect } from '../utils/TestBase';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PatientDetailsPage } from '../pages/PatientDetailsPage';
import config from '../config/config.json';

test('Patient Details - View and Return to Dashboard', async ({ app }) => {
  const loginPage = new LoginPage(app);
  const dashboardPage = new DashboardPage(app);
  const patientDetailsPage = new PatientDetailsPage(app);

  // Login and go to dashboard
  await loginPage.login(config.credentials.email, config.credentials.password);
  await dashboardPage.assertOnDashboard();

  // Search for the patient by name
  const patientName = 'Adam';
  await dashboardPage.searchUser(patientName);

  // Click on the patient name in the table (assume first row, first cell is the name link)
  await dashboardPage.clickFirstRowPatientByName(patientName);

  // Verify patient details page
  await patientDetailsPage.assertPatientDetailsVisible();
  const name = await patientDetailsPage.getPatientName();
  expect(name).toContain('Adam');
  const email = await patientDetailsPage.getPatientEmail();
  expect(email).toContain('@');
  await patientDetailsPage.assertPlanSectionVisible();

  // Click on the Dashboard breadcrumb to return
  await patientDetailsPage.clickDashboardBreadcrumb();
  await dashboardPage.assertOnDashboard();
}); 