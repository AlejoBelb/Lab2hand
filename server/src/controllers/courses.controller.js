// server/src/controllers/courses.controller.js

const {
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  addTeacher,
  removeTeacher,
  addStudent,
  removeStudent,
  addExperiment,
  removeExperiment,
} = require('../services/courses.service');

// ── Cursos ────────────────────────────────────────────────────────────────────

async function getCourses(req, res, next) {
  try {
    const { page, pageSize, status, search, sort, order, institutionId } = req.query;
    const result = await listCourses({ institutionId, page, pageSize, status, search, sort, order });
    return res.json(result);
  } catch (err) { next(err); }
}

async function getCourse(req, res, next) {
  try {
    const course = await getCourseById(req.params.id);
    return res.json({ course });
  } catch (err) { next(err); }
}

async function postCourse(req, res, next) {
  try {
    const { name, grade, group, academicYear, startsAt, endsAt, institutionId } = req.body;
    if (!institutionId) {
      return res.status(400).json({ message: 'institutionId es obligatorio' });
    }
    const course = await createCourse({ institutionId, name, grade, group, academicYear, startsAt, endsAt });
    return res.status(201).json({ course });
  } catch (err) { next(err); }
}

async function patchCourse(req, res, next) {
  try {
    const { name, grade, group, academicYear, startsAt, endsAt, status } = req.body;
    const course = await updateCourse(req.params.id, {
      name, grade, group, academicYear, startsAt, endsAt, status,
    });
    return res.json({ course });
  } catch (err) { next(err); }
}

// ── Docentes del curso ────────────────────────────────────────────────────────

async function postTeacher(req, res, next) {
  try {
    const { teacherId, role } = req.body;
    if (!teacherId) return res.status(400).json({ message: 'teacherId es obligatorio' });
    const result = await addTeacher(req.params.id, { teacherId, role });
    return res.status(201).json(result);
  } catch (err) { next(err); }
}

async function deleteTeacher(req, res, next) {
  try {
    await removeTeacher(req.params.id, req.params.teacherId);
    return res.json({ message: 'Docente removido del curso' });
  } catch (err) { next(err); }
}

// ── Estudiantes del curso ─────────────────────────────────────────────────────

async function postStudent(req, res, next) {
  try {
    const { studentId } = req.body;
    if (!studentId) return res.status(400).json({ message: 'studentId es obligatorio' });
    const result = await addStudent(req.params.id, { studentId });
    return res.status(201).json(result);
  } catch (err) { next(err); }
}

async function deleteStudent(req, res, next) {
  try {
    await removeStudent(req.params.id, req.params.studentId);
    return res.json({ message: 'Estudiante removido del curso' });
  } catch (err) { next(err); }
}

// ── Experimentos del curso ────────────────────────────────────────────────────

async function postExperiment(req, res, next) {
  try {
    const { experimentId } = req.body;
    if (!experimentId) return res.status(400).json({ message: 'experimentId es obligatorio' });
    const result = await addExperiment(req.params.id, experimentId);
    return res.status(201).json(result);
  } catch (err) { next(err); }
}

async function deleteExperiment(req, res, next) {
  try {
    await removeExperiment(req.params.id, req.params.experimentId);
    return res.json({ message: 'Experimento removido del curso' });
  } catch (err) { next(err); }
}

module.exports = {
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
};
