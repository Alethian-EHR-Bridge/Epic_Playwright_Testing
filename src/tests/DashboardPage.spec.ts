import { test, expect } from '../utils/TestBase';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import config from '../config/config.json';

test('Dashboard Page - Search Functionality', async ({ app }) => {
  const loginPage = new LoginPage(app);
  const dashboardPage = new DashboardPage(app);

  // Login first
  await loginPage.login(config.credentials.email, config.credentials.password);
  await dashboardPage.assertOnDashboard();

  // Search for a patient by name
  const searchName = 'Sujit';
  await dashboardPage.searchUser(searchName);

  // Wait for table to update and check at least one row contains the search name
  const rowCount = await dashboardPage.getTableRowsCount();
  let found = false;
  for (let i = 0; i < rowCount; i++) {
    const cellText = await dashboardPage.getTableCellText(i, 1); // 1 = Email column, 0 = Name column
    if (cellText.toLowerCase().includes(searchName.toLowerCase())) {
      found = true;
      break;
    }
  }
  expect(found).toBeTruthy();
});