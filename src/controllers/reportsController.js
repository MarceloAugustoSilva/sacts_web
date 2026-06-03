// Controller responsável pelos relatórios gerenciais do SACTS.
// Ele agrega dados dos agendamentos e devolve indicadores prontos
// para o front-end exibir em cards e gráficos simples.

const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Driver = require("../models/Driver");
const Vehicle = require("../models/Vehicle");

// Lista de status válidos (precisa bater com o enum do model Appointment).
const STATUS = ["agendado", "em_andamento", "concluido", "cancelado"];

async function summary(req, res, next) {
  try {
    // Buscamos os agendamentos já com paciente/motorista/veículo "populados"
    // para podermos contar e agrupar sem precisar de várias queries.
    const appointments = await Appointment.find()
      .populate("patient", "name")
      .populate("driver", "name")
      .populate("vehicle", "plate model");

    // Contagem por status.
    const byStatus = STATUS.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
    let totalKm = 0;
    // Sets para contar quantos pacientes/motoristas/veículos diferentes participaram.
    const patientsTransported = new Set();
    // Mapas para contar viagens por motorista e por veículo.
    const tripsByDriver = new Map();
    const tripsByVehicle = new Map();

    for (const a of appointments) {
      if (byStatus[a.status] !== undefined) byStatus[a.status] += 1;
      totalKm += Number(a.km) || 0;

      if (a.patient?._id) patientsTransported.add(String(a.patient._id));

      if (a.driver?._id) {
        const key = String(a.driver._id);
        const current = tripsByDriver.get(key) || { name: a.driver.name || "-", trips: 0 };
        current.trips += 1;
        tripsByDriver.set(key, current);
      }

      if (a.vehicle?._id) {
        const key = String(a.vehicle._id);
        const label = a.vehicle.plate
          ? `${a.vehicle.plate}${a.vehicle.model ? " - " + a.vehicle.model : ""}`
          : "-";
        const current = tripsByVehicle.get(key) || { name: label, trips: 0 };
        current.trips += 1;
        tripsByVehicle.set(key, current);
      }
    }

    // Convertendo Maps em arrays ordenados (mais ativos primeiro).
    const driversRanking = [...tripsByDriver.values()].sort((a, b) => b.trips - a.trips);
    const vehiclesRanking = [...tripsByVehicle.values()].sort((a, b) => b.trips - a.trips);

    // Totais gerais — usados nos cards numéricos.
    const [totalPatients, totalDrivers, totalVehicles] = await Promise.all([
      Patient.countDocuments(),
      Driver.countDocuments(),
      Vehicle.countDocuments()
    ]);

    res.json({
      totals: {
        appointments: appointments.length,
        patientsTransported: patientsTransported.size,
        totalKm,
        patients: totalPatients,
        drivers: totalDrivers,
        vehicles: totalVehicles
      },
      byStatus,
      driversRanking,
      vehiclesRanking
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { summary };
