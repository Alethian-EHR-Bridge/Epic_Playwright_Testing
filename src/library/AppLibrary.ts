import { Page, Locator } from '@playwright/test';

export class AppLibrary {
  page!: Page;

  findLocator(locatorString: string): Locator {
    const parts = locatorString.split(':-:');
    const type = parts[0].toLowerCase();
    let object = parts.slice(1).join(':');

    console.log(`Finding element with logic: ${locatorString}`);

    switch (type) {
      case 'id': return this.page.locator(`#${object}`);
      case 'name': return this.page.locator(`[name='${object}']`);
      case 'class': return this.page.locator(`.${object}`);
      case 'text': return this.page.getByText(object);
      case 'label': return this.page.getByLabel(object);
      case 'placeholder': return this.page.getByPlaceholder(object);
      case 'alttext': return this.page.getByAltText(object);
      case 'title': return this.page.getByTitle(object);
      case 'testid': return this.page.getByTestId(object);
      case 'css': return this.page.locator(object);
      case 'xpath': return this.page.locator(`xpath=${object}`);
      default: throw new Error(`Invalid locator strategy: ${type}`);
    }
  }

  async click(locatorString: string) {
    console.log(`🔹 Clicking on ${locatorString} and waiting for page to load...`);

    await Promise.all([
        this.findLocator(locatorString).click(),
        this.page.waitForLoadState('load', { timeout: 10000 }) // Waits for full page load
    ]);

    console.log('✅ Page load complete after clicking.');
}



  async enterText(locatorString: string, text: string) {
    console.log(`Entering text into ${locatorString}: ${text}`);
    const element = this.findLocator(locatorString);
    await element.fill('');
    await element.fill(text);
  }


  async smartWait(locatorString: string, timeout = 5000) {
    console.log(`Waiting for ${locatorString} to be visible...`);
    await this.findLocator(locatorString).waitFor({ timeout });
  }


  async isElementPresent(locatorString: string): Promise<boolean> {
    const count = await this.findLocator(locatorString).count();
    return count > 0;
  }


  async assertElementVisible(locatorString: string) {
    const isVisible = await this.findLocator(locatorString).isVisible();
    if (!isVisible) {
      await this.page.screenshot({ path: 'failure.png' });
      throw new Error(`❌ Element ${locatorString} is NOT visible!`);
    }
    console.log(`✅ Element ${locatorString} is visible.`);
  }

  async takeScreenshot(name: string) {
    console.log(`Capturing screenshot: ${name}.png`);
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }

  async scrollToElement(locatorString: string) {
    console.log(`Scrolling to ${locatorString}`);
    await this.findLocator(locatorString).scrollIntoViewIfNeeded();
  }


  async handleAlert(accept: boolean = true) {
    this.page.on('dialog', async dialog => {
      console.log(`Alert detected: ${dialog.message()}`);
      accept ? await dialog.accept() : await dialog.dismiss();
    });
  }


  async debugPause() {
    console.log('Pausing execution for debugging...');
    await this.page.pause();
  }
}
