/*import { Request, Response } from 'express';
import { StudyMaterialModel } from '../models/StudyMaterial';
import { ApiResponse, PaginatedResponse } from '../types';
import { GamificationService } from '../services/gamificationService';
import fs from 'fs/promises';
import path from 'path';

export const uploadStudyMaterial = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const { title, description, category, tags, isPublic } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo é obrigatório'
      });
    }

    // Validar tamanho do arquivo (máximo 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      // Deletar arquivo se for muito grande
      await fs.unlink(file.path);
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo: 50MB'
      });
    }

    // Validar tipos de arquivo permitidos
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      await fs.unlink(file.path);
      return res.status(400).json({
        success: false,
        message: 'Tipo de arquivo não permitido'
      });
    }

    const studyMaterial = new StudyMaterialModel({
      userId,
      title,
      description: description || '',
      fileName: file.filename,
      originalName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      filePath: file.path,
      category,
      tags: tags ? JSON.parse(tags) : [],
      isPublic: isPublic === 'true'
    });

    await studyMaterial.save();

    // Award points for material upload
    await GamificationService.awardMaterialPoints(userId, studyMaterial);

    res.status(201).json({
      success: true,
      data: studyMaterial,
      message: 'Material de estudo enviado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao fazer upload do material:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getStudyMaterials = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const category = req.query.category as string;
    const isPublic = req.query.isPublic !== undefined ? req.query.isPublic === 'true' : undefined;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;
    const query: any = { userId };

    if (category) query.category = category;
    if (isPublic !== undefined) query.isPublic = isPublic;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const [materials, total] = await Promise.all([
      StudyMaterialModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      StudyMaterialModel.countDocuments(query)
    ]);

    const result: PaginatedResponse = {
      data: materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.json({
      success: true,
      data: result,
      message: 'Materiais de estudo recuperados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar materiais de estudo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getStudyMaterialById = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const { materialId } = req.params;

    const material = await StudyMaterialModel.findOne({ _id: materialId, userId });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material de estudo não encontrado'
      });
    }

    res.json({
      success: true,
      data: material,
      message: 'Material de estudo recuperado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar material de estudo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const updateStudyMaterial = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const { materialId } = req.params;
    const { title, description, category, tags, isPublic } = req.body;

    const material = await StudyMaterialModel.findOne({ _id: materialId, userId });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material de estudo não encontrado'
      });
    }

    if (title !== undefined) material.title = title;
    if (description !== undefined) material.description = description;
    if (category !== undefined) material.category = category;
    if (tags !== undefined) material.tags = JSON.parse(tags);
    if (isPublic !== undefined) material.isPublic = isPublic;

    await material.save();

    res.json({
      success: true,
      data: material,
      message: 'Material de estudo atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar material de estudo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const deleteStudyMaterial = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;
    const { materialId } = req.params;

    const material = await StudyMaterialModel.findOne({ _id: materialId, userId });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material de estudo não encontrado'
      });
    }

    // Deletar arquivo físico
    try {
      await fs.unlink(material.filePath);
    } catch (fileError) {
      console.error('Erro ao deletar arquivo físico:', fileError);
    }

    await StudyMaterialModel.findByIdAndDelete(materialId);

    res.json({
      success: true,
      message: 'Material de estudo deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar material de estudo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const downloadStudyMaterial = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { materialId } = req.params;

    const material = await StudyMaterialModel.findOne({ _id: materialId, userId });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material de estudo não encontrado'
      });
    }

    // Verificar se arquivo existe
    try {
      await fs.access(material.filePath);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado no servidor'
      });
    }

    // Incrementar contador de downloads
    await material.incrementDownloadCount();

    // Enviar arquivo
    res.download(material.filePath, material.originalName);
  } catch (error) {
    console.error('Erro ao fazer download do material:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const getStudyMaterialStats = async (req: Request, res: Response<ApiResponse>) => {
  try {
    const userId = req.user!.id;

    const [total, publicCount, totalSize, byCategory, byMimeType] = await Promise.all([
      StudyMaterialModel.countDocuments({ userId }),
      StudyMaterialModel.countDocuments({ userId, isPublic: true }),
      StudyMaterialModel.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
      ]),
      StudyMaterialModel.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      StudyMaterialModel.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: '$mimeType', count: { $sum: 1 } } }
      ])
    ]);

    const stats = {
      total,
      publicCount,
      totalSize: totalSize[0]?.totalSize || 0,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      byMimeType: byMimeType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>)
    };

    res.json({
      success: true,
      data: stats,
      message: 'Estatísticas de materiais de estudo recuperadas'
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de materiais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}; */