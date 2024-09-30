import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager'; // Cache Manager를 주입

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore, // Cache Manager 주입
  ) {}

  async redisSet(key: string, value: string, expire: number) {
    await this.cacheManager.set(key, value, { ttl: expire });
    console.log(`Redis set: ${key} -> ${value}`);
  }

  async redisGet(key: string): Promise<string | null> {
    return await this.cacheManager.get(key);
  }

  async redisDel(key: string) {
    await this.cacheManager.del(key);
  }
}
