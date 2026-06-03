const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nome do paciente é obrigatório"],
      trim: true,
      minlength: [3, "Nome deve ter pelo menos 3 caracteres"]
    },
    sus: {
      type: String,
      required: [true, "Cartão SUS é obrigatório"],
      trim: true,
      unique: true,
      minlength: [6, "Cartão SUS inválido"]
    },
    phone: {
      type: String,
      required: [true, "Telefone é obrigatório"],
      trim: true,
      minlength: [8, "Telefone inválido"]
    },
    city: {
      type: String,
      required: [true, "Cidade é obrigatória"],
      trim: true
    },
    status: {
      type: String,
      enum: ["ativo", "inativo"],
      default: "ativo"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Patient || mongoose.model("Patient", patientSchema);
