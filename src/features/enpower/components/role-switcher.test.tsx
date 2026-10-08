import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { useProgramStore } from '../store/program-store'
import { RoleSwitcher } from './role-switcher'

const navigate = vi.fn()

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return { ...actual, useNavigate: () => navigate }
})

describe('RoleSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useProgramStore.getState().setRole('mt')
  })

  it('switches role and returns to the role home', async () => {
    const { getByRole } = await render(<RoleSwitcher />)
    await expect
      .element(getByRole('radio', { name: 'MT' }))
      .toHaveAttribute('aria-checked', 'true')

    await userEvent.click(getByRole('radio', { name: 'İK' }))

    expect(useProgramStore.getState().role).toBe('hr')
    expect(navigate).toHaveBeenCalledWith({ to: '/' })
    await expect
      .element(getByRole('radio', { name: 'İK' }))
      .toHaveAttribute('aria-checked', 'true')
  })

  it('does not navigate when the active role is clicked', async () => {
    const { getByRole } = await render(<RoleSwitcher />)
    await userEvent.click(getByRole('radio', { name: 'MT' }))
    expect(navigate).not.toHaveBeenCalled()
  })
})
