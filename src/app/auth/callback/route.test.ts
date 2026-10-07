import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'

const mockExchangeCodeForSession = vi.fn()
const mockGetUser = vi.fn()
const mockSelect = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    auth: {
      exchangeCodeForSession: mockExchangeCodeForSession,
      getUser: mockGetUser,
    },
    from: vi.fn().mockReturnValue({
      select: mockSelect,
    }),
  })),
}))

describe('Auth Callback GET route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /login when no code is supplied', async () => {
    const request = new Request('http://localhost:3000/auth/callback')
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/login?error=No%20pudimos%20iniciar%20sesi%C3%B3n%20con%20Google.%20Por%20favor%20intent%C3%A1%20de%20nuevo.'
    )
  })

  it('redirects to /login with error when code exchange fails', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({
      error: { message: 'invalid code' },
    })

    const request = new Request('http://localhost:3000/auth/callback?code=bad-code')
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/login?error=')
  })

  it('redirects to onboarding when user is authenticated but has no tenant membership', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null })
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } })

    mockSelect.mockReturnValueOnce({
      eq: vi.fn().mockReturnValueOnce({
        maybeSingle: vi.fn().mockResolvedValueOnce({ data: null }),
      }),
    })

    const request = new Request('http://localhost:3000/auth/callback?code=valid-code')
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/onboarding')
  })

  it('redirects to tenant dashboard when user belongs to a tenant', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null })
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } })

    mockSelect.mockReturnValueOnce({
      eq: vi.fn().mockReturnValueOnce({
        maybeSingle: vi.fn().mockResolvedValueOnce({
          data: { tenants: { slug: 'clinica-dental' } },
        }),
      }),
    })

    const request = new Request('http://localhost:3000/auth/callback?code=valid-code')
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/clinica-dental/dashboard')
  })

  it('redirects to safe custom destination when redirect query param is valid relative path', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null })
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } })

    mockSelect.mockReturnValueOnce({
      eq: vi.fn().mockReturnValueOnce({
        maybeSingle: vi.fn().mockResolvedValueOnce({
          data: { tenants: { slug: 'clinica-dental' } },
        }),
      }),
    })

    const request = new Request(
      'http://localhost:3000/auth/callback?code=valid-code&redirect=/clinica-dental/settings/profile'
    )
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/clinica-dental/settings/profile'
    )
  })

  it('ignores unsafe external redirect param and defaults to tenant dashboard', async () => {
    mockExchangeCodeForSession.mockResolvedValueOnce({ error: null })
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123' } } })

    mockSelect.mockReturnValueOnce({
      eq: vi.fn().mockReturnValueOnce({
        maybeSingle: vi.fn().mockResolvedValueOnce({
          data: { tenants: { slug: 'clinica-dental' } },
        }),
      }),
    })

    const request = new Request(
      'http://localhost:3000/auth/callback?code=valid-code&redirect=https://malicious-site.com'
    )
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/clinica-dental/dashboard')
  })
})
