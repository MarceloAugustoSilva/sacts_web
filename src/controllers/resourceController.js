function pick(body, fields) {
  return fields.reduce((data, field) => {
    if (body[field] !== undefined) data[field] = body[field];
    return data;
  }, {});
}

function buildController(Model, fields, options = {}) {
  const populate = options.populate || "";
  const sort = options.sort || "-createdAt";

  const runQuery = query => {
    if (!populate) return query;
    return query.populate(populate);
  };

  return {
    list: async (req, res, next) => {
      try {
        const search = String(req.query.search || "").trim();
        const filter = options.searchFields && search
          ? { $or: options.searchFields.map(field => ({ [field]: new RegExp(search, "i") })) }
          : {};

        const data = await runQuery(Model.find(filter).sort(sort));
        res.json(data);
      } catch (error) {
        next(error);
      }
    },

    get: async (req, res, next) => {
      try {
        const item = await runQuery(Model.findById(req.params.id));

        if (!item) {
          return res.status(404).json({ message: "Registro não encontrado" });
        }

        res.json(item);
      } catch (error) {
        next(error);
      }
    },

    create: async (req, res, next) => {
      try {
        const data = pick(req.body, fields);
        const item = await Model.create(data);
        const saved = await runQuery(Model.findById(item._id));
        res.status(201).json(saved);
      } catch (error) {
        next(error);
      }
    },

    update: async (req, res, next) => {
      try {
        const data = pick(req.body, fields);
        const item = await Model.findByIdAndUpdate(req.params.id, data, {
          new: true,
          runValidators: true
        });

        if (!item) {
          return res.status(404).json({ message: "Registro não encontrado" });
        }

        const updated = await runQuery(Model.findById(item._id));
        res.json(updated);
      } catch (error) {
        next(error);
      }
    },

    remove: async (req, res, next) => {
      try {
        const item = await Model.findByIdAndDelete(req.params.id);

        if (!item) {
          return res.status(404).json({ message: "Registro não encontrado" });
        }

        res.json({ message: "Registro removido com sucesso" });
      } catch (error) {
        next(error);
      }
    }
  };
}

module.exports = buildController;
