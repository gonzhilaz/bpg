package crypto

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// JWTClaims represents decoded authentication token payload
type JWTClaims struct {
	MerchantID uuid.UUID `json:"merchant_id"`
	Email      string    `json:"email"`
	Role       string    `json:"role"`
	jwt.RegisteredClaims
}

// HashPassword hashes a plaintext password using bcrypt with cost 11
func HashPassword(password string) (string, error) {
	if len(password) < 6 {
		return "", errors.New("password must be at least 6 characters")
	}
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 11)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}
	return string(bytes), nil
}

// CheckPassword compares a plaintext password against a bcrypt hash
func CheckPassword(password string, hash string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

// SignJWT creates a signed HS256 JWT valid for the specified duration
func SignJWT(merchantID uuid.UUID, email string, role string, secret string, duration time.Duration) (string, error) {
	if secret == "" {
		return "", errors.New("jwt secret cannot be empty")
	}
	claims := &JWTClaims{
		MerchantID: merchantID,
		Email:      email,
		Role:       role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   merchantID.String(),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// VerifyJWT parses and validates an HS256 JWT string
func VerifyJWT(tokenString string, secret string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}
	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid or expired token claims")
}
