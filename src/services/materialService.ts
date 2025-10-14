import api from './api';

export interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  fileName: string;
  fileSize: number;
  mimeType: string;
  downloadCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialUploadData {
  file: File;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface MaterialListParams {
  search?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}

export interface MaterialStats {
  totalMaterials: number;
  totalSize: number;
  categoriesCount: number;
  downloadsCount: number;
  recentUploads: number;
}

class MaterialService {
  // List materials with filtering
  async list(params: MaterialListParams = {}): Promise<{ data: Material[]; total: number }> {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.tags && params.tags.length > 0) queryParams.append('tags', params.tags.join(','));
    if (params.isPublic !== undefined) queryParams.append('isPublic', params.isPublic.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await api.get(`/api/study-materials?${queryParams}`);
    return response.data;
  }

  // Upload a new material
  async upload(data: MaterialUploadData): Promise<Material> {
    const formData = new FormData();

    formData.append('file', data.file);
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.tags && data.tags.length > 0) formData.append('tags', data.tags.join(','));
    if (data.isPublic !== undefined) formData.append('isPublic', data.isPublic.toString());

    const response = await api.post('/api/study-materials/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // Get material by ID
  async getById(id: string): Promise<Material> {
    const response = await api.get(`/api/study-materials/${id}`);
    return response.data;
  }

  // Update material metadata
  async update(id: string, data: Partial<Omit<Material, 'id' | 'createdAt' | 'updatedAt' | 'fileName' | 'fileSize' | 'mimeType' | 'downloadCount'>>): Promise<Material> {
    const response = await api.put(`/api/study-materials/${id}`, data);
    return response.data;
  }

  // Delete material
  async remove(id: string): Promise<void> {
    await api.delete(`/api/study-materials/${id}`);
  }

  // Download material
  async download(id: string): Promise<Blob> {
    const response = await api.get(`/api/study-materials/${id}/download`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Try to get filename from response headers
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'download';

    if (contentDisposition) {
      const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (matches && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response.data;
  }

  // Get material statistics
  async getStats(): Promise<MaterialStats> {
    const response = await api.get('/api/study-materials/stats');
    return response.data;
  }

  // Get categories
  async getCategories(): Promise<string[]> {
    const response = await api.get('/api/study-materials/categories');
    return response.data;
  }

  // Search materials
  async search(query: string, category?: string, limit: number = 20): Promise<Material[]> {
    const params = new URLSearchParams({ search: query, limit: limit.toString() });
    if (category) params.append('category', category);

    const response = await api.get(`/api/study-materials/search?${params}`);
    return response.data;
  }

  // Get recent materials
  async getRecent(limit: number = 10): Promise<Material[]> {
    const response = await api.get(`/api/study-materials/recent?limit=${limit}`);
    return response.data;
  }

  // Get popular materials (by download count)
  async getPopular(limit: number = 10): Promise<Material[]> {
    const response = await api.get(`/api/study-materials/popular?limit=${limit}`);
    return response.data;
  }

  // Bulk operations
  async bulkDelete(ids: string[]): Promise<void> {
    await api.post('/api/study-materials/bulk-delete', { ids });
  }

  async bulkUpdateCategory(ids: string[], category: string): Promise<void> {
    await api.post('/api/study-materials/bulk-update-category', { ids, category });
  }

  async bulkUpdateVisibility(ids: string[], isPublic: boolean): Promise<void> {
    await api.post('/api/study-materials/bulk-update-visibility', { ids, isPublic });
  }

  // File validation helpers
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande. Tamanho máximo: 50MB' };
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'audio/mpeg',
      'audio/wav',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
    ];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de arquivo não suportado' };
    }

    return { valid: true };
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file icon based on MIME type
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'music';
    if (mimeType.includes('pdf')) return 'file-text';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'file-text';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'file-text';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'file-text';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
    if (mimeType.startsWith('text/')) return 'file-text';
    return 'file';
  }

  // Get file type category
  getFileCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'Imagem';
    if (mimeType.startsWith('video/')) return 'Vídeo';
    if (mimeType.startsWith('audio/')) return 'Áudio';
    if (mimeType.includes('pdf')) return 'Documento';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Documento';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Planilha';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'Apresentação';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'Arquivo Compactado';
    if (mimeType.startsWith('text/')) return 'Texto';
    return 'Arquivo';
  }

  // Generate preview for supported files
  async generatePreview(material: Material): Promise<string | null> {
    // For images, return the download URL
    if (material.mimeType.startsWith('image/')) {
      try {
        const response = await api.get(`/api/study-materials/${material.id}/preview`);
        return response.data.previewUrl;
      } catch (error) {
        return null;
      }
    }

    // For PDFs and documents, could implement text extraction preview
    // For now, return null for unsupported types
    return null;
  }

  // Share material (generate shareable link)
  async shareMaterial(id: string, expiresIn?: number): Promise<{ shareUrl: string; expiresAt: string }> {
    const response = await api.post(`/api/study-materials/${id}/share`, { expiresIn });
    return response.data;
  }

  // Get shared material
  async getSharedMaterial(shareToken: string): Promise<Material> {
    const response = await api.get(`/api/study-materials/shared/${shareToken}`);
    return response.data;
  }

  // Add to favorites
  async addToFavorites(id: string): Promise<void> {
    await api.post(`/api/study-materials/${id}/favorite`);
  }

  // Remove from favorites
  async removeFromFavorites(id: string): Promise<void> {
    await api.delete(`/api/study-materials/${id}/favorite`);
  }

  // Get favorites
  async getFavorites(): Promise<Material[]> {
    const response = await api.get('/api/study-materials/favorites');
    return response.data;
  }

  // Rate material
  async rateMaterial(id: string, rating: number, review?: string): Promise<void> {
    await api.post(`/api/study-materials/${id}/rate`, { rating, review });
  }

  // Get material ratings
  async getRatings(id: string): Promise<{
    averageRating: number;
    totalRatings: number;
    userRating?: number;
    reviews: Array<{
      userId: string;
      userName: string;
      rating: number;
      review?: string;
      createdAt: string;
    }>;
  }> {
    const response = await api.get(`/api/study-materials/${id}/ratings`);
    return response.data;
  }
}

export default new MaterialService();
