export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  // Don't crash the server - always respond
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  let message = err.message || 'An unexpected error occurred';

  // Handle Sequelize errors gracefully
  if (err.name === 'SequelizeDatabaseError') {
    message = 'Database error occurred. Please try again.';
    console.error('Database Error:', err.message);
  } else if (err.name === 'SequelizeValidationError') {
    message = 'Validation error: ' + err.errors.map(e => e.message).join(', ');
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    message = 'Cannot perform this operation due to related data constraints.';
    console.error('Foreign Key Error:', err.message);
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    message = 'This record already exists.';
  }

  // Log error for debugging (skip logging for expected 404s and 401s to reduce noise)
  if (statusCode !== 404 && statusCode !== 401) {
    console.error('Error:', {
      message: err.message || message,
      statusCode,
      path: req.path,
      method: req.method,
      name: err.name,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  } else if (process.env.NODE_ENV === 'development') {
    // Only log 404/401 in development mode, and only once per unique path
    console.log(`[${statusCode}] ${req.method} ${req.path} - ${message}`);
  }

  // Always send a response - never crash
  try {
    res.status(statusCode).json({
      status: status,
      message: message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        originalError: err.message 
      })
    });
  } catch (responseError) {
    // If response already sent, just log
    console.error('Error sending error response:', responseError);
  }
};

