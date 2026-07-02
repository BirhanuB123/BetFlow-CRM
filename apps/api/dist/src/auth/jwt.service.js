"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const algorithm = 'HS256';
const tokenType = 'JWT';
let JwtService = class JwtService {
    secret = process.env.JWT_SECRET ?? 'betflow-dev-jwt-secret';
    sign(payload, expiresInSeconds = 3600) {
        const now = Math.floor(Date.now() / 1000);
        const body = {
            ...payload,
            iat: now,
            exp: now + expiresInSeconds,
        };
        const encodedHeader = this.encode({ alg: algorithm, typ: tokenType });
        const encodedPayload = this.encode(body);
        const signature = this.signSegments(encodedHeader, encodedPayload);
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }
    verify(token) {
        const segments = token.split('.');
        if (segments.length !== 3) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        const [encodedHeader, encodedPayload, signature] = segments;
        const expectedSignature = this.signSegments(encodedHeader, encodedPayload);
        if (!this.matches(signature, expectedSignature)) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        const payload = this.decode(encodedPayload);
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp <= now) {
            throw new common_1.UnauthorizedException('Token expired');
        }
        return payload;
    }
    signSegments(encodedHeader, encodedPayload) {
        return (0, node_crypto_1.createHmac)('sha256', this.secret)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64url');
    }
    encode(value) {
        return Buffer.from(JSON.stringify(value)).toString('base64url');
    }
    decode(value) {
        try {
            return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    matches(value, expected) {
        const valueBuffer = Buffer.from(value);
        const expectedBuffer = Buffer.from(expected);
        return (valueBuffer.length === expectedBuffer.length &&
            (0, node_crypto_1.timingSafeEqual)(valueBuffer, expectedBuffer));
    }
};
exports.JwtService = JwtService;
exports.JwtService = JwtService = __decorate([
    (0, common_1.Injectable)()
], JwtService);
//# sourceMappingURL=jwt.service.js.map