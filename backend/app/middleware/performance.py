"""
Performance optimization middleware
"""
import time
import json
from typing import Optional, Dict, Any
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import redis
from app.config import settings

class CachingMiddleware(BaseHTTPMiddleware):
    """Redis-based caching middleware"""
    
    def __init__(self, app, redis_client: Optional[redis.Redis] = None):
        super().__init__(app)
        self.redis_client = redis_client or redis.Redis(
            host=getattr(settings, 'REDIS_HOST', 'localhost'),
            port=getattr(settings, 'REDIS_PORT', 6379),
            db=1,  # Use different DB for caching
            decode_responses=True
        )
        
        # Cache configuration
        self.cache_config = {
            'opportunities': {'ttl': 300, 'methods': ['GET']},  # 5 minutes
            'proposals': {'ttl': 600, 'methods': ['GET']},      # 10 minutes
            'analytics': {'ttl': 1800, 'methods': ['GET']},     # 30 minutes
            'user_profile': {'ttl': 900, 'methods': ['GET']},   # 15 minutes
        }
    
    async def dispatch(self, request: Request, call_next):
        """Process request with caching"""
        
        # Check if request should be cached
        cache_key = self._get_cache_key(request)
        cache_config = self._get_cache_config(request)
        
        if cache_key and cache_config:
            # Try to get from cache
            cached_response = await self._get_from_cache(cache_key)
            if cached_response:
                return cached_response
        
        # Process request
        response = await call_next(request)
        
        # Cache response if appropriate
        if cache_key and cache_config and response.status_code == 200:
            await self._cache_response(cache_key, response, cache_config['ttl'])
        
        return response
    
    def _get_cache_key(self, request: Request) -> Optional[str]:
        """Generate cache key for request"""
        if request.method != 'GET':
            return None
        
        # Create key from path and query params
        path = request.url.path
        query_params = str(sorted(request.query_params.items()))
        
        # Hash the key to keep it reasonable length
        import hashlib
        key_string = f"{path}:{query_params}"
        key_hash = hashlib.md5(key_string.encode()).hexdigest()
        
        return f"cache:{key_hash}"
    
    def _get_cache_config(self, request: Request) -> Optional[Dict[str, Any]]:
        """Get cache configuration for request"""
        path = request.url.path
        
        for pattern, config in self.cache_config.items():
            if pattern in path:
                return config
        
        return None
    
    async def _get_from_cache(self, cache_key: str) -> Optional[Any]:
        """Get response from cache"""
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception:
            # If Redis fails, continue without cache
            pass
        
        return None
    
    async def _cache_response(self, cache_key: str, response: Any, ttl: int):
        """Cache response"""
        try:
            # Extract response data
            if hasattr(response, 'body'):
                response_data = {
                    'status_code': response.status_code,
                    'headers': dict(response.headers),
                    'body': response.body.decode() if isinstance(response.body, bytes) else response.body
                }
                
                self.redis_client.setex(cache_key, ttl, json.dumps(response_data))
        except Exception:
            # If caching fails, continue without cache
            pass

class DatabaseOptimization:
    """Database connection and query optimization"""
    
    def __init__(self):
        self.connection_pool = None
        self.query_cache = {}
    
    def setup_connection_pool(self, database_url: str, pool_size: int = 20):
        """Setup database connection pool"""
        from sqlalchemy import create_engine
        from sqlalchemy.pool import QueuePool
        
        engine = create_engine(
            database_url,
            poolclass=QueuePool,
            pool_size=pool_size,
            max_overflow=30,
            pool_pre_ping=True,
            pool_recycle=3600
        )
        
        self.connection_pool = engine
        return engine
    
    def optimize_query(self, query: str) -> str:
        """Optimize SQL query"""
        # Add query hints and optimizations
        optimized = query
        
        # Add common optimizations
        if 'SELECT' in query.upper():
            # Add LIMIT if not present and query could be large
            if 'LIMIT' not in query.upper() and 'COUNT' not in query.upper():
                optimized += ' LIMIT 1000'
        
        return optimized
    
    def get_query_plan(self, query: str) -> Dict[str, Any]:
        """Get query execution plan for optimization"""
        # This would analyze query performance
        return {
            'estimated_cost': 1.0,
            'indexes_used': [],
            'optimization_suggestions': []
        }

class AsyncTaskOptimization:
    """Optimize async task processing"""
    
    def __init__(self):
        self.task_queue = []
        self.batch_size = 10
    
    async def batch_process_tasks(self, tasks: list):
        """Process tasks in batches for efficiency"""
        results = []
        
        for i in range(0, len(tasks), self.batch_size):
            batch = tasks[i:i + self.batch_size]
            batch_results = await self._process_batch(batch)
            results.extend(batch_results)
        
        return results
    
    async def _process_batch(self, batch: list):
        """Process a batch of tasks concurrently"""
        import asyncio
        
        # Process batch concurrently
        tasks = [self._process_single_task(task) for task in batch]
        return await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _process_single_task(self, task: Any):
        """Process a single task"""
        # Implement task processing logic
        await asyncio.sleep(0.001)  # Simulate processing
        return f"Processed: {task}"

class MemoryOptimization:
    """Memory usage optimization"""
    
    def __init__(self):
        self.memory_threshold = 0.8  # 80% memory usage threshold
        self.gc_interval = 300  # 5 minutes
    
    def check_memory_usage(self) -> Dict[str, float]:
        """Check current memory usage"""
        import psutil
        
        memory = psutil.virtual_memory()
        return {
            'total': memory.total,
            'available': memory.available,
            'used': memory.used,
            'percentage': memory.percent / 100
        }
    
    def optimize_memory(self):
        """Optimize memory usage"""
        import gc
        
        # Force garbage collection
        collected = gc.collect()
        
        # Clear caches if memory usage is high
        memory_usage = self.check_memory_usage()
        if memory_usage['percentage'] > self.memory_threshold:
            # Clear various caches
            self._clear_caches()
        
        return collected
    
    def _clear_caches(self):
        """Clear application caches"""
        # Clear Python caches
        import sys
        if hasattr(sys, '_clear_type_cache'):
            sys._clear_type_cache()
        
        # Clear module caches
        import importlib
        for module_name in list(sys.modules.keys()):
            if module_name.startswith('app.'):
                try:
                    importlib.reload(sys.modules[module_name])
                except:
                    pass
