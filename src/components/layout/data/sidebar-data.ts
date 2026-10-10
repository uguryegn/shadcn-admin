import {
  CalendarRange,
  Compass,
  Gauge,
  HelpCircle,
  LayoutGrid,
  Map,
  MessageCircleHeart,
  Settings,
  Sun,
  Users,
} from 'lucide-react'
import { type Role } from '@/features/enpower/store/program-store'
import { type NavGroup } from '../types'

const otherGroup: NavGroup = {
  title: 'Diğer',
  items: [
    { title: 'Ayarlar', url: '/settings', icon: Settings },
    { title: 'Yardım Merkezi', url: '/help-center', icon: HelpCircle },
  ],
}

const navByRole: Record<Role, NavGroup[]> = {
  mt: [
    {
      title: 'Yolculuğum',
      items: [
        { title: 'Bugün', url: '/', icon: Sun },
        { title: '18 Ay Yolculuk', url: '/journey', icon: CalendarRange },
        { title: 'Rotasyon Haritası', url: '/rotation-map', icon: Map },
      ],
    },
  ],
  coach: [
    {
      title: 'Koçluk',
      items: [
        { title: 'Koçluk Masası', url: '/', icon: Compass },
        {
          title: 'Seans Hazırlığı',
          url: '/coaching',
          icon: MessageCircleHeart,
        },
        { title: 'Yolculuklar', url: '/journey', icon: CalendarRange },
        { title: 'Rotasyon Haritası', url: '/rotation-map', icon: Map },
      ],
    },
  ],
  hr: [
    {
      title: 'Program',
      items: [
        { title: 'Program Kokpiti', url: '/', icon: Gauge },
        { title: 'Kohort Analitiği', url: '/cohort', icon: LayoutGrid },
        { title: 'Yerleşim Planlayıcı', url: '/rotation-map', icon: Map },
      ],
    },
    {
      title: 'Gelişim',
      items: [
        { title: 'Koçluk Görünümü', url: '/coaching', icon: Users },
        { title: 'Yolculuklar', url: '/journey', icon: CalendarRange },
      ],
    },
  ],
}

export function getNavGroups(role: Role): NavGroup[] {
  return [...navByRole[role], otherGroup]
}
