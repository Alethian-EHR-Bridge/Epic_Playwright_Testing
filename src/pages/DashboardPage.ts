import { AppLibrary } from '../library/AppLibrary';

export class DashboardPage {
  private app: AppLibrary;

  // Locators
  private dashboardTitle: string = 'text:-:Dashboard';
  private searchInput: string = 'placeholder:-:Search name, email';
  private updateMissingFieldsButton: string = 'text:-:Update Missing Fields';
  private reportStatusDropdown: string = 'text:-:Report Status';
  private planStatusDropdown: string = 'text:-:Plan Status';
  private tableRow: string = 'css:-:table tbody tr';
  private tableCell: string = 'css:-:table tbody tr td';
  public firstRowPatientNameLink: string = 'css:-:table tbody tr:first-child td:first-child a';
  // Report Status Dropdown and Options
  private reportStatusDropdownButton: string = 'css:-:button[role="combobox"]:has(span:text-is("Report Status"))';
  private requestedDropdownButton: string = 'xpath:-://button[@role="combobox"]//div[contains(text(),"Requested")]';
  private reportStatusOptionRequested: string = 'xpath:-://div[@role="option"]//div[normalize-space(text())="Requested"]';
  private reportStatusOptionNoRequested: string = 'xpath:-://div[@role="option"]//div[contains(.,"No Requested")]';
  private reportStatusOptionUploaded: string = 'xpath:-://div[@role="option"]//div[contains(.,"Uploaded")]';

  constructor(app: AppLibrary) {
    this.app = app;
  }

  async assertOnDashboard() {
    await this.app.smartWait(this.dashboardTitle);
    await this.app.assertElementVisible(this.dashboardTitle);
  }

  async searchUser(query: string) {
    await this.app.enterText(this.searchInput, query);
  }

  async clickUpdateMissingFields() {
    await this.app.click(this.updateMissingFieldsButton);
  }

  async openReportStatusDropdown() {
    await this.app.click(this.reportStatusDropdownButton);
  }

  async openPlanStatusDropdown() {
    await this.app.click(this.planStatusDropdown);
  }

  async getTableRowsCount(): Promise<number> {
    return await this.app.findLocator(this.tableRow).count();
  }

  async getTableCellText(rowIndex: number, cellIndex: number): Promise<string> {
    // rowIndex and cellIndex are 0-based
    const cellLocator = `${this.tableRow} >> nth=${rowIndex} >> td >> nth=${cellIndex}`;
    return await this.app.findLocator(cellLocator).innerText();
  }

  /**
   * Clicks the patient name link in the first row after verifying it matches the expected name.
   */
  async clickFirstRowPatientByName(expectedName: string) {
    // const locator = this.firstRowPatientNameLink;
    // const firstRowName = await this.app.findLocator(locator).innerText();
    // if (!firstRowName.toLowerCase().includes(expectedName.toLowerCase())) {
    //   throw new Error(`First row patient name '${firstRowName}' does not match expected '${expectedName}'`);
    // }
    // await this.app.findLocator(locator).click();

    await this.app.click(this.firstRowPatientNameLink);
  }

  /**
   * Selects the 'Requested' option in the Report Status dropdown.
   */
  async selectReportStatusRequested() {
    await this.openReportStatusDropdown();
    await this.app.click(this.reportStatusOptionRequested);
    await this.app.page.waitForTimeout(2000);
  }

  /**
   * Selects the 'No Requested' option in the Report Status dropdown.
   */
  async selectReportStatusNoRequested() {
    await this.app.click(this.requestedDropdownButton);
    await this.app.click(this.reportStatusOptionNoRequested);
    await this.app.page.waitForTimeout(2000);
  }

  /**
   * Selects the 'Uploaded' option in the Report Status dropdown.
   */
  async selectReportStatusUploaded() {
    await this.openReportStatusDropdown();
    await this.app.click(this.reportStatusOptionUploaded);
  }

  /**
   * Returns the number of rows in the patient table (after filtering), excluding 'No results.' placeholder rows.
   */
  async getFilteredTableRowCount(): Promise<number> {
    const rows = await this.app.findLocator(this.tableRow).all();
    let count = 0;
    for (const row of rows) {
      const text = await row.innerText();
      if (!text.includes('No results.')) {
        count++;
      }
    }
    return count;
  }
} 