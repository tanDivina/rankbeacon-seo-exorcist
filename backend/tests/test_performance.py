"""
Performance Optimization Tests
Task 10.2: Test caching strategies, query optimization, and system performance
"""

import pytest
import time
import asyncio
from backend.performance_optimizer import (
    LRUCache,
    TTLCache,
    CacheManager,
    QueryOptimizer,
    RateLimiter,
    PerformanceMonitor
)


# LRU Cache Tests

def test_lru_cache_basic_operations():
    """Test basic LRU cache operations"""
    cache = LRUCache(capacity=3)
    
    # Set values
    cache.set("key1", "value1")
    cache.set("key2", "value2")
    cache.set("key3", "value3")
    
    # Get values
    assert cache.get("key1") == "value1"
    assert cache.get("key2") == "value2"
    assert cache.get("key3") == "value3"
    
    # Check stats
    stats = cache.get_stats()
    assert stats["hits"] == 3
    assert stats["misses"] == 0
    assert stats["size"] == 3


def test_lru_cache_eviction():
    """Test LRU cache evicts least recently used items"""
    cache = LRUCache(capacity=2)
    
    cache.set("key1", "value1")
    cache.set("key2", "value2")
    
    # Access key1 to make it recently used
    cache.get("key1")
    
    # Add key3, should evict key2 (least recently used)
    cache.set("key3", "value3")
    
    assert cache.get("key1") == "value1"
    assert cache.get("key2") is None  # Evicted
    assert cache.get("key3") == "value3"


def test_lru_cache_hit_rate():
    """Test LRU cache hit rate calculation"""
    cache = LRUCache(capacity=10)
    
    # Set some values
    for i in range(5):
        cache.set(f"key{i}", f"value{i}")
    
    # Hit some keys
    for i in range(3):
        cache.get(f"key{i}")
    
    # Miss some keys
    for i in range(5, 8):
        cache.get(f"key{i}")
    
    stats = cache.get_stats()
    assert stats["hits"] == 3
    assert stats["misses"] == 3
    assert stats["hit_rate"] == 50.0


# TTL Cache Tests

def test_ttl_cache_basic_operations():
    """Test basic TTL cache operations"""
    cache = TTLCache(default_ttl=10)
    
    cache.set("key1", "value1")
    cache.set("key2", "value2", ttl=20)
    
    assert cache.get("key1") == "value1"
    assert cache.get("key2") == "value2"


def test_ttl_cache_expiration():
    """Test TTL cache expires items"""
    cache = TTLCache(default_ttl=1)  # 1 second TTL
    
    cache.set("key1", "value1")
    assert cache.get("key1") == "value1"
    
    # Wait for expiration
    time.sleep(1.1)
    
    assert cache.get("key1") is None  # Expired


def test_ttl_cache_cleanup():
    """Test TTL cache cleanup of expired entries"""
    cache = TTLCache(default_ttl=1)
    
    # Add multiple entries
    for i in range(5):
        cache.set(f"key{i}", f"value{i}")
    
    # Wait for expiration
    time.sleep(1.1)
    
    # Cleanup expired entries
    cleaned = cache.cleanup_expired()
    
    assert cleaned == 5
    assert len(cache.cache) == 0


# Cache Manager Tests

def test_cache_manager_analysis_cache():
    """Test cache manager analysis caching"""
    manager = CacheManager()
    
    url = "https://example.com"
    data = {"haunting_score": 45, "entities": []}
    
    # Set and get
    manager.set_analysis(url, data)
    cached = manager.get_analysis(url)
    
    assert cached == data


def test_cache_manager_entity_cache():
    """Test cache manager entity caching"""
    manager = CacheManager()
    
    url = "https://example.com"
    entities = [{"type": "ghost", "count": 3}]
    
    manager.set_entities(url, entities)
    cached = manager.get_entities(url)
    
    assert cached == entities


def test_cache_manager_prediction_cache():
    """Test cache manager prediction caching"""
    manager = CacheManager()
    
    domain = "example.com"
    keywords = ["seo", "optimization"]
    data = {"predictions": []}
    
    manager.set_prediction(domain, keywords, data)
    cached = manager.get_prediction(domain, keywords)
    
    assert cached == data


def test_cache_manager_invalidation():
    """Test cache invalidation"""
    manager = CacheManager()
    
    url = "https://example.com"
    
    # Set data
    manager.set_analysis(url, {"score": 45})
    manager.set_entities(url, [{"type": "ghost"}])
    
    # Verify cached
    assert manager.get_analysis(url) is not None
    assert manager.get_entities(url) is not None
    
    # Invalidate
    manager.invalidate_url(url)
    
    # Verify cleared
    assert manager.get_analysis(url) is None
    assert manager.get_entities(url) is None


def test_cache_manager_stats():
    """Test cache manager statistics"""
    manager = CacheManager()
    
    # Add some data
    manager.set_analysis("https://example.com", {"score": 45})
    manager.set_entities("https://example.com", [])
    
    # Get some data (hits)
    manager.get_analysis("https://example.com")
    manager.get_entities("https://example.com")
    
    # Miss some data
    manager.get_analysis("https://notfound.com")
    
    stats = manager.get_stats()
    
    assert "analysis_cache" in stats
    assert "entity_cache" in stats
    assert stats["analysis_cache"]["hits"] > 0


# Query Optimizer Tests

def test_query_optimizer_batching():
    """Test query batching"""
    optimizer = QueryOptimizer()
    
    queries = [
        {"type": "select", "table": "users"},
        {"type": "select", "table": "posts"},
        {"type": "insert", "table": "logs"},
        {"type": "select", "table": "comments"}
    ]
    
    batched = optimizer.batch_queries(queries)
    
    # Should group by type
    assert len(batched) == 2  # select and insert
    select_batch = next(b for b in batched if b["type"] == "select")
    assert len(select_batch["queries"]) == 3


def test_query_optimizer_deduplication():
    """Test query deduplication"""
    optimizer = QueryOptimizer()
    
    queries = [
        {"type": "select", "id": 1},
        {"type": "select", "id": 2},
        {"type": "select", "id": 1},  # Duplicate
        {"type": "select", "id": 3}
    ]
    
    unique = optimizer.deduplicate_queries(queries)
    
    assert len(unique) == 3  # One duplicate removed


def test_query_optimizer_performance_tracking():
    """Test query performance tracking"""
    optimizer = QueryOptimizer()
    
    # Track some queries
    optimizer.track_query_performance("select_users", 50)
    optimizer.track_query_performance("select_users", 100)
    optimizer.track_query_performance("select_users", 1500)  # Slow query
    
    # Check stats
    assert "select_users" in optimizer.query_stats
    stats = optimizer.query_stats["select_users"]
    assert stats["count"] == 3
    assert stats["slow_queries"] == 1
    
    # Get slow queries
    slow = optimizer.get_slow_queries()
    assert len(slow) > 0
    assert slow[0]["type"] == "select_users"


# Rate Limiter Tests

def test_rate_limiter_allows_requests():
    """Test rate limiter allows requests under limit"""
    limiter = RateLimiter(max_requests=5, window_seconds=60)
    
    # Should allow first 5 requests
    for i in range(5):
        assert limiter.is_allowed("user1") is True
    
    # Should block 6th request
    assert limiter.is_allowed("user1") is False


def test_rate_limiter_separate_identifiers():
    """Test rate limiter tracks identifiers separately"""
    limiter = RateLimiter(max_requests=2, window_seconds=60)
    
    # User1 makes 2 requests
    assert limiter.is_allowed("user1") is True
    assert limiter.is_allowed("user1") is True
    assert limiter.is_allowed("user1") is False
    
    # User2 should still be allowed
    assert limiter.is_allowed("user2") is True
    assert limiter.is_allowed("user2") is True


def test_rate_limiter_window_reset():
    """Test rate limiter resets after window"""
    limiter = RateLimiter(max_requests=2, window_seconds=1)
    
    # Use up limit
    assert limiter.is_allowed("user1") is True
    assert limiter.is_allowed("user1") is True
    assert limiter.is_allowed("user1") is False
    
    # Wait for window to pass
    time.sleep(1.1)
    
    # Should be allowed again
    assert limiter.is_allowed("user1") is True


def test_rate_limiter_remaining_requests():
    """Test getting remaining requests"""
    limiter = RateLimiter(max_requests=5, window_seconds=60)
    
    assert limiter.get_remaining("user1") == 5
    
    limiter.is_allowed("user1")
    assert limiter.get_remaining("user1") == 4
    
    limiter.is_allowed("user1")
    limiter.is_allowed("user1")
    assert limiter.get_remaining("user1") == 2


# Performance Monitor Tests

def test_performance_monitor_response_times():
    """Test performance monitor tracks response times"""
    monitor = PerformanceMonitor()
    
    # Record some response times
    monitor.record_response_time(100)
    monitor.record_response_time(200)
    monitor.record_response_time(150)
    
    stats = monitor.get_performance_stats()
    
    assert stats["total_requests"] == 3
    assert stats["avg_response_time"] == 150.0
    assert stats["min_response_time"] == 100
    assert stats["max_response_time"] == 200


def test_performance_monitor_percentiles():
    """Test performance monitor calculates percentiles"""
    monitor = PerformanceMonitor()
    
    # Record 100 response times
    for i in range(100):
        monitor.record_response_time(i)
    
    stats = monitor.get_performance_stats()
    
    assert stats["p50_response_time"] == 50
    assert stats["p95_response_time"] == 95
    assert stats["p99_response_time"] == 99


def test_performance_monitor_uptime():
    """Test performance monitor tracks uptime"""
    monitor = PerformanceMonitor()
    
    time.sleep(0.1)
    
    stats = monitor.get_performance_stats()
    assert stats["uptime_seconds"] >= 0.1


# Integration Tests

def test_cache_improves_performance():
    """Test that caching improves performance"""
    manager = CacheManager()
    
    # Simulate expensive operation
    async def expensive_operation(url: str):
        await asyncio.sleep(0.1)  # Simulate delay
        return {"data": "result"}
    
    async def test():
        url = "https://example.com"
        
        # First call (cache miss)
        start = time.time()
        result1 = await expensive_operation(url)
        manager.set_analysis(url, result1)
        time1 = time.time() - start
        
        # Second call (cache hit)
        start = time.time()
        result2 = manager.get_analysis(url)
        time2 = time.time() - start
        
        # Cache hit should be much faster
        assert time2 < time1 / 10
        assert result1 == result2
    
    asyncio.run(test())


def test_rate_limiter_prevents_overload():
    """Test rate limiter prevents system overload"""
    limiter = RateLimiter(max_requests=10, window_seconds=1)
    
    allowed_count = 0
    blocked_count = 0
    
    # Try 20 requests
    for i in range(20):
        if limiter.is_allowed("user1"):
            allowed_count += 1
        else:
            blocked_count += 1
    
    # Should allow 10, block 10
    assert allowed_count == 10
    assert blocked_count == 10


def test_query_optimizer_reduces_queries():
    """Test query optimizer reduces number of queries"""
    optimizer = QueryOptimizer()
    
    # 10 queries with 5 duplicates
    queries = [
        {"type": "select", "id": 1},
        {"type": "select", "id": 2},
        {"type": "select", "id": 1},  # Dup
        {"type": "select", "id": 3},
        {"type": "select", "id": 2},  # Dup
        {"type": "select", "id": 4},
        {"type": "select", "id": 3},  # Dup
        {"type": "select", "id": 5},
        {"type": "select", "id": 4},  # Dup
        {"type": "select", "id": 5},  # Dup
    ]
    
    unique = optimizer.deduplicate_queries(queries)
    
    # Should reduce from 10 to 5
    assert len(unique) == 5
    assert len(queries) == 10


def test_cache_manager_memory_efficiency():
    """Test cache manager doesn't grow unbounded"""
    manager = CacheManager()
    
    # Add many entries
    for i in range(2000):
        manager.set_entities(f"https://example{i}.com", [{"type": "ghost"}])
    
    stats = manager.get_stats()
    
    # Entity cache has capacity of 1000, should not exceed
    assert stats["entity_cache"]["size"] <= 1000


def test_performance_under_load():
    """Test system performance under load"""
    manager = CacheManager()
    monitor = PerformanceMonitor()
    
    async def simulate_request(i: int):
        start = time.time()
        
        # Check cache
        url = f"https://example{i % 100}.com"  # Reuse some URLs
        cached = manager.get_analysis(url)
        
        if cached is None:
            # Simulate analysis
            await asyncio.sleep(0.01)
            result = {"score": i}
            manager.set_analysis(url, result)
        
        duration = (time.time() - start) * 1000
        monitor.record_response_time(duration)
    
    async def test():
        # Simulate 100 concurrent requests
        tasks = [simulate_request(i) for i in range(100)]
        await asyncio.gather(*tasks)
        
        stats = monitor.get_performance_stats()
        
        # Average response time should be reasonable
        assert stats["avg_response_time"] < 50  # Less than 50ms average
        assert stats["total_requests"] == 100
    
    asyncio.run(test())


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
