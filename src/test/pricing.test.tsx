import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { PricingSection } from '../app/page'

describe('PricingSection component', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should render default monthly prices when localStorage is empty', () => {
    render(<PricingSection />)
    
    // El plan Gratis es $0
    const freePrice = screen.getAllByText('$0')
    expect(freePrice.length).toBeGreaterThanOrEqual(1)

    // El plan Standard mensual es $29
    expect(screen.getByText('$29')).toBeDefined()

    // El plan Business mensual es $79
    expect(screen.getByText('$79')).toBeDefined()
  })

  it('should toggle to annual pricing and display default annual prices', async () => {
    render(<PricingSection />)
    
    const toggleButton = screen.getByLabelText('Alternar período de facturación')
    expect(toggleButton).toBeDefined()

    // Al hacer click, alterna a facturación anual
    await act(async () => {
      fireEvent.click(toggleButton)
    })

    // El plan Gratis sigue siendo $0
    const freePrice = screen.getAllByText('$0')
    expect(freePrice.length).toBeGreaterThanOrEqual(1)

    // El plan Standard anual es $23
    expect(screen.getByText('$23')).toBeDefined()

    // El plan Business anual es $63
    expect(screen.getByText('$63')).toBeDefined()
  })

  it('should read custom prices from localStorage', () => {
    // Configurar precios personalizados en localStorage
    localStorage.setItem('pricing_free', '5')
    localStorage.setItem('pricing_standard', '35')
    localStorage.setItem('pricing_standard_annual', '28')
    localStorage.setItem('pricing_business', '99')
    localStorage.setItem('pricing_business_annual', '80')

    render(<PricingSection />)

    // Debería mostrar los precios mensuales personalizados
    expect(screen.getByText('$5')).toBeDefined()
    expect(screen.getByText('$35')).toBeDefined()
    expect(screen.getByText('$99')).toBeDefined()
  })

  it('should display custom annual prices when toggled after reading from localStorage', async () => {
    // Configurar precios personalizados en localStorage
    localStorage.setItem('pricing_free', '5')
    localStorage.setItem('pricing_standard', '35')
    localStorage.setItem('pricing_standard_annual', '28')
    localStorage.setItem('pricing_business', '99')
    localStorage.setItem('pricing_business_annual', '80')

    render(<PricingSection />)

    const toggleButton = screen.getByLabelText('Alternar período de facturación')
    
    // Cambiar a anual
    await act(async () => {
      fireEvent.click(toggleButton)
    })

    // Debería mostrar los precios anuales personalizados
    expect(screen.getByText('$5')).toBeDefined()
    expect(screen.getByText('$28')).toBeDefined()
    expect(screen.getByText('$80')).toBeDefined()
  })
})
