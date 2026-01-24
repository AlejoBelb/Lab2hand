const {
  listPendingTeachers,
  approveTeacher,
} = require('../services/admin.service');

/* ======================================================
   GET /api/admin/pending-teachers
====================================================== */
async function getPendingTeachers(req, res, next) {
  try {
    const teachers = await listPendingTeachers();
    res.json({ teachers });
  } catch (err) {
    next(err);
  }
}

/* ======================================================
   POST /api/admin/approve-teacher
====================================================== */
async function approveTeacherController(req, res, next) {
  try {
    const { userId, institutionId } = req.body;

    if (!userId || !institutionId) {
      return res.status(400).json({
        message: 'userId e institutionId son obligatorios',
      });
    }

    const user = await approveTeacher({ userId, institutionId });

    res.json({
      message: 'Docente aprobado correctamente',
      user,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPendingTeachers,
  approveTeacherController,
};
