package middleware

import (
	"github.com/gin-gonic/gin"
)

// LicenseEnforcement in White-Label Sovereign Mode is a passthrough (unrestricted operation).
// Allows the gateway to run 100% on-premise without external license verification or phone-home.
func LicenseEnforcement() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
	}
}
