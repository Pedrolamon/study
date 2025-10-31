import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse, PaginatedResponse } from '../types';
import { GamificationService } from '../services/gamificationService';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

type StudyMaterial = Awaited<ReturnType<typeof prisma.studyMaterial.create>>;

interface StudyMaterialsQuery {
  page?: string; // Query parameters are always strings or arrays of strings
  limit?: string;
  category?: string;
  isPublic?: string;
  search?: string;
}

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

    const studyMaterial = await prisma.studyMaterial.create({
      data: {
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
  }});

    // Award points for material upload
    await GamificationService.awardMaterialPoints(studyMaterial as any);

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

export const getStudyMaterials = async (req: Request<{}, {}, {}, StudyMaterialsQuery>, res: Response<ApiResponse>) => {
  try {
      const userId = req.user!.id;
      const { page: pageQuery, limit: limitQuery, category, isPublic: isPublicQuery, search } = req.query;
      const page = parseInt(pageQuery || '') || 1;
      const limit = parseInt(limitQuery || '') || 20;
      const isPublic = isPublicQuery !== undefined ? isPublicQuery === 'true' : undefined;

    const skip = (page - 1) * limit;
    const where: any = { userId };

    if (category) where.category = category;
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [materials, total] = await Promise.all([
      prisma.studyMaterial.findMany({
        where: where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: skip,
        take: limit,
      }),
      prisma.studyMaterial.count({ where }),
    ]);

    const result: PaginatedResponse<StudyMaterial> = {
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

    if (!materialId) {
      return res.status(400).json({
          success: false,
          message: 'ID do material é obrigatório'
      });
  }

    const material = await prisma.studyMaterial.findFirst({
      where: {
        id: materialId, // Assumindo que o campo ID é 'id'
        userId,
      },
    });

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

    if (!materialId) {
      return res.status(400).json({
          success: false,
          message: 'ID do material é obrigatório'
      });
  }
    const materialCheck = await prisma.studyMaterial.findFirst({
      where: { id: materialId, userId },
      select: { id: true }
    });

    if (!materialCheck) {
      return res.status(404).json({
        success: false,
        message: 'Material de estudo não encontrado'
      });
    }

    const material = await prisma.studyMaterial.update({
      where: {
        id: materialId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags: JSON.parse(tags) }), // Depende do tipo de tags
        ...(isPublic !== undefined && { isPublic }),
      },
    });

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

    if (!materialId) {
      return res.status(400).json({
          success: false,
          message: 'ID do material é obrigatório'
      });
  }

    const material = await prisma.studyMaterial.findFirst({
      where: { id: materialId, userId },
    });

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

    await prisma.studyMaterial.delete({
      where: {
        id: materialId, // Deleta pelo ID
      },
    });

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

    if (!materialId) {
      return res.status(400).json({
          success: false,
          message: 'ID do material é obrigatório'
      });
  }
    const material = await prisma.studyMaterial.findFirst({
      where: { id: materialId, userId },
    });

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
    await prisma.studyMaterial.update({
      where: { id: materialId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

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

    // 💡 Contagens e Soma com prisma.aggregate()
    const [total, publicCount, totalSizeResult, byCategory, byMimeType] = await Promise.all([
      prisma.studyMaterial.count({ where: { userId } }),
      prisma.studyMaterial.count({ where: { userId, isPublic: true } }),
      prisma.studyMaterial.aggregate({
        _sum: {
          fileSize: true,
        },
        where: { userId },
      }),
      prisma.studyMaterial.groupBy({
        by: ['category'],
        _count: {
          category: true,
        },
        where: { userId },
      }),
      prisma.studyMaterial.groupBy({
        by: ['mimeType'],
        _count: {
          mimeType: true,
        },
        where: { userId },
      }),
    ]);
  
    const byCategoryFormatted = byCategory.reduce((acc, item) => {
      acc[item.category] = item._count.category;
      return acc;
    }, {} as Record<string, number>);

    const byMimeTypeFormatted = byMimeType.reduce((acc, item) => {
      acc[item.mimeType] = item._count.mimeType;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      total,
      publicCount,
      totalSize: totalSizeResult._sum.fileSize || 0,
      byCategory: byCategoryFormatted,
      byMimeType: byMimeTypeFormatted,
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
};