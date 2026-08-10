import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { JwtPayload } from './auth.types';

const algorithm = 'HS256';
const tokenType = 'JWT';

@Injectable()
export class JwtService {
  private readonly logger = new Logger(JwtService.name);
  private readonly secret: string;

  constructor() {
    const envSecret = process.env.JWT_SECRET?.trim();
    const isProduction = process.env.NODE_ENV === 'production';

    if (!envSecret) {
      if (isProduction || process.env.NODE_ENV === 'staging') {
        throw new Error(
          'CRITICAL SECURITY FAILURE: JWT_SECRET environment variable is missing in production/staging environment.',
        );
      }
      this.logger.warn(
        'SECURITY WARNING: JWT_SECRET environment variable is missing. Generating a random runtime secret for this process. Configure JWT_SECRET in .env.',
      );
      this.secret = randomBytes(32).toString('hex');
    } else if (envSecret.length < 16) {
      if (isProduction) {
        throw new Error(
          'CRITICAL SECURITY FAILURE: JWT_SECRET must be at least 16 characters long in production.',
        );
      }
      this.logger.warn(
        'SECURITY WARNING: JWT_SECRET is weak (<16 characters). Consider using a stronger key.',
      );
      this.secret = envSecret;
    } else {
      this.secret = envSecret;
    }
  }

  sign(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresInSeconds = 3600) {
    const now = Math.floor(Date.now() / 1000);
    const body: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    };
    const encodedHeader = this.encode({ alg: algorithm, typ: tokenType });
    const encodedPayload = this.encode(body);
    const signature = this.signSegments(encodedHeader, encodedPayload);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verify(token: string): JwtPayload {
    const segments = token.split('.');

    if (segments.length !== 3) {
      throw new UnauthorizedException('Invalid token');
    }

    const [encodedHeader, encodedPayload, signature] = segments;
    const expectedSignature = this.signSegments(encodedHeader, encodedPayload);

    if (!this.matches(signature, expectedSignature)) {
      throw new UnauthorizedException('Invalid token');
    }

    const payload = this.decode<JwtPayload>(encodedPayload);
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp <= now) {
      throw new UnauthorizedException('Token expired');
    }

    return payload;
  }

  private signSegments(encodedHeader: string, encodedPayload: string) {
    return createHmac('sha256', this.secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
  }

  private encode(value: unknown) {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }

  private decode<T>(value: string): T {
    try {
      return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as T;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private matches(value: string, expected: string) {
    const valueBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expected);

    return (
      valueBuffer.length === expectedBuffer.length &&
      timingSafeEqual(valueBuffer, expectedBuffer)
    );
  }
}
