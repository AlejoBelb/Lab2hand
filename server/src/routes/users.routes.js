// server/src/routes/users.routes.js

const { Router } = require('express');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { listUsersRules, getUserByIdRules, updateUserRules } = require('../middlewares/validators/users');
const { getUsers, getUser, patchUser } = require('../controllers/users.controller');

const router = Router();

// Todas las rutas de /users requieren ADMIN
router.use(auth, authorize('ADMIN'));

// Listar usuarios con filtros/paginación
router.get('/', validate(listUsersRules), getUsers);

// Obtener usuario por id
router.get('/:id', validate(getUserByIdRules), getUser);

// Actualizar usuario por id
router.patch('/:id', validate(updateUserRules), patchUser);

module.exports = router;
