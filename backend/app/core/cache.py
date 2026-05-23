import logging
import json
from .config import settings

logger = logging.getLogger(__name__)

class CacheManager:
    def __init__(self):
        self.redis_client = None
        self.memory_cache = {}
        self.connect()

    def connect(self):
        """Attempts to connect to Redis, falls back to memory if connection fails."""
        try:
            import redis
            # Parse Redis URL from settings
            self.redis_client = redis.from_url(
                settings.REDIS_URL, 
                socket_connect_timeout=2.0,
                decode_responses=True
            )
            # Ping to verify active connection
            self.redis_client.ping()
            logger.info("Connected to Redis successfully.")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Falling back to in-memory caching.")
            self.redis_client = None

    def get(self, key: str):
        """Gets value from cache (JSON-decoded)."""
        if self.redis_client:
            try:
                val = self.redis_client.get(key)
                return json.loads(val) if val else None
            except Exception as e:
                logger.error(f"Redis get error: {e}")
                
        # In-memory fallback
        return self.memory_cache.get(key)

    def set(self, key: str, value: any, expire: int = None):
        """Sets value in cache (JSON-encoded)."""
        serialized = json.dumps(value)
        if self.redis_client:
            try:
                self.redis_client.set(key, serialized, ex=expire)
                return
            except Exception as e:
                logger.error(f"Redis set error: {e}")
                
        # In-memory fallback
        self.memory_cache[key] = value

    def delete(self, key: str):
        """Deletes key from cache."""
        if self.redis_client:
            try:
                self.redis_client.delete(key)
                return
            except Exception as e:
                logger.error(f"Redis delete error: {e}")
                
        # In-memory fallback
        if key in self.memory_cache:
            del self.memory_cache[key]

# Singleton instance
cache = CacheManager()
