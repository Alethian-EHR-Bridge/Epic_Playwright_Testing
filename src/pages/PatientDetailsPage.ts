import { AppLibrary } from '../library/AppLibrary';

export class PatientDetailsPage {
  private app: AppLibrary;

  // Locators
  private patientName: string = 'css:-:div.text-lg.font-bold';
  private patientEmail: string = 'xpath:-://div[@class="text-muted-foreground text-sm"]';
  private updateStatusSection: string = 'text:-:Update status';
  private profileCompleteButton: string = 'text:-:Profile complete';
  private testOrderedButton: string = 'text:-:Test ordered';
  private reportReadyButton: string = 'text:-:Report ready';
  private planSubmittedButton: string = 'text:-:Plan submitted';
  private referenceCode: string = 'text:-:Reference code';
  private referenceValue: string = 'css:-:span.text-2xl.font-mono.font-semibold';
  private editReferenceButton: string = 'text:-:Edit';
  private uploadReportSection: string = 'text:-:Upload report';
  private reviewAndSubmitButton: string = 'text:-:Review and Submit';
  private planSection: string = 'xpath:-://div[text()="Plan"]';
  private planStatus: string = 'xpath:-://div[contains(@class, "inline-flex") and contains(@class, "rounded-full")]';
  private createPlanButton: string = 'text:-:Create plan';
  private editProfileButton: string = 'text:-:Edit Profile';
  private dashboardBreadcrumb: string = 'css:-:nav[aria-label="breadcrumb"] a[href="/dashboard"]';

  constructor(app: AppLibrary) {
    this.app = app;
  }

  async assertPatientDetailsVisible() {
    await this.app.page.waitForTimeout(4000);
    await this.app.assertElementVisible(this.patientName);
    await this.app.assertElementVisible(this.patientEmail);
    await this.app.assertElementVisible(this.updateStatusSection);
  }

  async getPatientName(): Promise<string> {
    return await this.app.findLocator(this.patientName).innerText();
  }

  async getPatientEmail(): Promise<string> {
    return await this.app.findLocator(this.patientEmail).innerText();
  }

  async clickStatusButton(status: 'Profile complete' | 'Test ordered' | 'Report ready' | 'Plan submitted') {
    const statusLocators = {
      'Profile complete': this.profileCompleteButton,
      'Test ordered': this.testOrderedButton,
      'Report ready': this.reportReadyButton,
      'Plan submitted': this.planSubmittedButton,
    };
    await this.app.click(statusLocators[status]);
  }

  async getReferenceCode(): Promise<string> {
    return await this.app.findLocator(this.referenceValue).innerText();
  }

  async clickEditReference() {
    await this.app.click(this.editReferenceButton);
  }

  async uploadReport(filePath: string) {
    // This assumes you have a file input element accessible for upload
    await this.app.page.setInputFiles('input[type="file"]', filePath);
  }

  async clickReviewAndSubmit() {
    await this.app.click(this.reviewAndSubmitButton);
  }

  async assertPlanSectionVisible() {
    await this.app.assertElementVisible(this.planSection);
    await this.app.assertElementVisible(this.planStatus);
  }

  async clickEditProfile() {
    await this.app.click(this.editProfileButton);
  }

  async clickDashboardBreadcrumb() {
    await this.app.click(this.dashboardBreadcrumb);
  }
} 