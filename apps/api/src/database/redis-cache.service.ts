import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private client: Redis | null = null;
  private isRedisConnected = false;
  private memoryCache = new Map<string, CacheEntry<any>>();

  async onModuleInit() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    const redisUrl = process.env.REDIS_URL;

    try {
      if (redisUrl) {
        this.client = new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
        });
      } else {
        this.client = new Redis({
          host,
          port,
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
        });
      }

      this.client.on('connect', () => {
        this.isRedisConnected = true;
        this.logger.log('Successfully connected to Redis cache server');
      });

      this.client.on('error', (err) => {
        if (this.isRedisConnected) {
          this.logger.warn(
            `Redis cache connection error: ${err.message}. Falling back to in-memory cache.`,
          );
        }
        this.isRedisConnected = false;
      });

      await this.client.connect().catch((err) => {
        this.logger.warn(
          `Redis server unavailable (${err.message}). Using in-memory fallback cache.`,
        );
        this.isRedisConnected = false;
      });
    } catch (error: any) {
      this.logger.warn(
        `Redis client initialization skipped (${error.message}). Using in-memory cache.`,
      );
      this.isRedisConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
    }
    this.memoryCache.clear();
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.isRedisConnected && this.client) {
      try {
        const raw = await this.client.get(key);
        if (raw) {
          return JSON.parse(raw) as T;
        }
        return null;
      } catch (err: any) {
        this.logger.debug(`Redis get failed for key "${key}": ${err.message}`);
      }
    }

    // In-Memory Fallback
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch (err: any) {
        this.logger.debug(`Redis set failed for key "${key}": ${err.message}`);
      }
    }

    // In-Memory Fallback
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        await this.client.del(key);
      } catch (err: any) {
        this.logger.debug(`Redis del failed for key "${key}": ${err.message}`);
      }
    }
    this.memoryCache.delete(key);
  }

  async invalidatePattern(patternPrefix: string): Promise<void> {
    if (this.isRedisConnected && this.client) {
      try {
        const keys = await this.client.keys(`${patternPrefix}*`);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } catch (err: any) {
        this.logger.debug(
          `Redis invalidatePattern failed for prefix "${patternPrefix}": ${err.message}`,
        );
      }
    }

    // In-Memory Fallback
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(patternPrefix)) {
        this.memoryCache.delete(key);
      }
    }
  }
}
