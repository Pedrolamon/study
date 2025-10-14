import mongoose, { Document, Schema } from 'mongoose';
import type { StudyMaterial } from '../types';

export interface StudyMaterialDocument extends StudyMaterial, Document {}

const studyMaterialSchema = new Schema<StudyMaterialDocument>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  fileName: { 
    type: String, 
    required: true 
  },
  originalName: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number, 
    required: true,
    min: [1, 'File size must be at least 1 byte']
  },
  mimeType: { 
    type: String, 
    required: true 
  },
  filePath: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: [100, 'Category cannot be more than 100 characters']
  },
  tags: [{ 
    type: String, 
    trim: true 
  }],
  isPublic: { 
    type: Boolean, 
    default: false 
  },
  downloadCount: { 
    type: Number, 
    default: 0,
    min: [0, 'Download count cannot be negative']
  }
}, { 
  timestamps: true,
  toJSON: { 
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Índices para performance
studyMaterialSchema.index({ userId: 1, category: 1 });
studyMaterialSchema.index({ userId: 1, isPublic: 1 });
studyMaterialSchema.index({ tags: 1 });
studyMaterialSchema.index({ downloadCount: -1 });

// Virtual para calcular tamanho em formato legível
studyMaterialSchema.virtual('fileSizeFormatted').get(function() {
  const bytes = this.fileSize;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Método para incrementar contador de downloads
studyMaterialSchema.methods.incrementDownloadCount = function(): Promise<void> {
  this.downloadCount += 1;
  return this.save();
};

// Método para verificar se arquivo é uma imagem
studyMaterialSchema.methods.isImage = function(): boolean {
  return this.mimeType.startsWith('image/');
};

// Método para verificar se arquivo é um PDF
studyMaterialSchema.methods.isPDF = function(): boolean {
  return this.mimeType === 'application/pdf';
};

export const StudyMaterialModel = mongoose.model<StudyMaterialDocument>('StudyMaterial', studyMaterialSchema); 