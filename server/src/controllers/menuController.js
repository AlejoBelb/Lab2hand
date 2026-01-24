// Controlador del menú de experimentos

const { getMenu } = require('../services/menu.service');

async function menuHandler(req, res, next) {
  try {
    const data = await getMenu();
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getMenu: menuHandler };
