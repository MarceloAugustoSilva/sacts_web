const seedDemo = require("../seed/seedDemo");

exports.seed = async (req, res, next) => {
  try {
    const result = await seedDemo(true);
    res.json({ message: "Dados de demonstração carregados", result });
  } catch (error) {
    next(error);
  }
};
