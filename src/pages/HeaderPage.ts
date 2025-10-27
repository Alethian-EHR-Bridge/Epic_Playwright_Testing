import { AppLibrary } from '../library/AppLibrary';

export class HeaderPage {
  private app: AppLibrary;

  // Locators
  private logo: string = 'css:-:img[alt="navimage"]';
  private title: string = 'text:-:Health Team';
  private userProfileButton: string = 'css:-:button[aria-haspopup="menu"]';
  private userAvatar: string = 'css:-:img.rounded-full';
  private userName: string = 'css:-:button[aria-haspopup="menu"] div:last-child';

  constructor(app: AppLibrary) {
    this.app = app;
  }

  async assertHeaderVisible() {
    await this.app.assertElementVisible(this.logo);
    await this.app.assertElementVisible(this.title);
    await this.app.assertElementVisible(this.userProfileButton);
  }

  async getUserName(): Promise<string> {
    return await this.app.findLocator(this.userName).innerText();
  }

  async clickUserProfile() {
    await this.app.click(this.userProfileButton);
  }
} 