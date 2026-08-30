function errorHandler(error, req, res, next) { if (res.headersSent) return next(error); if (process.env.NODE_ENV !== 'production') console.error(error.message); res.status(error.status || 500).json({ message: error.status ? error.message : 'An unexpected server error occurred.' }); }
module.exports = { errorHandler };
