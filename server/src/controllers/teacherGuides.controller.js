// server/src/controllers/teacherGuides.controller.js

const path = require('path');
const {
  listMyGuides,
  getGuideById,
  createGuide,
  updateGuide,
  publishGuide,
  unpublishGuide,
  deleteGuide,
  listMyCourses,
  upsertDraftGuide,
} = require('../services/teacherGuides.service');

function getTeacherId(req) { return req.user?.id; }

async function getMyGuides(req, res, next) {
  try {
    const teacherId = getTeacherId(req);
    const { courseId } = req.query;
    const guides = await listMyGuides({ teacherId, courseId });
    return res.json({ guides });
  } catch (err) { next(err); }
}

async function getMyCourses(req, res, next) {
  try {
    const teacherId = getTeacherId(req);
    const courses = await listMyCourses({ teacherId });
    return res.json({ courses });
  } catch (err) { next(err); }
}

async function getGuide(req, res, next) {
  try {
    const teacherId = getTeacherId(req);
    const guide = await getGuideById({ guideId: req.params.id, teacherId });
    return res.json({ guide });
  } catch (err) { next(err); }
}

async function postGuide(req, res, next) {
  try {
    const teacherId = getTeacherId(req);

    if (!req.file) {
      return res.status(400).json({ message: 'El PDF es obligatorio' });
    }

    const { courseId, experimentId, title, description } = req.body;

    if (!courseId || !experimentId || !title) {
      return res.status(400).json({ message: 'courseId, experimentId y title son obligatorios' });
    }

    const fileUrl = `uploads/guides/${req.file.filename}`;

    const guide = await createGuide({
      teacherId, courseId, experimentId,
      title, description, fileUrl,
    });

    return res.status(201).json({ guide });
  } catch (err) { next(err); }
}

async function patchGuide(req, res, next) {
  try {
    const teacherId = getTeacherId(req);
    const { title, description } = req.body;

    const fileUrl = req.file
      ? `uploads/guides/${req.file.filename}`
      : undefined;

    const guide = await updateGuide({
      guideId: req.params.id,
      teacherId, title, description, fileUrl,
    });

    return res.json({ guide });
  } catch (err) { next(err); }
}

async function postPublish(req, res, next) {
  try {
    const teacherId = getTeacherId(req);
    const guide = await publishGuide({ guideId: req.params.id, teacherId });
    return res.json({ message: 'Guía publicada', guide });
  } catch (err) { next(err); }
}

async function postUnpublish(req, res, next) {
  try {
    const teacherId = getTeacherId(req);
    const guide = await unpublishGuide({ guideId: req.params.id, teacherId });
    return res.json({ message: 'Guía despublicada', guide });
  } catch (err) { next(err); }
}

async function deleteGuideController(req, res, next) {
  try {
    const teacherId = getTeacherId(req);
    await deleteGuide({ guideId: req.params.id, teacherId });
    return res.json({ message: 'Guía eliminada' });
  } catch (err) { next(err); }
}

// Compatibilidad con endpoint anterior
async function saveDraft(req, res) {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) return res.status(401).json({ status: 'error', message: 'No autenticado' });
    const result = await upsertDraftGuide({ teacherId, payload: req.body });
    return res.status(200).json({ status: 'ok', ...result });
  } catch (err) {
    return res.status(err.status || 500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  getMyGuides,
  getMyCourses,
  getGuide,
  postGuide,
  patchGuide,
  postPublish,
  postUnpublish,
  deleteGuideController,
  saveDraft,
};