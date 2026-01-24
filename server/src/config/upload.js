// server/src/config/upload.js
// Configuración de Multer para subir imágenes localmente (solo desarrollo)

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Carpeta destino: /uploads/verification-docs
const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'verification-docs');

// Asegurar que la carpeta exista
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Nombre único: timestamp-nombre-original
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

// Filtro simple: solo imágenes
function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpg, jpeg, png)'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;
