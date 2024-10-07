import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: CacheStore,
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
    console.log(`Redis delete: ${key}`);
  }
}
