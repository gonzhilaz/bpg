package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"13c-gateway/pkg/response"
)

// HealthHandler provides health check endpoints
type HealthHandler struct {
	startTime time.Time
}

// NewHealthHandler creates HealthHandler instance
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{startTime: time.Now()}
}

// Check returns system operational status
func (h *HealthHandler) Check(c *gin.Context) {
	data := gin.H{
		"status":  "operational",
		"uptime":  time.Since(h.startTime).String(),
		"service": "13c-crypto-gateway",
		"version": "1.0.0",
	}
	response.Success(c, http.StatusOK, "Gateway is running healthy", data)
}

