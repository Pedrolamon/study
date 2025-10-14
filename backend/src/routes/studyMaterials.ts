import { Router } from 'express';
import { body, param, query } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { auth } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/errorHandler';
import {
  uploadStudyMaterial,
  getStudyMaterials,
  getStudyMaterialById,
  updateStudyMaterial,
  deleteStudyMaterial,
  downloadStudyMaterial,
  getStudyMaterialStats
} from '../controllers/studyMaterialController';

const router = Router();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || 'uploads';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Todas as rotas requerem autenticação
router.use(auth);

// POST /api/study-materials/upload - Fazer upload de material
router.post('/upload', upload.single('file'), [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Título deve ter entre 1 e 200 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('category')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Categoria deve ter entre 1 e 100 caracteres'),
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags deve ser uma string JSON válida'),
  body('isPublic')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isPublic deve ser true ou false'),
  handleValidationErrors
], uploadStudyMaterial);

// GET /api/study-materials - Listar materiais
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Página deve ser um número inteiro positivo'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('category').optional().trim().isLength({ min: 1 }).withMessage('Categoria não pode estar vazia'),
  query('isPublic').optional().isIn(['true', 'false']).withMessage('isPublic deve ser true ou false'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Busca não pode estar vazia'),
  handleValidationErrors
], getStudyMaterials);

// GET /api/study-materials/stats - Estatísticas de materiais
router.get('/stats', getStudyMaterialStats);

// GET /api/study-materials/:materialId - Buscar material por ID
router.get('/:materialId', [
  param('materialId').isMongoId().withMessage('ID de material inválido'),
  handleValidationErrors
], getStudyMaterialById);

// PUT /api/study-materials/:materialId - Atualizar material
router.put('/:materialId', [
  param('materialId').isMongoId().withMessage('ID de material inválido'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Título deve ter entre 1 e 200 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Categoria deve ter entre 1 e 100 caracteres'),
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags deve ser uma string JSON válida'),
  body('isPublic')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isPublic deve ser true ou false'),
  handleValidationErrors
], updateStudyMaterial);

// DELETE /api/study-materials/:materialId - Deletar material
router.delete('/:materialId', [
  param('materialId').isMongoId().withMessage('ID de material inválido'),
  handleValidationErrors
], deleteStudyMaterial);

// GET /api/study-materials/:materialId/download - Fazer download do material
router.get('/:materialId/download', [
  param('materialId').isMongoId().withMessage('ID de material inválido'),
  handleValidationErrors
], downloadStudyMaterial);

export default router; 