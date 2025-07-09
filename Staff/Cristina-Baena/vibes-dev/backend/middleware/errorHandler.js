const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  // Custom errors
  if (err.name === 'NotFoundError') {
    error = { message: err.message, statusCode: 404 };
  }

  if (err.name === 'UnauthorizedError') {
    error = { message: err.message, statusCode: 401 };
  }

  if (err.name === 'ValidationError') {
    error = { message: err.message, statusCode: 400 };
  }

  if (err.name === 'ConflictError') {
    error = { message: err.message, statusCode: 409 };
  }

  // Add DuplicityError handling
  if (err.name === 'DuplicityError') {
    error = { message: err.message || 'Resource already exists', statusCode: 409 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

export default errorHandler;