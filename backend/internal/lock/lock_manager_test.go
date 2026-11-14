package lock

import (
	"context"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestLockManager_MutualExclusion(t *testing.T) {
	lm := NewLockManager()
	key := "test:invoice:123"

	var counter int64
	var wg sync.WaitGroup

	// Launch 10 parallel goroutines incrementing the counter under the same key lock
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			unlock, err := lm.Acquire(context.Background(), key, 2*time.Second)
			if err != nil {
				t.Errorf("failed to acquire lock: %v", err)
				return
			}
			defer unlock()

			// Critical section
			current := atomic.LoadInt64(&counter)
			time.Sleep(5 * time.Millisecond)
			atomic.StoreInt64(&counter, current+1)
		}()
	}

	wg.Wait()

	if counter != 10 {
		t.Fatalf("expected counter to be 10 under mutual exclusion, got %d", counter)
	}
}

func TestLockManager_Timeout(t *testing.T) {
	lm := NewLockManager()
	key := "test:locked:resource"

	// Acquire lock first
	unlock, err := lm.Acquire(context.Background(), key, 1*time.Second)
	if err != nil {
		t.Fatalf("first acquire failed: %v", err)
	}
	defer unlock()

	// Try acquiring again with a very short timeout (50ms)
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
	defer cancel()

	_, err2 := lm.Acquire(ctx, key, 500*time.Millisecond)
	if err2 == nil {
		t.Fatal("expected second acquire to fail or timeout, but it succeeded")
	}
}

func TestLockManager_TryAcquire(t *testing.T) {
	lm := NewLockManager()
	key := "test:try:resource"

	unlock, acquired := lm.TryAcquire(key, 500*time.Millisecond)
	if !acquired {
		t.Fatal("expected first TryAcquire to succeed")
	}

	_, secondAcquired := lm.TryAcquire(key, 500*time.Millisecond)
	if secondAcquired {
		t.Fatal("expected second TryAcquire to fail while lock is held")
	}

	unlock()

	unlockThird, thirdAcquired := lm.TryAcquire(key, 500*time.Millisecond)
	if !thirdAcquired {
		t.Fatal("expected TryAcquire to succeed after unlock")
	}
	unlockThird()
}

