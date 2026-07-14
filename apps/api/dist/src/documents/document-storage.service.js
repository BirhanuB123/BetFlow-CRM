"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentStorageService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
let DocumentStorageService = class DocumentStorageService {
    root = (0, node_path_1.resolve)(process.env.DOCUMENTS_STORAGE_PATH || (0, node_path_1.join)(process.cwd(), 'uploads', 'documents'));
    async save(tenantId, file) {
        this.assertFile(file);
        const extension = (0, node_path_1.extname)(file.originalname).toLowerCase();
        const storageKey = (0, node_path_1.join)(tenantId, `${(0, node_crypto_1.randomUUID)()}${extension}`);
        const destination = this.resolvePath(storageKey);
        await node_fs_1.promises.mkdir((0, node_path_1.resolve)(destination, '..'), { recursive: true });
        await node_fs_1.promises.writeFile(destination, file.buffer, { flag: 'wx' });
        return {
            storageKey,
            checksum: (0, node_crypto_1.createHash)('sha256').update(file.buffer).digest('hex'),
        };
    }
    open(storageKey) {
        const path = this.resolvePath(storageKey);
        return (0, node_fs_1.createReadStream)(path);
    }
    async remove(storageKey) {
        if (!storageKey)
            return;
        try {
            await node_fs_1.promises.unlink(this.resolvePath(storageKey));
        }
        catch (error) {
            if (error.code !== 'ENOENT')
                throw error;
        }
    }
    async assertExists(storageKey) {
        try {
            await node_fs_1.promises.access(this.resolvePath(storageKey));
        }
        catch {
            throw new common_1.NotFoundException('Document file was not found in storage');
        }
    }
    assertFile(file) {
        if (!file?.buffer?.length)
            throw new common_1.BadRequestException('A document file is required');
        if (file.size > MAX_FILE_BYTES) {
            throw new common_1.BadRequestException('Documents must be 20 MB or smaller');
        }
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            throw new common_1.BadRequestException('Only PDF, image, DOC, and DOCX files are supported');
        }
    }
    resolvePath(storageKey) {
        const resolved = (0, node_path_1.resolve)(this.root, storageKey);
        if (resolved !== this.root && !resolved.startsWith(`${this.root}${node_path_1.sep}`)) {
            throw new common_1.BadRequestException('Invalid document storage key');
        }
        return resolved;
    }
};
exports.DocumentStorageService = DocumentStorageService;
exports.DocumentStorageService = DocumentStorageService = __decorate([
    (0, common_1.Injectable)()
], DocumentStorageService);
//# sourceMappingURL=document-storage.service.js.map