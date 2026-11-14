package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestRateLimitMiddleware_BlocksExcessiveRequests(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	// 3 requests allowed per 10 seconds
	r.Use(RateLimit(3, 3, 10*time.Second))
	r.GET("/test-limit", func(c *gin.Context) {
		c.String(http.StatusOK, "OK")
	})

	// 1st request -> 200 OK
	w1 := httptest.NewRecorder()
	req1, _ := http.NewRequest(http.MethodGet, "/test-limit", nil)
	r.ServeHTTP(w1, req1)
	if w1.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got: %d", w1.Code)
	}

	// 2nd request -> 200 OK
	w2 := httptest.NewRecorder()
	req2, _ := http.NewRequest(http.MethodGet, "/test-limit", nil)
	r.ServeHTTP(w2, req2)
	if w2.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got: %d", w2.Code)
	}

	// 3rd request -> 200 OK
	w3 := httptest.NewRecorder()
	req3, _ := http.NewRequest(http.MethodGet, "/test-limit", nil)
	r.ServeHTTP(w3, req3)
	if w3.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got: %d", w3.Code)
	}

	// 4th request -> 429 Too Many Requests
	w4 := httptest.NewRecorder()
	req4, _ := http.NewRequest(http.MethodGet, "/test-limit", nil)
	r.ServeHTTP(w4, req4)
	if w4.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429 Too Many Requests, got: %d", w4.Code)
	}

	if w4.Header().Get("Retry-After") != "60" {
		t.Fatalf("expected Retry-After 60, got: %s", w4.Header().Get("Retry-After"))
	}
}
