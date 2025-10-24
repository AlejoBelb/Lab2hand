// server/src/controllers/echo.controller.js

// Controlador que responde con los datos ya validados y saneados
function echo(req, res) {
  return res.status(200).json({
    ok: true,
    data: {
      body: req.body,
      query: req.query,
      params: req.params
    }
  });
}

module.exports = { echo };
