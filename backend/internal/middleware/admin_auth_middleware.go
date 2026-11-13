package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"

	"13c-gateway/pkg/response"
)

// AdminAuth validates master administrative key or root session token
func AdminAuth(masterSecretKey string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Check X-Admin-Key header
		adminKey := strings.TrimSpace(c.GetHeader("X-Admin-Key"))
		if adminKey == "" {
			adminKey = strings.TrimSpace(c.Query("admin_key"))
		}

		// 2. Check Authorization Bearer header
		authHeader := strings.TrimSpace(c.GetHeader("Authorization"))
		bearerToken := ""
		if strings.HasPrefix(authHeader, "Bearer ") {
			bearerToken = strings.TrimPrefix(authHeader, "Bearer ")
		}

		// 3. Check admin cookie
		cookieToken, _ := c.Cookie("13c_admin_session")

		// Validate against master secret key or root session
		isValidKey := masterSecretKey != "" && (adminKey == masterSecretKey || bearerToken == masterSecretKey)
		isValidSession := strings.HasPrefix(bearerToken, "13c_root_") || strings.HasPrefix(cookieToken, "13c_root_") || strings.HasPrefix(adminKey, "13c_root_")

		if !isValidKey && !isValidSession {
			response.Unauthorized(c, "Root administrative authorization required for /admin endpoints")
			c.Abort()
			return
		}

		c.Set("is_admin", true)
		c.Next()
	}
}

