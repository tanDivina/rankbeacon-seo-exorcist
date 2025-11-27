"""
Performance Optimization Module for RankBeacon SEO Exorcist
Task 10.2: Implement caching strategies and optimize performance
"""

from typing import Dict, Any, Optional, List, Callable
from datetime import datetime, timedelta
from functools import wraps
import hashlib
import json
import time
import asyncio
from collections import OrderedDict


class LRUCache:
    """
    Least Recently Used (LRU) Cache implementation
    Automatically evicts least recently used items when capacity is reached
    """
    
    def __init__(self, capacity: int = 1000):
        self.capacity = capacity
        self.cache: OrderedDict = OrderedDict()
        self.hits = 0
        self.misses = 0
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if key in self.cache:
            self.hits += 1
            # Move to end (most recently used)
            self.cache.move_to_end(key)
            return self.cache[key]
        self.misses += 1
        return None
    
    def set(self, key: str, value: Any):
        """Set value in cache"""
        if key in self.cache:
            # Update existing key
            self.cache.move_to_end(key)
        else:
            # Add new key
            if len(self.cache) >= self.capacity:
                # Remove least recently used item
                self.cache.popitem(last=False)
        self.cache[key] = value
    
    def delete(self, key: str):
        """Delete key from cache"""
        if key in self.cache:
            del self.cache[key]
    
    def clear(self):
        """Clear entire cache"""
        self.cache.clear()
        self.hits = 0
        self.misses = 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_requests = self.hits + self.misses
        hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "size": len(self.cache),
            "capacity": self.capacity,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(hit_rate, 2),
            "utilization": round(len(self.cache) / self.capacity * 100, 2)
        }


class TTLCache:
    """
    Time-To-Live (TTL) Cache implementation
    Automatically expires items after specified duration
    """
    
    def __init__(self, default_ttl: int = 3600):
        self.default_ttl = default_ttl  # seconds
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.hits = 0
        self.misses = 0
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired"""
        if key in self.cache:
            entry = self.cache[key]
            if datetime.now() < entry["expires_at"]:
                self.hits += 1
                return entry["value"]
            else:
                # Expired, remove it
                del self.cache[key]
        
        self.misses += 1
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache with TTL"""
        ttl = ttl or self.default_ttl
        self.cache[key] = {
            "value": value,
            "expires_at": datetime.now() + timedelta(seconds=ttl),
            "created_at": datetime.now()
        }
    
    def delete(self, key: str):
        """Delete key from cache"""
        if key in self.cache:
            del self.cache[key]
    
    def clear(self):
        """Clear entire cache"""
        self.cache.clear()
        self.hits = 0
        self.misses = 0
    
    def cleanup_expired(self):
        """Remove all expired entries"""
        now = datetime.now()
        expired_keys = [
            key for key, entry in self.cache.items()
            if now >= entry["expires_at"]
        ]
        for key in expired_keys:
            del self.cache[key]
        return len(expired_keys)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_requests = self.hits + self.misses
        hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0
        
        # Count expired entries
        now = datetime.now()
        expired_count = sum(
            1 for entry in self.cache.values()
            if now >= entry["expires_at"]
        )
        
        return {
            "size": len(self.cache),
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(hit_rate, 2),
            "expired_entries": expired_count
        }


class CacheManager:
    """
    Centralized cache management for RankBeacon
    Manages multiple cache layers with different strategies
    """
    
    def __init__(self):
        # Analysis results cache (TTL-based, 1 hour)
        self.analysis_cache = TTLCache(default_ttl=3600)
        
        # Entity cache (LRU-based, 1000 items)
        self.entity_cache = LRUCache(capacity=1000)
        
        # Prediction cache (TTL-based, 24 hours)
        self.prediction_cache = TTLCache(default_ttl=86400)
        
        # Competitor data cache (TTL-based, 6 hours)
        self.competitor_cache = TTLCache(default_ttl=21600)
    
    def get_analysis(self, url: str) -> Optional[Dict[str, Any]]:
        """Get cached analysis result"""
        cache_key = self._generate_key("analysis", url)
        return self.analysis_cache.get(cache_key)
    
    def set_analysis(self, url: str, data: Dict[str, Any], ttl: Optional[int] = None):
        """Cache analysis result"""
        cache_key = self._generate_key("analysis", url)
        self.analysis_cache.set(cache_key, data, ttl)
    
    def get_entities(self, url: str) -> Optional[List[Dict[str, Any]]]:
        """Get cached entities"""
        cache_key = self._generate_key("entities", url)
        return self.entity_cache.get(cache_key)
    
    def set_entities(self, url: str, entities: List[Dict[str, Any]]):
        """Cache entities"""
        cache_key = self._generate_key("entities", url)
        self.entity_cache.set(cache_key, entities)
    
    def get_prediction(self, domain: str, keywords: List[str]) -> Optional[Dict[str, Any]]:
        """Get cached prediction"""
        cache_key = self._generate_key("prediction", domain, *sorted(keywords))
        return self.prediction_cache.get(cache_key)
    
    def set_prediction(self, domain: str, keywords: List[str], data: Dict[str, Any]):
        """Cache prediction"""
        cache_key = self._generate_key("prediction", domain, *sorted(keywords))
        self.prediction_cache.set(cache_key, data)
    
    def get_competitor_data(self, domain: str, competitors: List[str]) -> Optional[Dict[str, Any]]:
        """Get cached competitor data"""
        cache_key = self._generate_key("competitor", domain, *sorted(competitors))
        return self.competitor_cache.get(cache_key)
    
    def set_competitor_data(self, domain: str, competitors: List[str], data: Dict[str, Any]):
        """Cache competitor data"""
        cache_key = self._generate_key("competitor", domain, *sorted(competitors))
        self.competitor_cache.set(cache_key, data)
    
    def invalidate_url(self, url: str):
        """Invalidate all caches for a specific URL"""
        analysis_key = self._generate_key("analysis", url)
        entity_key = self._generate_key("entities", url)
        
        self.analysis_cache.delete(analysis_key)
        self.entity_cache.delete(entity_key)
    
    def cleanup_expired(self):
        """Cleanup expired entries from all TTL caches"""
        analysis_cleaned = self.analysis_cache.cleanup_expired()
        prediction_cleaned = self.prediction_cache.cleanup_expired()
        competitor_cleaned = self.competitor_cache.cleanup_expired()
        
        return {
            "analysis": analysis_cleaned,
            "prediction": prediction_cleaned,
            "competitor": competitor_cleaned,
            "total": analysis_cleaned + prediction_cleaned + competitor_cleaned
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get statistics for all caches"""
        return {
            "analysis_cache": self.analysis_cache.get_stats(),
            "entity_cache": self.entity_cache.get_stats(),
            "prediction_cache": self.prediction_cache.get_stats(),
            "competitor_cache": self.competitor_cache.get_stats()
        }
    
    def _generate_key(self, prefix: str, *args) -> str:
        """Generate cache key from arguments"""
        key_data = f"{prefix}:{':'.join(str(arg) for arg in args)}"
        return hashlib.md5(key_data.encode()).hexdigest()


class QueryOptimizer:
    """
    Optimizes database queries and API calls
    Implements batching, deduplication, and query planning
    """
    
    def __init__(self):
        self.query_stats: Dict[str, Dict[str, Any]] = {}
        self.slow_query_threshold = 1000  # ms
    
    def batch_queries(self, queries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Batch multiple queries into optimized groups
        Reduces number of database round-trips
        """
        # Group queries by type
        batched = {}
        for query in queries:
            query_type = query.get("type", "unknown")
            if query_type not in batched:
                batched[query_type] = []
            batched[query_type].append(query)
        
        return [
            {"type": qtype, "queries": qlist}
            for qtype, qlist in batched.items()
        ]
    
    def deduplicate_queries(self, queries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate queries"""
        seen = set()
        unique_queries = []
        
        for query in queries:
            query_hash = self._hash_query(query)
            if query_hash not in seen:
                seen.add(query_hash)
                unique_queries.append(query)
        
        return unique_queries
    
    def track_query_performance(self, query_type: str, execution_time_ms: float):
        """Track query performance for optimization"""
        if query_type not in self.query_stats:
            self.query_stats[query_type] = {
                "count": 0,
                "total_time": 0,
                "slow_queries": 0,
                "avg_time": 0
            }
        
        stats = self.query_stats[query_type]
        stats["count"] += 1
        stats["total_time"] += execution_time_ms
        stats["avg_time"] = stats["total_time"] / stats["count"]
        
        if execution_time_ms > self.slow_query_threshold:
            stats["slow_queries"] += 1
    
    def get_slow_queries(self) -> List[Dict[str, Any]]:
        """Get list of slow query types"""
        return [
            {
                "type": qtype,
                "avg_time": stats["avg_time"],
                "slow_count": stats["slow_queries"],
                "total_count": stats["count"]
            }
            for qtype, stats in self.query_stats.items()
            if stats["slow_queries"] > 0
        ]
    
    def _hash_query(self, query: Dict[str, Any]) -> str:
        """Generate hash for query deduplication"""
        query_str = json.dumps(query, sort_keys=True)
        return hashlib.md5(query_str.encode()).hexdigest()


class RateLimiter:
    """
    Rate limiting for API calls and resource-intensive operations
    Prevents system overload and ensures fair resource allocation
    """
    
    def __init__(self, max_requests: int = 100, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = {}
    
    def is_allowed(self, identifier: str) -> bool:
        """Check if request is allowed under rate limit"""
        now = time.time()
        
        if identifier not in self.requests:
            self.requests[identifier] = []
        
        # Remove old requests outside the window
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier]
            if now - req_time < self.window_seconds
        ]
        
        # Check if under limit
        if len(self.requests[identifier]) < self.max_requests:
            self.requests[identifier].append(now)
            return True
        
        return False
    
    def get_remaining(self, identifier: str) -> int:
        """Get remaining requests in current window"""
        now = time.time()
        
        if identifier not in self.requests:
            return self.max_requests
        
        # Count recent requests
        recent_requests = sum(
            1 for req_time in self.requests[identifier]
            if now - req_time < self.window_seconds
        )
        
        return max(0, self.max_requests - recent_requests)
    
    def reset(self, identifier: str):
        """Reset rate limit for identifier"""
        if identifier in self.requests:
            del self.requests[identifier]


def cache_result(cache_manager: CacheManager, cache_type: str, ttl: Optional[int] = None):
    """
    Decorator for caching function results
    
    Usage:
        @cache_result(cache_manager, "analysis", ttl=3600)
        async def analyze_website(url: str):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key from function arguments
            cache_key = f"{func.__name__}:{args}:{kwargs}"
            
            # Try to get from cache
            if cache_type == "analysis":
                cached = cache_manager.analysis_cache.get(cache_key)
            elif cache_type == "prediction":
                cached = cache_manager.prediction_cache.get(cache_key)
            else:
                cached = None
            
            if cached is not None:
                return cached
            
            # Execute function
            result = await func(*args, **kwargs)
            
            # Cache result
            if cache_type == "analysis":
                cache_manager.analysis_cache.set(cache_key, result, ttl)
            elif cache_type == "prediction":
                cache_manager.prediction_cache.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator


class PerformanceMonitor:
    """
    Monitors system performance and resource usage
    Provides metrics for optimization decisions
    """
    
    def __init__(self):
        self.metrics: Dict[str, List[float]] = {
            "response_times": [],
            "memory_usage": [],
            "cpu_usage": [],
            "cache_hit_rates": []
        }
        self.start_time = time.time()
    
    def record_response_time(self, duration_ms: float):
        """Record API response time"""
        self.metrics["response_times"].append(duration_ms)
        
        # Keep only last 1000 measurements
        if len(self.metrics["response_times"]) > 1000:
            self.metrics["response_times"].pop(0)
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        response_times = self.metrics["response_times"]
        
        if not response_times:
            return {
                "avg_response_time": 0,
                "p50_response_time": 0,
                "p95_response_time": 0,
                "p99_response_time": 0,
                "uptime_seconds": time.time() - self.start_time
            }
        
        sorted_times = sorted(response_times)
        n = len(sorted_times)
        
        return {
            "avg_response_time": round(sum(sorted_times) / n, 2),
            "p50_response_time": sorted_times[int(n * 0.5)],
            "p95_response_time": sorted_times[int(n * 0.95)],
            "p99_response_time": sorted_times[int(n * 0.99)],
            "min_response_time": min(sorted_times),
            "max_response_time": max(sorted_times),
            "total_requests": n,
            "uptime_seconds": round(time.time() - self.start_time, 2)
        }


# Global instances
cache_manager = CacheManager()
query_optimizer = QueryOptimizer()
rate_limiter = RateLimiter(max_requests=100, window_seconds=60)
performance_monitor = PerformanceMonitor()
