import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash a raw password into scrypt format', async () => {
    const raw = 'SecurePass123!';
    const hash = await service.hash(raw);

    expect(hash).toBeDefined();
    expect(hash.startsWith('scrypt:')).toBe(true);
    const parts = hash.split(':');
    expect(parts.length).toBe(3);
  });

  it('should return true for valid password verification', async () => {
    const raw = 'CorrectPassword99';
    const hash = await service.hash(raw);
    const isValid = await service.verify(raw, hash);

    expect(isValid).toBe(true);
  });

  it('should return false for incorrect password verification', async () => {
    const raw = 'CorrectPassword99';
    const hash = await service.hash(raw);
    const isValid = await service.verify('WrongPassword', hash);

    expect(isValid).toBe(false);
  });

  it('should return false for malformed stored hash', async () => {
    const isValid = await service.verify('password', 'invalid-hash-format');
    expect(isValid).toBe(false);
  });
});
