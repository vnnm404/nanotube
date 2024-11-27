// metrics.ts
import fs from 'fs';
import path from 'path';

interface MetricData {
  timestamp: string;
  operation: string;
  duration: number; // in milliseconds
  success: boolean;
  errorMessage?: string;
}

class Metrics {
  private metrics: MetricData[] = [];
  private logDir: string;

  constructor(logDirectory: string = 'logs') {
    this.logDir = path.join(process.cwd(), logDirectory);
    this.ensureLogDirectory();
    // Schedule periodic log writing every 5 minutes
    setInterval(() => this.writeLogs(), 10);
    // Optionally, write logs on process exit
    process.on('exit', () => this.writeLogsSync());
    process.on('SIGINT', () => {
      this.writeLogsSync();
      process.exit();
    });
    process.on('SIGTERM', () => {
      this.writeLogsSync();
      process.exit();
    });
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  public logOperation(
    operation: string,
    duration: number,
    success: boolean,
    errorMessage?: string
  ) {
    const metric: MetricData = {
      timestamp: new Date().toISOString(),
      operation,
      duration,
      success,
      errorMessage,
    };
    this.metrics.push(metric);
  }

  private async writeLogs() {
    if (this.metrics.length === 0) return;

    const logFilePath = path.join(
      this.logDir,
      `metrics-${new Date().toISOString().split('T')[0]}.log`
    );
    const logData = this.metrics
      .map((m) => JSON.stringify(m))
      .join('\n') + '\n';
    try {
      await fs.promises.appendFile(logFilePath, logData);
      console.log(`Metrics written to ${logFilePath}`);
      this.metrics = []; // Reset metrics after writing
    } catch (error) {
      console.error('Error writing metrics:', error);
    }
  }

  private writeLogsSync() {
    if (this.metrics.length === 0) return;

    const logFilePath = path.join(
      this.logDir,
      `metrics-${new Date().toISOString().split('T')[0]}.log`
    );
    const logData = this.metrics
      .map((m) => JSON.stringify(m))
      .join('\n') + '\n';
    try {
      fs.appendFileSync(logFilePath, logData);
      console.log(`Metrics written to ${logFilePath}`);
      this.metrics = []; // Reset metrics after writing
    } catch (error) {
      console.error('Error writing metrics:', error);
    }
  }

  // Additional methods to compute averages or other aggregated metrics can be added here
}

export default Metrics;
