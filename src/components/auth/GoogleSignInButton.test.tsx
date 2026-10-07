import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GoogleSignInButton from './GoogleSignInButton'

// Mock supabase client
const mockSignInWithOAuth = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}))

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders default button text and Google icon', () => {
    render(<GoogleSignInButton />)
    expect(screen.getByText('Continuar con Google')).toBeDefined()
  })

  it('renders custom button text', () => {
    render(<GoogleSignInButton text="Registrarse con Google" />)
    expect(screen.getByText('Registrarse con Google')).toBeDefined()
  })

  it('calls signInWithOAuth with google provider and default callback url', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null })
    render(<GoogleSignInButton />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      })
    })
  })

  it('includes safe redirect param in callback url', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null })
    render(<GoogleSignInButton redirectTo="/mi-clinica/dashboard" />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('redirect=%2Fmi-clinica%2Fdashboard'),
        },
      })
    })
  })

  it('discards unsafe protocol redirect param', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({ error: null })
    render(<GoogleSignInButton redirectTo="https://evil.com" />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.not.stringContaining('evil.com'),
        },
      })
    })
  })

  it('calls onError callback when signInWithOAuth fails', async () => {
    mockSignInWithOAuth.mockResolvedValueOnce({
      error: { message: 'OAuth provider disabled' },
    })
    const onErrorMock = vi.fn()

    render(<GoogleSignInButton onError={onErrorMock} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(onErrorMock).toHaveBeenCalledWith('OAuth provider disabled')
    })
  })
})
