import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, promises as fs } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';

export type IncomingDocumentFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export type StoredDocumentFile = {
  storageKey: string;
  checksum: string;
};

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

/**
 * Local development storage. Keep all file-system work here so production can
 * replace this implementation with an S3/MinIO adapter without changing the
 * document workflow or controller contract.
 */
@Injectable()
export class DocumentStorageService {
  private readonly root = resolve(
    process.env.DOCUMENTS_STORAGE_PATH || join(process.cwd(), 'uploads', 'documents'),
  );

  async save(tenantId: string, file: IncomingDocumentFile): Promise<StoredDocumentFile> {
    this.assertFile(file);
    const extension = extname(file.originalname).toLowerCase();
    const storageKey = join(tenantId, `${randomUUID()}${extension}`);
    const destination = this.resolvePath(storageKey);
    await fs.mkdir(resolve(destination, '..'), { recursive: true });
    await fs.writeFile(destination, file.buffer, { flag: 'wx' });

    return {
      storageKey,
      checksum: createHash('sha256').update(file.buffer).digest('hex'),
    };
  }

  open(storageKey: string) {
    const path = this.resolvePath(storageKey);
    return createReadStream(path);
  }

  async remove(storageKey: string | null) {
    if (!storageKey) return;
    try {
      await fs.unlink(this.resolvePath(storageKey));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }

  async assertExists(storageKey: string) {
    try {
      await fs.access(this.resolvePath(storageKey));
    } catch {
      throw new NotFoundException('Document file was not found in storage');
    }
  }

  private assertFile(file: IncomingDocumentFile | undefined) {
    if (!file?.buffer?.length) throw new BadRequestException('A document file is required');
    if (file.size > MAX_FILE_BYTES) {
      throw new BadRequestException('Documents must be 20 MB or smaller');
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Only PDF, image, DOC, and DOCX files are supported');
    }
  }

  private resolvePath(storageKey: string) {
    const resolved = resolve(this.root, storageKey);
    if (resolved !== this.root && !resolved.startsWith(`${this.root}${sep}`)) {
      throw new BadRequestException('Invalid document storage key');
    }
    return resolved;
  }
}
