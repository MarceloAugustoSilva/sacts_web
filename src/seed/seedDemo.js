const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Patient = require("../models/Patient");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");
const Appointment = require("../models/Appointment");

async function seedDemo(force = false) {
  const userCount = await User.countDocuments();
  const patientCount = await Patient.countDocuments();

  if (!force && userCount > 0 && patientCount > 0) {
    return { skipped: true };
  }

  if (force) {
    await Promise.all([
      User.deleteOne({ email: "demo@sacts.com" }),
      Appointment.deleteMany({}),
      Patient.deleteMany({ sus: { $in: ["898001000001", "898001000002", "898001000003"] } }),
      Driver.deleteMany({ cnh: { $in: ["CNH001234", "CNH005678", "CNH009876"] } }),
      Vehicle.deleteMany({ plate: { $in: ["SAC1T23", "AMB2S34", "VAN3T45"] } })
    ]);
  }

  const password = await bcrypt.hash("123456", 10);

  await User.findOneAndUpdate(
    { email: "demo@sacts.com" },
    { name: "Usuário Demo", email: "demo@sacts.com", password, role: "admin" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const patients = await Patient.insertMany(
    [
      { name: "Maria Oliveira", sus: "898001000001", phone: "(15) 99911-2233", city: "Angatuba", status: "ativo" },
      { name: "João Pereira", sus: "898001000002", phone: "(15) 99777-6655", city: "Campina do Monte Alegre", status: "ativo" },
      { name: "Ana Souza", sus: "898001000003", phone: "(15) 99666-4455", city: "Itapetininga", status: "ativo" }
    ],
    { ordered: false }
  ).catch(async () => Patient.find({ sus: { $in: ["898001000001", "898001000002", "898001000003"] } }));

  const drivers = await Driver.insertMany(
    [
      { name: "Carlos Lima", cnh: "CNH001234", phone: "(15) 98888-1111", status: "ativo" },
      { name: "Fernanda Rocha", cnh: "CNH005678", phone: "(15) 97777-2222", status: "ativo" },
      { name: "Rafael Mendes", cnh: "CNH009876", phone: "(15) 96666-3333", status: "ativo" }
    ],
    { ordered: false }
  ).catch(async () => Driver.find({ cnh: { $in: ["CNH001234", "CNH005678", "CNH009876"] } }));

  const vehicles = await Vehicle.insertMany(
    [
      { plate: "SAC1T23", model: "Van Renault Master", capacity: 12, status: "disponivel" },
      { plate: "AMB2S34", model: "Ambulância Fiat Ducato", capacity: 4, status: "disponivel" },
      { plate: "VAN3T45", model: "Van Mercedes Sprinter", capacity: 15, status: "manutencao" }
    ],
    { ordered: false }
  ).catch(async () => Vehicle.find({ plate: { $in: ["SAC1T23", "AMB2S34", "VAN3T45"] } }));

  const existingAppointments = await Appointment.countDocuments();

  if (existingAppointments === 0 && patients.length && drivers.length && vehicles.length) {
    const now = Date.now();

    await Appointment.insertMany([
      {
        patient: patients[0]._id,
        driver: drivers[0]._id,
        vehicle: vehicles[0]._id,
        origin: "UBS Central - Angatuba",
        destination: "Hospital Regional de Itapetininga",
        date: new Date(now + 86400000),
        status: "agendado",
        km: 48,
        notes: "Consulta cardiológica"
      },
      {
        patient: patients[1]._id,
        driver: drivers[1]._id,
        vehicle: vehicles[1]._id,
        origin: "Pronto Atendimento Municipal",
        destination: "AME Sorocaba",
        date: new Date(now + 172800000),
        status: "agendado",
        km: 92,
        notes: "Exame de imagem"
      },
      {
        patient: patients[2]._id,
        driver: drivers[2]._id,
        vehicle: vehicles[0]._id,
        origin: "Residência do paciente",
        destination: "Clínica de Hemodiálise",
        date: new Date(now + 259200000),
        status: "em_andamento",
        km: 35,
        notes: "Paciente necessita acompanhante"
      },
      {
        patient: patients[0]._id,
        driver: drivers[1]._id,
        vehicle: vehicles[1]._id,
        origin: "UBS Central - Angatuba",
        destination: "Hospital das Clínicas - Botucatu",
        date: new Date(now - 86400000),
        status: "concluido",
        km: 140,
        notes: "Retorno cirúrgico"
      },
      {
        patient: patients[1]._id,
        driver: drivers[0]._id,
        vehicle: vehicles[0]._id,
        origin: "Pronto Atendimento Municipal",
        destination: "AME Itapetininga",
        date: new Date(now - 172800000),
        status: "concluido",
        km: 52,
        notes: "Consulta de rotina"
      },
      {
        patient: patients[2]._id,
        driver: drivers[2]._id,
        vehicle: vehicles[1]._id,
        origin: "Residência do paciente",
        destination: "Hospital Regional",
        date: new Date(now - 259200000),
        status: "cancelado",
        km: 0,
        notes: "Paciente desmarcou"
      }
    ]);
  }

  return {
    user: "demo@sacts.com",
    password: "123456",
    patients: await Patient.countDocuments(),
    drivers: await Driver.countDocuments(),
    vehicles: await Vehicle.countDocuments(),
    appointments: await Appointment.countDocuments()
  };
}

module.exports = seedDemo;
