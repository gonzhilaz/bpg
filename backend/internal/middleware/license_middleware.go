package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"13c-gateway/internal/license"
)

// LicenseEnforcement ensures the gateway does not process transactions if unlicensed or revoked
func LicenseEnforcement() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path

		// Whitelist public health, swagger, and license activation endpoints
		if path == "/health" ||
			strings.HasPrefix(path, "/swagger") ||
			strings.HasPrefix(path, "/api/v1/license") {
			c.Next()
			return
		}

		mgr := license.GetManager()
		isOp, reason := mgr.IsOperational()
		if !isOp {
			c.AbortWithStatusJSON(http.StatusPaymentRequired, gin.H{
				"success": false,
				"error":   "LICENSE_REQUIRED",
				"message": reason,
				"meta": gin.H{
					"code":        402,
					"status":      mgr.GetStatus()["status"],
					"instruction": "Please activate a valid enterprise license key to unlock 13C Payment Gateway.",
				},
			})
			return
		}

		c.Next()
	}
}
