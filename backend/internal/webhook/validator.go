package webhook

import (
	"errors"
	"fmt"
	"net"
	"net/url"
	"strings"
)

var (
	ErrInvalidWebhookURL = errors.New("invalid webhook URL format")
	ErrSSRFBlocked       = errors.New("SSRF security policy: private, loopback, and internal network destinations are forbidden")
	AllowLocalhostForTesting = false
)

// ValidateSafeWebhookURL checks whether a URL is a valid public endpoint and defends against SSRF
func ValidateSafeWebhookURL(rawURL string) error {
	rawURL = strings.TrimSpace(rawURL)
	if rawURL == "" {
		return errors.New("empty webhook URL")
	}

	parsed, err := url.ParseRequestURI(rawURL)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrInvalidWebhookURL, err)
	}

	// Strictly allow HTTP and HTTPS only
	scheme := strings.ToLower(parsed.Scheme)
	if scheme != "http" && scheme != "https" {
		return fmt.Errorf("%w: scheme '%s' not supported (only http/https)", ErrInvalidWebhookURL, scheme)
	}

	host := parsed.Hostname()
	if host == "" {
		return fmt.Errorf("%w: missing hostname", ErrInvalidWebhookURL)
	}

	// Block standard loopback and internal hostname aliases
	lowerHost := strings.ToLower(host)
	if !AllowLocalhostForTesting && (lowerHost == "localhost" ||
		strings.HasSuffix(lowerHost, ".localhost") ||
		strings.HasSuffix(lowerHost, ".local") ||
		strings.HasSuffix(lowerHost, ".internal") ||
		strings.HasSuffix(lowerHost, ".corp")) {
		return fmt.Errorf("%w: hostname '%s' is prohibited", ErrSSRFBlocked, host)
	}

	// Check if host is direct IP address
	if ip := net.ParseIP(host); ip != nil {
		if isForbiddenIP(ip) {
			return fmt.Errorf("%w: IP '%s' is an internal or reserved address", ErrSSRFBlocked, host)
		}
		return nil
	}

	// Resolve hostname to IPs to prevent DNS rebinding and private IP domain spoofing
	ips, err := net.LookupIP(host)
	if err != nil {
		return nil
	}

	for _, ip := range ips {
		if isForbiddenIP(ip) {
			return fmt.Errorf("%w: domain '%s' resolves to prohibited IP '%s'", ErrSSRFBlocked, host, ip.String())
		}
	}

	return nil
}

func isForbiddenIP(ip net.IP) bool {
	if AllowLocalhostForTesting && (ip.IsLoopback() || (ip.To4() != nil && ip.To4()[0] == 127)) {
		return false
	}

	if ip.IsLoopback() ||
		ip.IsPrivate() ||
		ip.IsLinkLocalUnicast() ||
		ip.IsLinkLocalMulticast() ||
		ip.IsUnspecified() {
		return true
	}

	// Specific check for AWS/GCP/Azure link-local metadata IP 169.254.169.254
	if ip4 := ip.To4(); ip4 != nil {
		if ip4[0] == 169 && ip4[1] == 254 {
			return true
		}
		if ip4[0] == 127 {
			return true
		}
		if ip4[0] == 0 {
			return true
		}
	}

	return false
}
