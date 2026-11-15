package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"

	"13c-gateway/internal/middleware"
)

func TestAdminAuth_ProductionHardening(t *testing.T) {
	gin.SetMode(gin.TestMode)
	masterSecret := "super-secure-master-key-12345"

	setupRouter := func() *gin.Engine {
		r := gin.New()
		r.Use(middleware.AdminAuth(masterSecret))
		r.GET("/admin/test", func(c *gin.Context) {
			c.String(http.StatusOK, "admin_ok")
		})
		return r
	}

	r := setupRouter()

	// 1. Valid master key succeeds in production
	os.Setenv("APP_ENV", "production")
	defer os.Unsetenv("APP_ENV")

	req1 := httptest.NewRequest(http.MethodGet, "/admin/test", nil)
	req1.Header.Set("X-Admin-Key", masterSecret)
	w1 := httptest.NewRecorder()
	r.ServeHTTP(w1, req1)
	if w1.Code != http.StatusOK {
		t.Fatalf("expected 200 for valid master key, got %d", w1.Code)
	}

	// 2. Attacker using 13c_root_ in production MUST BE BLOCKED
	req2 := httptest.NewRequest(http.MethodGet, "/admin/test", nil)
	req2.Header.Set("Authorization", "Bearer 13c_root_fake_token_attempt")
	w2 := httptest.NewRecorder()
	r.ServeHTTP(w2, req2)
	if w2.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for 13c_root_ in production, got %d", w2.Code)
	}

	// 3. Attacker using 13c_root_ cookie in production MUST BE BLOCKED
	req3 := httptest.NewRequest(http.MethodGet, "/admin/test", nil)
	req3.AddCookie(&http.Cookie{Name: "13c_admin_session", Value: "13c_root_attacker_cookie"})
	w3 := httptest.NewRecorder()
	r.ServeHTTP(w3, req3)
	if w3.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for 13c_root_ cookie in production, got %d", w3.Code)
	}

	// 4. In development, dev root token is allowed
	os.Setenv("APP_ENV", "development")
	req4 := httptest.NewRequest(http.MethodGet, "/admin/test", nil)
	req4.Header.Set("Authorization", "Bearer 13c_root_dev_session")
	w4 := httptest.NewRecorder()
	r.ServeHTTP(w4, req4)
	if w4.Code != http.StatusOK {
		t.Fatalf("expected 200 for 13c_root_ in development mode, got %d", w4.Code)
	}
}
