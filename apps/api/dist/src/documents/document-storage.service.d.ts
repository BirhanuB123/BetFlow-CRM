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
export declare class DocumentStorageService {
    private readonly root;
    save(file: IncomingDocumentFile): Promise<StoredDocumentFile>;
    open(storageKey: string): import("fs").ReadStream;
    remove(storageKey: string | null): Promise<void>;
    assertExists(storageKey: string): Promise<void>;
    private assertFile;
    private resolvePath;
}
