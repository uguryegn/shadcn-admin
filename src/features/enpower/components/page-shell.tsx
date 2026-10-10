import { Link, useLocation } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { getNavGroups } from '@/components/layout/data/sidebar-data'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { type NavLink } from '@/components/layout/types'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useProgramStore } from '../store/program-store'
import { PersonaSelect, RoleSwitcher } from './role-switcher'

type PageShellProps = {
  eyebrow?: string
  title: string
  description?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  fluid?: boolean
}

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
  fluid,
}: PageShellProps) {
  return (
    <>
      <Header fixed>
        <Search
          placeholder='Ara'
          className='hidden sm:inline-flex sm:w-36 lg:w-52'
        />
        <div className='ms-auto flex items-center gap-2'>
          <PersonaSelect className='hidden sm:flex' />
          <RoleSwitcher />
          <ThemeSwitch />
        </div>
      </Header>

      <Main fluid={fluid} className='pb-28 md:pb-10'>
        <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            {eyebrow && (
              <p className='text-xs font-semibold tracking-[0.14em] text-primary uppercase'>
                {eyebrow}
              </p>
            )}
            <h1 className='font-manrope text-2xl font-extrabold tracking-tight sm:text-3xl'>
              {title}
            </h1>
            {description && (
              <p className='max-w-2xl text-sm text-muted-foreground'>
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className='flex flex-wrap items-center gap-2'>{actions}</div>
          )}
        </div>
        {children}
      </Main>

      <MobileTabBar />
    </>
  )
}

/** Mobilde başparmak erişimli alt gezinme çubuğu. */
function MobileTabBar() {
  const role = useProgramStore((s) => s.role)
  const pathname = useLocation({ select: (l) => l.pathname })
  const items = getNavGroups(role)
    .filter((g) => g.title !== 'Diğer')
    .flatMap((g) => g.items)
    .filter((i): i is NavLink => !!i.url)
    .slice(0, 4)

  return (
    <nav
      aria-label='Mobil gezinme'
      className='fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-40 rounded-2xl border bg-background/85 p-1.5 shadow-lg backdrop-blur-xl md:hidden'
    >
      <ul className='grid auto-cols-fr grid-flow-col'>
        {items.map((item) => {
          const active =
            item.url === '/'
              ? pathname === '/'
              : pathname.startsWith(String(item.url))
          const Icon = item.icon
          return (
            <li key={String(item.url)}>
              <Link
                to={item.url}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {Icon && <Icon className='size-5' />}
                <span className='line-clamp-1'>{item.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
