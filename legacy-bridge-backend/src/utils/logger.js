const logger = {
  info: (message, context = {}) => {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        message,
        ...context,
      })
    );
  },
  error: (message, error = null, context = {}) => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        message,
        error_message: error?.message || error,
        stack: error?.stack,
        ...context,
      })
    );
  },
  warn: (message, context = {}) => {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "warn",
        message,
        ...context,
      })
    );
  },
};

module.exports = logger;
