const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
    this.currentLevel = LOG_LEVELS[this.level] || LOG_LEVELS.INFO;
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  }

  error(message, meta = {}) {
    if (this.currentLevel >= LOG_LEVELS.ERROR) {
      console.error(this.formatMessage('ERROR', message, meta));
    }
  }

  warn(message, meta = {}) {
    if (this.currentLevel >= LOG_LEVELS.WARN) {
      console.warn(this.formatMessage('WARN', message, meta));
    }
  }

  info(message, meta = {}) {
    if (this.currentLevel >= LOG_LEVELS.INFO) {
      console.log(this.formatMessage('INFO', message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this.currentLevel >= LOG_LEVELS.DEBUG) {
      console.log(this.formatMessage('DEBUG', message, meta));
    }
  }
}

const logger = new Logger();
export default logger;