// server/src/controllers/users.controller.js

const { listUsers, getUserById, updateUser } = require('../services/users.service');

// GET /api/users
async function getUsers(req, res, next) {
  try {
    const { page, pageSize, role, isActive, search, sort, order } = req.query;
    const result = await listUsers({ page, pageSize, role, isActive, search, sort, order });
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

// GET /api/users/:id
async function getUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'NotFound', message: 'Usuario no encontrado' });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
}

// PATCH /api/users/:id
async function patchUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await updateUser(id, req.body || {});
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getUsers,
  getUser,
  patchUser
};
