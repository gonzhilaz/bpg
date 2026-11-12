package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response represents standard uniform API response envelope
type Response struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
	Meta    any    `json:"meta,omitempty"`
	Error   any    `json:"error,omitempty"`
}

// Success sends HTTP 200/201 uniform success response
func Success(c *gin.Context, statusCode int, message string, data any, meta ...any) {
	var metaData any
	if len(meta) > 0 {
		metaData = meta[0]
	}

	c.JSON(statusCode, Response{
		Success: true,
		Message: message,
		Data:    data,
		Meta:    metaData,
		Error:   nil,
	})
}

// Error sends uniform error response
func Error(c *gin.Context, statusCode int, message string, err any) {
	c.JSON(statusCode, Response{
		Success: false,
		Message: message,
		Data:    nil,
		Meta:    nil,
		Error:   err,
	})
}

// BadRequest helper
func BadRequest(c *gin.Context, message string, err any) {
	Error(c, http.StatusBadRequest, message, err)
}

// NotFound helper
func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, message, nil)
}

// InternalServerError helper
func InternalServerError(c *gin.Context, message string, err any) {
	Error(c, http.StatusInternalServerError, message, err)
}

// Unauthorized helper
func Unauthorized(c *gin.Context, message string) {
	Error(c, http.StatusUnauthorized, message, nil)
}

// Forbidden helper
func Forbidden(c *gin.Context, message string) {
	Error(c, http.StatusForbidden, message, nil)
}

// ValidationError helper
func ValidationError(c *gin.Context, err any) {
	Error(c, http.StatusBadRequest, "Validation failed", err)
}

