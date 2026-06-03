function errorHandler(error, req, res, next) {
  let status = error.statusCode || 500;
  let message = error.message || "Erro interno no servidor";

  if (error.name === "ValidationError") {
    status = 400;
    message = Object.values(error.errors).map(item => item.message).join(". ");
  }

  if (error.code === 11000) {
    status = 409;
    const field = Object.keys(error.keyPattern || {})[0] || "campo";
    message = `Já existe um registro com este ${field}`;
  }

  if (error.name === "CastError") {
    status = 400;
    message = "ID inválido";
  }

  res.status(status).json({ message });
}

module.exports = errorHandler;
