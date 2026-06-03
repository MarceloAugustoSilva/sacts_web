const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nome do motorista é obrigatório"],
      trim: true,
      minlength: [3, "Nome deve ter pelo menos 3 caracteres"]
    },
    cnh: {
      type: String,
      required: [true, "CNH é obrigatória"],
      trim: true,
      unique: true,
      minlength: [5, "CNH inválida"]
    },
    phone: {
      type: String,
      required: [true, "Telefone é obrigatório"],
      trim: true,
      minlength: [8, "Telefone inválido"]
    },
    status: {
      type: String,
      enum: ["ativo", "inativo"],
      default: "ativo"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Driver || mongoose.model("Driver", driverSchema);
