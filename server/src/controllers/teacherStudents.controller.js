// server/src/controllers/teacherStudents.controller.js

const {
  listStudents,
  approveStudent,
  rejectStudent,
  enrollStudentInCourse,
  unenrollStudentFromCourse,
} = require('../services/teacherStudents.service');

function tid(req) { return req.user?.id; }

async function getStudents(req, res, next) {
  try {
    const { status, search } = req.query;
    const students = await listStudents({ teacherId: tid(req), status, search });
    return res.json({ students });
  } catch (err) { next(err); }
}

async function postApprove(req, res, next) {
  try {
    const student = await approveStudent({ teacherId: tid(req), studentId: req.params.id });
    return res.json({ message: 'Estudiante aprobado', student });
  } catch (err) { next(err); }
}

async function postReject(req, res, next) {
  try {
    const student = await rejectStudent({ teacherId: tid(req), studentId: req.params.id });
    return res.json({ message: 'Estudiante rechazado', student });
  } catch (err) { next(err); }
}

async function postEnroll(req, res, next) {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId es obligatorio' });
    const result = await enrollStudentInCourse({
      teacherId: tid(req), studentId: req.params.id, courseId,
    });
    return res.status(201).json(result);
  } catch (err) { next(err); }
}

async function deleteEnroll(req, res, next) {
  try {
    await unenrollStudentFromCourse({
      teacherId: tid(req), studentId: req.params.id, courseId: req.params.courseId,
    });
    return res.json({ message: 'Estudiante removido del curso' });
  } catch (err) { next(err); }
}

module.exports = { getStudents, postApprove, postReject, postEnroll, deleteEnroll };