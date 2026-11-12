package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"

	"captain-gateway/internal/domain"
	"captain-gateway/internal/repository"
	"captain-gateway/pkg/response"
)

const ContextMerchantKey = "current_merchant"

// APIKeyAuth validates merchant X-API-KEY header
func APIKeyAuth(merchantRepo repository.MerchantRepository) gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := strings.TrimSpace(c.GetHeader("X-API-KEY"))
		if apiKey == "" {
			// Fallback to query param for checkout callbacks if needed
			apiKey = strings.TrimSpace(c.Query("api_key"))
		}

		if apiKey == "" {
			response.Unauthorized(c, "Missing X-API-KEY header")
			c.Abort()
			return
		}

		merchant, err := merchantRepo.GetByAPIKey(c.Request.Context(), apiKey)
		if err != nil {
			response.InternalServerError(c, "Failed to authenticate API key", err.Error())
			c.Abort()
			return
		}

		if merchant == nil {
			response.Unauthorized(c, "Invalid API key")
			c.Abort()
			return
		}

		c.Set(ContextMerchantKey, merchant)
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
