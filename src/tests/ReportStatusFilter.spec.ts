import { test, expect } from '../utils/TestBase';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import config from '../config/config.json';

test('Dashboard Page - Report Status Filter Functionality', async ({ app }) => {
  const loginPage = new LoginPage(app);
  const dashboardPage = new DashboardPage(app);

  // Login and go to dashboard
  await loginPage.login(config.credentials.email, config.credentials.password);
  await dashboardPage.assertOnDashboard();

  // Select 'Requested' (should show no data)
  await dashboardPage.selectReportStatusRequested();
  let rowCount = await dashboardPage.getFilteredTableRowCount();
  expect(rowCount).toBe(0);

  //Select 'No Requested' (should show at least one row)
  await dashboardPage.selectReportStatusNoRequested();
  rowCount = await dashboardPage.getFilteredTableRowCount();
  expect(rowCount).toBeGreaterThan(0);
}); 