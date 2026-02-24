// server/src/controllers/student.controller.js

const { listMyCourses, listCourseGuides } = require('../services/student.service');

async function getMyCourses(req, res, next) {
  try {
    const studentId = req.user?.id;
    const courses = await listMyCourses({ studentId });
    return res.json({ courses });
  } catch (err) { next(err); }
}

async function getCourseGuides(req, res, next) {
  try {
    const studentId = req.user?.id;
    const { courseId } = req.params;
    const guides = await listCourseGuides({ studentId, courseId });
    return res.json({ guides });
  } catch (err) { next(err); }
}

module.exports = { getMyCourses, getCourseGuides };