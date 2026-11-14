package lock

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"
)

var ErrLockTimeout = errors.New("timeout acquiring distributed concurrency lock")

// LockManager handles distributed and localized key-based mutual exclusion
type LockManager interface {
	Acquire(ctx context.Context, key string, ttl time.Duration) (unlock func(), err error)
	TryAcquire(key string, ttl time.Duration) (unlock func(), acquired bool)
}

type lockEntry struct {
	mu        sync.Mutex
	expiresAt time.Time
}

type inMemoryLockManager struct {
	locks sync.Map // map[string]*lockEntry
}

var (
	defaultLockManager LockManager
	once               sync.Once
)

// GetDefaultLockManager returns a singleton in-memory distributed lock manager
func GetDefaultLockManager() LockManager {
	once.Do(func() {
		defaultLockManager = NewLockManager()
	})
	return defaultLockManager
}

// NewLockManager creates a new key-based mutual exclusion manager
func NewLockManager() LockManager {
	lm := &inMemoryLockManager{}
	go lm.cleanupStaleLocks()
	return lm
}

func (m *inMemoryLockManager) getOrCreateEntry(key string) *lockEntry {
	actual, _ := m.locks.LoadOrStore(key, &lockEntry{})
	return actual.(*lockEntry)
}

// Acquire blocks until the lock is acquired, the context cancels, or TTL expires
func (m *inMemoryLockManager) Acquire(ctx context.Context, key string, ttl time.Duration) (func(), error) {
	entry := m.getOrCreateEntry(key)

	deadline := time.Now().Add(ttl)
	ticker := time.NewTicker(15 * time.Millisecond)
	defer ticker.Stop()

	for {
		if entry.mu.TryLock() {
			entry.expiresAt = time.Now().Add(ttl)
			var unlockOnce sync.Once
			unlock := func() {
				unlockOnce.Do(func() {
					entry.mu.Unlock()
				})
			}
			return unlock, nil
		}

		select {
		case <-ctx.Done():
			return nil, ctx.Err()
		case <-ticker.C:
			if time.Now().After(deadline) {
				return nil, fmt.Errorf("%w for key '%s'", ErrLockTimeout, key)
			}
		}
	}
}

// TryAcquire attempts to acquire the lock immediately without blocking
func (m *inMemoryLockManager) TryAcquire(key string, ttl time.Duration) (func(), bool) {
	entry := m.getOrCreateEntry(key)
	if entry.mu.TryLock() {
		entry.expiresAt = time.Now().Add(ttl)
		var unlockOnce sync.Once
		unlock := func() {
			unlockOnce.Do(func() {
				entry.mu.Unlock()
			})
		}
		return unlock, true
	}
	return nil, false
}

func (m *inMemoryLockManager) cleanupStaleLocks() {
	ticker := time.NewTicker(3 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		now := time.Now()
		m.locks.Range(func(k, v any) bool {
			entry, ok := v.(*lockEntry)
			if ok && !entry.expiresAt.IsZero() && now.After(entry.expiresAt.Add(5*time.Minute)) {
				m.locks.Delete(k)
			}
			return true
		})
	}
}
