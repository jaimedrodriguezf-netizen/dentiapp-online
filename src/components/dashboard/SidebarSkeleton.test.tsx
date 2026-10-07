import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SidebarSkeleton from './SidebarSkeleton'

describe('SidebarSkeleton', () => {
  it('renders correctly with accessible loading indicator', () => {
    render(<SidebarSkeleton />)
    const aside = screen.getByRole('complementary', { name: /cargando menú lateral/i })
    expect(aside).toBeInTheDocument()
    expect(aside).toHaveClass('w-64')
  })

  it('renders header, navigation items and footer placeholders', () => {
    const { container } = render(<SidebarSkeleton />)
    const skeletons = container.querySelectorAll('.skeleton')
    expect(skeletons.length).toBeGreaterThan(5)
  })
})
