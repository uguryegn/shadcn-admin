/**
 * ENPower Management Trainee programı — program tasarımı.
 * Tüm veriler kurgusaldır; gerçek bir şirketi, kişiyi veya rakamı temsil etmez.
 */

/** Prototip deterministik çalışsın diye "bugün" sabitlenir. */
export const DEMO_TODAY = new Date('2026-10-08T09:00:00')

export const COHORT = {
  name: 'ENPower MT · Kohort 2025',
  startDate: new Date('2025-11-03T09:00:00'),
  durationMonths: 18,
  /** Kurgusal program bütçesi (TL, MT başına toplam yatırım). */
  investmentPerTrainee: 1_450_000,
} as const

export type TrackId = 'operations' | 'commercial' | 'transformation'

export type PhaseId = 'bootcamp' | 'r1' | 'r2' | 'r3' | 'launch'

export type Phase = {
  id: PhaseId
  title: string
  short: string
  startMonth: number
  endMonth: number
  promise: string
  track?: TrackId
}

export const PHASES: Phase[] = [
  {
    id: 'bootcamp',
    title: 'Kampüs & Bootcamp',
    short: 'Bootcamp',
    startMonth: 1,
    endMonth: 1,
    promise: 'Değer zincirini tanı, ağını kur, buddy ile eşleş.',
  },
  {
    id: 'r1',
    title: 'Rotasyon 1 · Operasyon',
    short: 'R1 Operasyon',
    startMonth: 2,
    endMonth: 5,
    promise: 'Sahada enerjinin nasıl üretildiğini ve taşındığını öğren.',
    track: 'operations',
  },
  {
    id: 'r2',
    title: 'Rotasyon 2 · Ticari & Finans',
    short: 'R2 Ticari',
    startMonth: 6,
    endMonth: 9,
    promise: 'Enerjinin nasıl fiyatlandığını, satıldığını ve ölçüldüğünü gör.',
    track: 'commercial',
  },
  {
    id: 'r3',
    title: 'Rotasyon 3 · Dönüşüm',
    short: 'R3 Dönüşüm',
    startMonth: 10,
    endMonth: 13,
    promise: 'Şirketin yarınını tasarlayan ekiplerde iz bırak.',
    track: 'transformation',
  },
  {
    id: 'launch',
    title: 'Launchpad · Kalıcı Rol',
    short: 'Launchpad',
    startMonth: 14,
    endMonth: 18,
    promise: 'Kalıcı rolünde başla, capstone projeni üst yönetime sun.',
  },
]

export type DepartmentId =
  | 'grid'
  | 'renew'
  | 'supply'
  | 'trading'
  | 'fpa'
  | 'cx'
  | 'data'
  | 'esg'
  | 'strategy'

export type Department = {
  id: DepartmentId
  name: string
  track: TrackId
  hostManager: string
  city: string
  /** Bir rotasyon döneminde alabileceği en fazla MT. */
  rotationCapacity: number
  /** Launchpad için açık kalıcı rol sayısı. */
  openRoles: number
  deliverables: string[]
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'grid',
    name: 'Şebeke Operasyonları',
    track: 'operations',
    hostManager: 'Levent Karaca',
    city: 'Ankara',
    rotationCapacity: 5,
    openRoles: 2,
    deliverables: [
      'Arıza müdahale süreci haritası',
      'Saha ekibiyle 2 vardiya gölgeleme',
      'Kayıp-kaçak analizi',
      'İyileştirme önerisi sunumu',
    ],
  },
  {
    id: 'renew',
    name: 'Yenilenebilir Santraller',
    track: 'operations',
    hostManager: 'Pınar Ergin',
    city: 'İzmir',
    rotationCapacity: 5,
    openRoles: 1,
    deliverables: [
      'Santral performans panosu',
      'Bakım planı gözden geçirme',
      'Kapasite faktörü kök neden analizi',
      'İyileştirme önerisi sunumu',
    ],
  },
  {
    id: 'supply',
    name: 'Tedarik Zinciri',
    track: 'operations',
    hostManager: 'Hakan Oral',
    city: 'İstanbul',
    rotationCapacity: 5,
    openRoles: 0,
    deliverables: [
      'Kritik ekipman tedarik riski haritası',
      'Tedarikçi performans karnesi',
      'Stok optimizasyon analizi',
      'İyileştirme önerisi sunumu',
    ],
  },
  {
    id: 'trading',
    name: 'Enerji Ticareti',
    track: 'commercial',
    hostManager: 'Cem Ateş',
    city: 'İstanbul',
    rotationCapacity: 5,
    openRoles: 2,
    deliverables: [
      'Gün öncesi piyasa simülasyonu',
      'Fiyat tahmin modeli',
      'Risk limiti raporu',
      'Ticari öneri sunumu',
    ],
  },
  {
    id: 'fpa',
    name: 'Finansal Planlama (FP&A)',
    track: 'commercial',
    hostManager: 'Nazlı Uçar',
    city: 'İstanbul',
    rotationCapacity: 5,
    openRoles: 2,
    deliverables: [
      'Bütçe sapma analizi',
      'Yatırım geri dönüş (NPV) modeli',
      'Aylık yönetim raporu taslağı',
      'CFO ofisine öneri sunumu',
    ],
  },
  {
    id: 'cx',
    name: 'Müşteri Deneyimi',
    track: 'commercial',
    hostManager: 'Ozan Bilgin',
    city: 'İstanbul',
    rotationCapacity: 5,
    openRoles: 1,
    deliverables: [
      'Müşteri yolculuğu haritası',
      'Şikayet kök neden analizi',
      'NPS iyileştirme deneyi',
      'Ticari öneri sunumu',
    ],
  },
  {
    id: 'data',
    name: 'Dijital & Veri',
    track: 'transformation',
    hostManager: 'Elif Tunç',
    city: 'İstanbul',
    rotationCapacity: 5,
    openRoles: 2,
    deliverables: [
      'Veri ürünü keşif atölyesi',
      'Kestirimci bakım PoC',
      'Ürün yol haritası taslağı',
      'Dönüşüm sunumu',
    ],
  },
  {
    id: 'esg',
    name: 'Sürdürülebilirlik & ESG',
    track: 'transformation',
    hostManager: 'Serra Yalın',
    city: 'Ankara',
    rotationCapacity: 5,
    openRoles: 1,
    deliverables: [
      'Karbon ayak izi envanteri',
      'Paydaş beklenti analizi',
      'Net sıfır yol haritası katkısı',
      'Dönüşüm sunumu',
    ],
  },
  {
    id: 'strategy',
    name: 'Strateji & M&A',
    track: 'transformation',
    hostManager: 'Tolga Ersoy',
    city: 'İstanbul',
    rotationCapacity: 5,
    openRoles: 1,
    deliverables: [
      'Pazar giriş fizibilitesi',
      'Rakip benchmark analizi',
      'Due diligence veri odası katkısı',
      'Dönüşüm sunumu',
    ],
  },
]

export const TRACK_LABEL: Record<TrackId, string> = {
  operations: 'Operasyon',
  commercial: 'Ticari & Finans',
  transformation: 'Dönüşüm',
}

export type CompetencyId =
  | 'business'
  | 'systems'
  | 'data'
  | 'influence'
  | 'ownership'
  | 'safety'

export type Competency = {
  id: CompetencyId
  name: string
  short: string
  /** Koçun seansta kullanabileceği güçlü soru. */
  coachingQuestion: string
}

/** ENPower Liderlik Pusulası (kurgusal yetkinlik modeli). 1–5 ölçek. */
export const COMPETENCIES: Competency[] = [
  {
    id: 'business',
    name: 'İş & Finans Okuryazarlığı',
    short: 'İş & Finans',
    coachingQuestion:
      'Son önerin şirketin kâr-zarar tablosunda hangi satırı, ne kadar oynatır?',
  },
  {
    id: 'systems',
    name: 'Sistem Düşüncesi',
    short: 'Sistem',
    coachingQuestion:
      'Bu sorunu çözdüğünde zincirin başka hangi halkası etkilenir?',
  },
  {
    id: 'data',
    name: 'Veriyle Karar',
    short: 'Veri',
    coachingQuestion:
      'Hangi veri seni fikrini değiştirmeye ikna ederdi? Onu nereden bulursun?',
  },
  {
    id: 'influence',
    name: 'Etki & Paydaş Yönetimi',
    short: 'Etki',
    coachingQuestion:
      'Fikrini en çok kimin “evet”i hızlandırır? Onun için kazanım ne?',
  },
  {
    id: 'ownership',
    name: 'Sahiplik & Çeviklik',
    short: 'Sahiplik',
    coachingQuestion:
      'Kimse sormasa bile bu hafta neyi kendi başına bitirmeyi seçerdin?',
  },
  {
    id: 'safety',
    name: 'Güvenlik & Sürdürülebilirlik',
    short: 'Güvenlik',
    coachingQuestion:
      'Bu kararın 10 yıl sonraki sürdürülebilirlik etkisini nasıl anlatırsın?',
  },
]

/** Program sonunda (18. ay) beklenen yetkinlik seviyesi. */
export const COMPETENCY_TARGET = 3.5

export type MilestoneKind = 'ritual' | 'assessment' | 'showcase' | 'decision'

export type Milestone = {
  month: number
  title: string
  kind: MilestoneKind
  owner: 'MT' | 'Talent Coach' | 'İK' | 'Host Yönetici'
  description: string
}

export const MILESTONES: Milestone[] = [
  {
    month: 1,
    title: 'Kampüs haftası & buddy eşleşmesi',
    kind: 'ritual',
    owner: 'İK',
    description: 'Değer zinciri turu, CEO söyleşisi, buddy ve koç eşleşmesi.',
  },
  {
    month: 3,
    title: 'İlk 90 gün check-in',
    kind: 'assessment',
    owner: 'Talent Coach',
    description: 'Beklentiler, uyum ve gelişim planının ilk revizyonu.',
  },
  {
    month: 5,
    title: 'R1 kapanış sunumu',
    kind: 'showcase',
    owner: 'MT',
    description: 'Operasyon rotasyonundaki iyileştirme önerisinin sunumu.',
  },
  {
    month: 6,
    title: '360° gelişim değerlendirmesi',
    kind: 'assessment',
    owner: 'İK',
    description: 'Host yönetici, buddy ve akran geri bildirimi.',
  },
  {
    month: 9,
    title: 'R2 kapanış sunumu',
    kind: 'showcase',
    owner: 'MT',
    description: 'Ticari / finans rotasyonundaki önerinin sunumu.',
  },
  {
    month: 12,
    title: 'Orta dönem kalibrasyonu',
    kind: 'assessment',
    owner: 'İK',
    description:
      'Yetkinlik ve hazırlık skorlarının kohort genelinde kalibrasyonu.',
  },
  {
    month: 13,
    title: 'Yerleşim kararı',
    kind: 'decision',
    owner: 'İK',
    description: 'Tercihler, kapasite ve hazırlık birlikte değerlendirilir.',
  },
  {
    month: 14,
    title: 'Capstone kick-off',
    kind: 'ritual',
    owner: 'MT',
    description: 'Fonksiyonlar arası strateji projesi ekipleri kurulur.',
  },
  {
    month: 17,
    title: 'Üst yönetim sunumu',
    kind: 'showcase',
    owner: 'MT',
    description: 'Capstone projesinin yönetim kuruluna sunumu.',
  },
  {
    month: 18,
    title: 'Mezuniyet',
    kind: 'ritual',
    owner: 'İK',
    description: 'Program kapanışı ve kalıcı rolde ilk 90 gün planı.',
  },
]

export const LEARNING_BY_PHASE: Record<PhaseId, string[]> = {
  bootcamp: ['Enerji değer zinciri 101', 'Güvenlik kültürü', 'Kurumsal ağ'],
  r1: ['Yalın operasyon', 'Kök neden analizi', 'Saha liderliği'],
  r2: ['Finans for non-finance', 'Enerji piyasaları', 'Hikâye ile sunum'],
  r3: ['Ürün düşüncesi', 'Değişim yönetimi', 'ESG temelleri'],
  launch: ['Yönetim kurulu iletişimi', 'İlk 90 gün', 'Mentorluk vermek'],
}
