// server/src/routes/courses.routes.js

const { Router } = require('express');
const { requireAuth, requireRole } = require('../middlewares/auth');
const {
  getCourses,
  getCourse,
  postCourse,
  patchCourse,
  postTeacher,
  deleteTeacher,
  postStudent,
  deleteStudent,
  postExperiment,
  deleteExperiment,
} = require('../controllers/courses.controller');

const prisma = require('../config/prisma');

const router = Router();

router.use(requireAuth, requireRole(['ADMIN']));

router.get('/experiments/all', async (req, res, next) => {
  try {
    const experiments = await prisma.experiment.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, slug: true },
      orderBy: { order: 'asc' },
    });
    return res.json({ experiments });
  } catch (err) { next(err); }
});

// ─── Cursos ───────────────────────────────────────────────────────────────
router.get('/',    getCourses);
router.get('/:id', getCourse);
router.post('/',   postCourse);
router.patch('/:id', patchCourse);

// ─── Docentes ─────────────────────────────────────────────────────────────
router.post('/:id/teachers',              postTeacher);
router.delete('/:id/teachers/:teacherId', deleteTeacher);

// ─── Estudiantes ──────────────────────────────────────────────────────────
router.post('/:id/students',              postStudent);
router.delete('/:id/students/:studentId', deleteStudent);

// ─── Experimentos ─────────────────────────────────────────────────────────
router.post('/:id/experiments',                   postExperiment);
router.delete('/:id/experiments/:experimentId',   deleteExperiment);

module.exports = router;