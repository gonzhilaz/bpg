package middleware

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"

	"13c-gateway/pkg/response"
)

type ipBucket struct {
	tokens     int
	lastRefill time.Time
}

// IPRateLimiter provides in-memory token-bucket rate limiting per client IP
type IPRateLimiter struct {
	mu         sync.Mutex
	buckets    map[string]*ipBucket
	rate       int           // tokens added per interval
	capacity   int           // maximum bucket capacity
	interval   time.Duration // interval to refill tokens
	purgeEvery time.Duration
}

// NewIPRateLimiter creates a new rate limiter
func NewIPRateLimiter(rate, capacity int, interval time.Duration) *IPRateLimiter {
	limiter := &IPRateLimiter{
		buckets:    make(map[string]*ipBucket),
		rate:       rate,
		capacity:   capacity,
		interval:   interval,
		purgeEvery: 5 * time.Minute,
	}

	// Stale IP eviction goroutine to eliminate memory leaks
	go func() {
		ticker := time.NewTicker(limiter.purgeEvery)
		defer ticker.Stop()
		for range ticker.C {
			limiter.purgeStale()
		}
	}()

	return limiter
}

func (limiter *IPRateLimiter) allow(ip string) (bool, int) {
	limiter.mu.Lock()
	defer limiter.mu.Unlock()

	now := time.Now()
	bucket, exists := limiter.buckets[ip]
	if !exists {
		bucket = &ipBucket{
			tokens:     limiter.capacity - 1,
			lastRefill: now,
		}
		limiter.buckets[ip] = bucket
		return true, bucket.tokens
	}

	// Refill tokens based on elapsed intervals
	elapsed := now.Sub(bucket.lastRefill)
	if elapsed >= limiter.interval {
		refillUnits := int(elapsed / limiter.interval)
		bucket.tokens += refillUnits * limiter.rate
		if bucket.tokens > limiter.capacity {
			bucket.tokens = limiter.capacity
		}
		bucket.lastRefill = now
	}

	if bucket.tokens > 0 {
		bucket.tokens--
		return true, bucket.tokens
	}

	return false, 0
}

func (limiter *IPRateLimiter) purgeStale() {
	limiter.mu.Lock()
	defer limiter.mu.Unlock()

	cutoff := time.Now().Add(-10 * time.Minute)
	for ip, bucket := range limiter.buckets {
		if bucket.lastRefill.Before(cutoff) {
			delete(limiter.buckets, ip)
		}
	}
}

// RateLimit middleware factory
func RateLimit(rate, capacity int, interval time.Duration) gin.HandlerFunc {
	limiter := NewIPRateLimiter(rate, capacity, interval)

	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		allowed, remaining := limiter.allow(clientIP)

		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", capacity))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))

		if !allowed {
			c.Header("Retry-After", "60")
			response.Error(c, http.StatusTooManyRequests, "Rate limit exceeded. Too many requests from your IP, please retry in 60 seconds.", nil)
			c.Abort()
			return
		}

		c.Next()
	}
}

