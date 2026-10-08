import { Link } from '@tanstack/react-router'
import { ChevronsUpDown, LogOut, RotateCcw, Settings } from 'lucide-react'
import { toast } from 'sonner'
import useDialogState from '@/hooks/use-dialog-state'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { SignOutDialog } from '@/components/sign-out-dialog'
import { ROLE_LABEL, usePersona } from '@/features/enpower/hooks/use-persona'
import {
  useProgramStore,
  type Role,
} from '@/features/enpower/store/program-store'

export function NavUser() {
  const { isMobile } = useSidebar()
  const [open, setOpen] = useDialogState()
  const persona = usePersona()
  const setRole = useProgramStore((s) => s.setRole)
  const resetDemo = useProgramStore((s) => s.resetDemo)

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              >
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarFallback className='rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground'>
                    {persona.initials}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-start text-sm leading-tight'>
                  <span className='truncate font-semibold'>{persona.name}</span>
                  <span className='truncate text-xs opacity-70'>
                    {persona.subtitle}
                  </span>
                </div>
                <ChevronsUpDown className='ms-auto size-4' />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-(--radix-dropdown-menu-trigger-width) min-w-60 rounded-lg'
              side={isMobile ? 'bottom' : 'right'}
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='text-xs text-muted-foreground'>
                Görünümü değiştir (demo)
              </DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={persona.role}
                onValueChange={(v) => setRole(v as Role)}
              >
                {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                  <DropdownMenuRadioItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link to='/settings'>
                    <Settings />
                    Ayarlar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    resetDemo()
                    toast.success('Demo verisi sıfırlandı.')
                  }}
                >
                  <RotateCcw />
                  Demo verisini sıfırla
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant='destructive'
                onClick={() => setOpen(true)}
              >
                <LogOut />
                Çıkış yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
