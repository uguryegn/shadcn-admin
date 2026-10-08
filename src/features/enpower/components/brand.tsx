import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { COHORT } from '../data/program'

/** Kurgusal ENPower Compass logosu: pusula iğnesi + enerji kıvılcımı. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 32 32'
      aria-hidden='true'
      className={cn('size-8', className)}
    >
      <defs>
        <linearGradient id='enp-g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stopColor='var(--sidebar-primary)' />
          <stop offset='100%' stopColor='var(--spark)' />
        </linearGradient>
      </defs>
      <rect width='32' height='32' rx='9' fill='url(#enp-g)' />
      <circle
        cx='16'
        cy='16'
        r='9'
        fill='none'
        stroke='var(--sidebar-primary-foreground)'
        strokeOpacity='0.35'
        strokeWidth='1.5'
      />
      <path
        d='M17.5 7.5 11 17.2h4.6L14.5 24.5 21 14.8h-4.6z'
        fill='var(--sidebar-primary-foreground)'
      />
    </svg>
  )
}

export function SidebarBrand() {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size='lg' asChild>
          <Link to='/' onClick={() => setOpenMobile(false)}>
            <BrandMark className='shrink-0' />
            <div className='grid flex-1 text-start leading-tight'>
              <span className='truncate font-manrope text-[15px] font-extrabold tracking-tight'>
                ENPower <span className='text-sidebar-primary'>Compass</span>
              </span>
              <span className='truncate text-xs opacity-70'>{COHORT.name}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
