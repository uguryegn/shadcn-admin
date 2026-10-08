import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ACTIVE_TRAINEES, COACHES } from '../data/people'
import { ROLE_LABEL, ROLE_SHORT } from '../hooks/use-persona'
import { useProgramStore, type Role } from '../store/program-store'

const ROLES: Role[] = ['mt', 'coach', 'hr']

export function RoleSwitcher({ className }: { className?: string }) {
  const role = useProgramStore((s) => s.role)
  const setRole = useProgramStore((s) => s.setRole)
  const navigate = useNavigate()

  return (
    <div
      role='radiogroup'
      aria-label='Görünüm rolü'
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border bg-muted/60 p-0.5',
        className
      )}
    >
      {ROLES.map((r) => (
        <button
          key={r}
          type='button'
          role='radio'
          aria-checked={role === r}
          title={ROLE_LABEL[r]}
          onClick={() => {
            if (r === role) return
            setRole(r)
            navigate({ to: '/' })
          }}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
            role === r
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {ROLE_SHORT[r]}
        </button>
      ))}
    </div>
  )
}

/** MT veya koç rolünde, hangi kurgusal kişinin gözünden bakıldığını seçer. */
export function PersonaSelect({ className }: { className?: string }) {
  const role = useProgramStore((s) => s.role)
  const mtId = useProgramStore((s) => s.mtId)
  const coachId = useProgramStore((s) => s.coachId)
  const setMtId = useProgramStore((s) => s.setMtId)
  const setCoachId = useProgramStore((s) => s.setCoachId)

  if (role === 'hr') return null

  const options =
    role === 'mt'
      ? ACTIVE_TRAINEES.map((t) => ({ id: t.id, name: t.name }))
      : COACHES.map((c) => ({ id: c.id, name: c.name }))

  return (
    <Select
      value={role === 'mt' ? mtId : coachId}
      onValueChange={role === 'mt' ? setMtId : setCoachId}
    >
      <SelectTrigger
        size='sm'
        aria-label='Kişi seç'
        className={cn('h-8 w-40 rounded-full text-xs', className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
