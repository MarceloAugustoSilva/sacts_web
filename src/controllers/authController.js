const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
}

function sendAuth(res, user, status = 200) {
  const token = signToken(user);
  res.status(status).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Preencha nome, e-mail e senha" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Senha deve ter pelo menos 6 caracteres" });
    }

    const exists = await User.findOne({ email: String(email).toLowerCase().trim() });

    if (exists) {
      return res.status(409).json({ message: "E-mail já cadastrado" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    sendAuth(res, user, 201);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Informe e-mail e senha" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    sendAuth(res, user);
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
