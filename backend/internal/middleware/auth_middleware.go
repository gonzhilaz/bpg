package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"

	"13c-gateway/internal/crypto"
	"13c-gateway/internal/domain"
	"13c-gateway/internal/repository"
	"13c-gateway/pkg/response"
)

const (
	ContextMerchantKey = "current_merchant"
	ContextClaimsKey   = "current_claims"
)

// APIKeyAuth validates merchant X-API-KEY header using SHA-256 hash matching
func APIKeyAuth(merchantRepo repository.MerchantRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := strings.TrimSpace(c.GetHeader("X-API-KEY"))
		if apiKey == "" {
			apiKey = strings.TrimSpace(c.Query("api_key"))
		}

		if apiKey == "" {
			response.Unauthorized(c, "Missing X-API-KEY header")
			c.Abort()
			return
		}

		// Compute SHA-256 hash of provided key
		apiKeyHash := crypto.HashSHA256(apiKey)

		// Check against both hash and plaintext (for backward compatibility)
		merchant, err := merchantRepo.GetByAPIKeyOrHash(c.Request.Context(), apiKeyHash)
		if err != nil {
			response.InternalServerError(c, "Failed to authenticate API key", err.Error())
			c.Abort()
			return
		}

		// Fallback check on raw key
		if merchant == nil {
			merchant, _ = merchantRepo.GetByAPIKeyOrHash(c.Request.Context(), apiKey)
		}

		if merchant == nil {
			response.Unauthorized(c, "Invalid API key")
			c.Abort()
			return
		}

		if merchant.Status != "" && merchant.Status != "ACTIVE" {
			response.Forbidden(c, "Merchant account is suspended. Contact support.")
			c.Abort()
			return
		}

		c.Set(ContextMerchantKey, merchant)
		c.Next()
	}
}

// JWTAuth validates Bearer token from header or cookie
func JWTAuth(jwtSecret string, merchantRepo repository.MerchantRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenStr string
		authHeader := strings.TrimSpace(c.GetHeader("Authorization"))
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		} else if cookie, err := c.Cookie("access_token"); err == nil && cookie != "" {
			tokenStr = cookie
		}

		if tokenStr == "" {
			response.Unauthorized(c, "Authentication required. Please login.")
			c.Abort()
			return
		}

		claims, err := crypto.VerifyJWT(tokenStr, jwtSecret)
		if err != nil {
			response.Unauthorized(c, "Invalid or expired session token")
			c.Abort()
			return
		}

		merchant, err := merchantRepo.GetByID(c.Request.Context(), claims.MerchantID)
		if err != nil || merchant == nil {
			response.Unauthorized(c, "User profile not found")
			c.Abort()
			return
		}

		if merchant.Status != "" && merchant.Status != "ACTIVE" {
			response.Forbidden(c, "Account is suspended")
			c.Abort()
			return
		}

		c.Set(ContextMerchantKey, merchant)
		c.Set(ContextClaimsKey, claims)
		c.Next()
	}
}

// RequireAdmin verifies that the authenticated token has role "admin"
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		claimsVal, exists := c.Get(ContextClaimsKey)
		if !exists {
			response.Unauthorized(c, "Authentication required")
			c.Abort()
			return
		}

		claims, ok := claimsVal.(*crypto.JWTClaims)
		if !ok || claims.Role != "admin" {
			response.Forbidden(c, "Super Admin privilege required")
			c.Abort()
			return
		}
		c.Next()
	}
}

// GetCurrentMerchant extracts authenticated merchant from context
func GetCurrentMerchant(c *gin.Context) *domain.Merchant {
	if val, exists := c.Get(ContextMerchantKey); exists {
		if m, ok := val.(*domain.Merchant); ok {
			return m
		}
	}
	return nil
}
