function notFound(req, res) {
  res.status(404).json({
    error: "Route not found"
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;
  const message =
    statusCode >= 500 ? "Internal server error" : error.message || "Request failed";

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    error: message
  });
}

module.exports = {
  notFound,
  errorHandler
};
