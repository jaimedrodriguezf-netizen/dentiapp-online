import '@testing-library/jest-dom/vitest'

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ''
  readonly scrollMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public callback: IntersectionObserverCallback,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public options?: IntersectionObserverInit
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  observe(target: Element): void {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  unobserve(target: Element): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
})
