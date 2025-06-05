import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class Logger implements LoggerService {
  log(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] [INFO] [${context || 'Application'}]: ${message}`,
    );
  }

  error(message: string, trace?: string, context?: string) {
    const timestamp = new Date().toISOString();
    console.error(
      `[${timestamp}] [ERROR] [${context || 'Application'}]: ${message}`,
    );
    if (trace) {
      console.error(`Stack Trace: ${trace}`);
    }
  }

  warn(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    console.warn(
      `[${timestamp}] [WARN] [${context || 'Application'}]: ${message}`,
    );
  }
}
