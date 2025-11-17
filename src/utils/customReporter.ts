import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface TestReport {
  testCase: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  error?: string;
  suite: string;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  timedOut: number;
  duration: number;
}

interface FullTestReport {
  summary: TestSummary;
  testCases: TestReport[];
  timestamp: string;
  testSuite: string;
}

class CustomReporter implements Reporter {
  private testResults: TestReport[] = [];
  private startTime: number = Date.now();
  private outputDir: string;

  constructor(options: { outputDir?: string } = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'test-reports');
  }

  onBegin(config: FullConfig, suite: Suite) {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Get full suite path (handles nested suites)
    const suitePath: string[] = [];
    let parent: any = test.parent;
    while (parent && parent.title) {
      suitePath.unshift(parent.title);
      parent = parent.parent;
    }
    const suiteName = suitePath.length > 0 ? suitePath.join(' > ') : 'Unknown Suite';
    
    const testReport: TestReport = {
      testCase: test.title,
      status: result.status,
      duration: result.duration,
      suite: suiteName,
    };

    if (result.status === 'failed' && result.error) {
      testReport.error = result.error.message || result.error.toString() || 'Unknown error';
      // Include stack trace if available
      if (result.error.stack) {
        testReport.error += '\n' + result.error.stack;
      }
    }

    this.testResults.push(testReport);
  }

  onEnd(result: FullResult) {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    // Calculate summary
    const summary: TestSummary = {
      total: this.testResults.length,
      passed: this.testResults.filter(t => t.status === 'passed').length,
      failed: this.testResults.filter(t => t.status === 'failed').length,
      skipped: this.testResults.filter(t => t.status === 'skipped').length,
      timedOut: this.testResults.filter(t => t.status === 'timedOut').length,
      duration: totalDuration,
    };

    // Create full report
    const fullReport: FullTestReport = {
      summary,
      testCases: this.testResults,
      timestamp: new Date().toISOString(),
      testSuite: 'EHR Bridge Patient API Tests',
    };

    // Generate JSON report
    this.generateJSONReport(fullReport);

    // Generate Text report
    this.generateTextReport(fullReport);

    // Generate HTML report
    this.generateHTMLReport(fullReport);
  }

  private generateJSONReport(report: FullTestReport) {
    const jsonFilePath = path.join(this.outputDir, 'test-report.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\n📄 JSON Report generated: ${jsonFilePath}`);
  }

  private generateTextReport(report: FullTestReport) {
    const textFilePath = path.join(this.outputDir, 'test-report.txt');
    let textContent = '';

    // Header
    textContent += '='.repeat(80) + '\n';
    textContent += `  ${report.testSuite}\n`;
    textContent += `  Test Execution Report\n`;
    textContent += '='.repeat(80) + '\n\n';

    // Timestamp
    textContent += `Execution Date: ${new Date(report.timestamp).toLocaleString()}\n`;
    textContent += `Total Duration: ${(report.summary.duration / 1000).toFixed(2)} seconds\n\n`;

    // Summary Section
    textContent += '-'.repeat(80) + '\n';
    textContent += '  TEST SUMMARY\n';
    textContent += '-'.repeat(80) + '\n';
    textContent += `Total Tests:     ${report.summary.total}\n`;
    textContent += `Passed:          ${report.summary.passed} ✅\n`;
    textContent += `Failed:          ${report.summary.failed} ❌\n`;
    textContent += `Skipped:         ${report.summary.skipped} ⏭️\n`;
    textContent += `Timed Out:       ${report.summary.timedOut} ⏱️\n`;
    const successRate = report.summary.total > 0 
      ? ((report.summary.passed / report.summary.total) * 100).toFixed(2)
      : '0.00';
    textContent += `Success Rate:    ${successRate}%\n\n`;

    // Test Cases Section
    textContent += '-'.repeat(80) + '\n';
    textContent += '  TEST CASES DETAILS\n';
    textContent += '-'.repeat(80) + '\n\n';

    // Group by suite
    const testsBySuite = report.testCases.reduce((acc, test) => {
      if (!acc[test.suite]) {
        acc[test.suite] = [];
      }
      acc[test.suite].push(test);
      return acc;
    }, {} as Record<string, TestReport[]>);

    Object.entries(testsBySuite).forEach(([suiteName, tests]) => {
      textContent += `\nSuite: ${suiteName}\n`;
      textContent += '-'.repeat(80) + '\n';

      tests.forEach((test, index) => {
        const statusIcon = test.status === 'passed' ? '✅' : 
                          test.status === 'failed' ? '❌' : 
                          test.status === 'skipped' ? '⏭️' : '⏱️';
        
        textContent += `\n${index + 1}. ${test.testCase}\n`;
        textContent += `   Status:   ${statusIcon} ${test.status.toUpperCase()}\n`;
        textContent += `   Duration: ${(test.duration / 1000).toFixed(2)}s\n`;
        
        if (test.error) {
          textContent += `   Error:    ${test.error}\n`;
        }
      });
      textContent += '\n';
    });

    // Failed Tests Summary
    const failedTests = report.testCases.filter(t => t.status === 'failed');
    if (failedTests.length > 0) {
      textContent += '-'.repeat(80) + '\n';
      textContent += '  FAILED TESTS SUMMARY\n';
      textContent += '-'.repeat(80) + '\n';
      failedTests.forEach((test, index) => {
        textContent += `\n${index + 1}. ${test.testCase} [${test.suite}]\n`;
        if (test.error) {
          textContent += `   Error: ${test.error}\n`;
        }
      });
      textContent += '\n';
    }

    // Footer
    textContent += '='.repeat(80) + '\n';
    textContent += `Report Generated: ${new Date().toLocaleString()}\n`;
    textContent += '='.repeat(80) + '\n';

    fs.writeFileSync(textFilePath, textContent, 'utf-8');
    console.log(`📄 Text Report generated: ${textFilePath}`);
  }

  private generateHTMLReport(report: FullTestReport) {
    const htmlFilePath = path.join(this.outputDir, 'test-report.html');
    
    // Group tests by suite
    const testsBySuite = report.testCases.reduce((acc, test) => {
      if (!acc[test.suite]) {
        acc[test.suite] = [];
      }
      acc[test.suite].push(test);
      return acc;
    }, {} as Record<string, TestReport[]>);

    const successRate = report.summary.total > 0 
      ? ((report.summary.passed / report.summary.total) * 100).toFixed(2)
      : '0.00';

    // Generate HTML content
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.testSuite} - Test Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        .header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        .timestamp {
            margin-top: 15px;
            font-size: 0.9em;
            opacity: 0.8;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .summary-card:hover {
            transform: translateY(-2px);
        }
        .summary-card h3 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 600;
        }
        .summary-card.total h3 { color: #667eea; }
        .summary-card.passed h3 { color: #28a745; }
        .summary-card.failed h3 { color: #dc3545; }
        .summary-card.skipped h3 { color: #ffc107; }
        .summary-card.timedout h3 { color: #fd7e14; }
        .summary-card.success-rate h3 { color: #17a2b8; }
        .summary-card p {
            color: #666;
            font-size: 1em;
            font-weight: 500;
        }
        .content {
            padding: 30px;
        }
        .suite-section {
            margin-bottom: 40px;
            background: #f8f9fa;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e9ecef;
        }
        .suite-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            font-size: 1.3em;
            font-weight: 600;
        }
        .test-list {
            padding: 0;
        }
        .test-item {
            background: white;
            border-bottom: 1px solid #e9ecef;
            padding: 20px;
            transition: background 0.2s;
        }
        .test-item:hover {
            background: #f8f9fa;
        }
        .test-item:last-child {
            border-bottom: none;
        }
        .test-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .test-name {
            font-size: 1.1em;
            font-weight: 600;
            color: #333;
        }
        .test-status {
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9em;
            text-transform: uppercase;
        }
        .test-status.passed {
            background: #d4edda;
            color: #155724;
        }
        .test-status.failed {
            background: #f8d7da;
            color: #721c24;
        }
        .test-status.skipped {
            background: #fff3cd;
            color: #856404;
        }
        .test-status.timedOut {
            background: #ffeaa7;
            color: #b8860b;
        }
        .test-details {
            display: flex;
            gap: 20px;
            margin-top: 10px;
            font-size: 0.9em;
            color: #666;
        }
        .test-duration {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .test-error {
            margin-top: 15px;
            padding: 15px;
            background: #f8d7da;
            border-left: 4px solid #dc3545;
            border-radius: 4px;
            color: #721c24;
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            white-space: pre-wrap;
            word-break: break-word;
        }
        .failed-tests-section {
            margin-top: 40px;
            background: #fff3cd;
            border-radius: 8px;
            padding: 30px;
            border: 2px solid #ffc107;
        }
        .failed-tests-section h2 {
            color: #856404;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        .failed-test-item {
            background: white;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 6px;
            border-left: 4px solid #dc3545;
        }
        .failed-test-item:last-child {
            margin-bottom: 0;
        }
        .footer {
            background: #343a40;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 0.9em;
        }
        .icon {
            font-size: 1.2em;
            margin-right: 5px;
        }
        @media (max-width: 768px) {
            .summary {
                grid-template-columns: repeat(2, 1fr);
            }
            .test-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${report.testSuite}</h1>
            <p>Test Execution Report</p>
            <div class="timestamp">Generated: ${new Date(report.timestamp).toLocaleString()}</div>
        </div>

        <div class="summary">
            <div class="summary-card total">
                <h3>${report.summary.total}</h3>
                <p>Total Tests</p>
            </div>
            <div class="summary-card passed">
                <h3>${report.summary.passed}</h3>
                <p>✅ Passed</p>
            </div>
            <div class="summary-card failed">
                <h3>${report.summary.failed}</h3>
                <p>❌ Failed</p>
            </div>
            <div class="summary-card skipped">
                <h3>${report.summary.skipped}</h3>
                <p>⏭️ Skipped</p>
            </div>
            <div class="summary-card timedout">
                <h3>${report.summary.timedOut}</h3>
                <p>⏱️ Timed Out</p>
            </div>
            <div class="summary-card success-rate">
                <h3>${successRate}%</h3>
                <p>Success Rate</p>
            </div>
        </div>

        <div class="content">
            ${Object.entries(testsBySuite).map(([suiteName, tests]) => `
                <div class="suite-section">
                    <div class="suite-header">${this.escapeHtml(suiteName)}</div>
                    <div class="test-list">
                        ${tests.map((test, index) => `
                            <div class="test-item">
                                <div class="test-header">
                                    <div class="test-name">${index + 1}. ${this.escapeHtml(test.testCase)}</div>
                                    <div class="test-status ${test.status}">
                                        ${test.status === 'passed' ? '✅ PASSED' : 
                                          test.status === 'failed' ? '❌ FAILED' : 
                                          test.status === 'skipped' ? '⏭️ SKIPPED' : '⏱️ TIMED OUT'}
                                    </div>
                                </div>
                                <div class="test-details">
                                    <div class="test-duration">
                                        <span class="icon">⏱️</span>
                                        <span>Duration: ${(test.duration / 1000).toFixed(2)}s</span>
                                    </div>
                                </div>
                                ${test.error ? `<div class="test-error">${this.escapeHtml(test.error)}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}

            ${report.summary.failed > 0 ? `
                <div class="failed-tests-section">
                    <h2>❌ Failed Tests Summary</h2>
                    ${report.testCases.filter(t => t.status === 'failed').map((test, index) => `
                        <div class="failed-test-item">
                            <strong>${index + 1}. ${this.escapeHtml(test.testCase)}</strong>
                            <div style="margin-top: 8px; color: #666; font-size: 0.9em;">
                                Suite: ${this.escapeHtml(test.suite)}
                            </div>
                            ${test.error ? `<div class="test-error" style="margin-top: 10px;">${this.escapeHtml(test.error)}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>

        <div class="footer">
            <p>Report Generated by Playwright Custom Reporter</p>
            <p style="margin-top: 5px; opacity: 0.8;">Total Duration: ${(report.summary.duration / 1000).toFixed(2)} seconds</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
    console.log(`📄 HTML Report generated: ${htmlFilePath}`);
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

export default CustomReporter;

