import { test, expect } from '../utils/TestBase';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { HeaderPage } from '../pages/HeaderPage';
import config from '../config/config.json';

test('Login Page - Successful Login', async ({ app }) => {
  const loginPage = new LoginPage(app);
  const dashboardPage = new DashboardPage(app);
  const headerPage = new HeaderPage(app);

  // Attempt login with credentials from config
  await loginPage.login(config.credentials.email, config.credentials.password);

  // Assert dashboard and header are visible after login
  await dashboardPage.assertOnDashboard();
  await headerPage.assertHeaderVisible();
}); 