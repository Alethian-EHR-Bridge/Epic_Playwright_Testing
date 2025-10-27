import { AppLibrary } from '../library/AppLibrary';

export class LoginPage {
  private app: AppLibrary;

  // Locators defined using `:-:` format
  private emailInput: string = 'name:-:email';
  private passwordInput: string = 'name:-:password';
  private continueButton: string = 'text:-:Continue';
  private contactSupportButton: string = 'text:-:Contact support';

  constructor(app: AppLibrary) {
    this.app = app;
  }

  async login(username: string, password: string) {
    await this.app.enterText(this.emailInput, username);
    await this.app.enterText(this.passwordInput, password);
    await this.app.click(this.continueButton);
  }
}