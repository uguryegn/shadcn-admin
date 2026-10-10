import { type CompetencyId, type DepartmentId } from './program'

/** Tüm kişiler kurgusaldır. */

export type Coach = {
  id: string
  name: string
  title: string
  initials: string
}

export const COACHES: Coach[] = [
  { id: 'c1', name: 'Aylin Sezer', title: 'Talent Coach', initials: 'AS' },
  { id: 'c2', name: 'Burak Tan', title: 'Talent Coach', initials: 'BT' },
  { id: 'c3', name: 'Gizem Uysal', title: 'Talent Coach', initials: 'GU' },
  { id: 'c4', name: 'Okan Demirel', title: 'Talent Coach', initials: 'OD' },
]

export const HR_PERSONA = {
  name: 'Derya Akın',
  title: 'MT Program Lideri · People & Culture',
  initials: 'DA',
}

export type CompetencyScores = Record<CompetencyId, number>

export type Reflection = {
  id: string
  date: string
  text: string
}

export type Trainee = {
  id: string
  name: string
  initials: string
  background: string
  homeCity: string
  coachId: string
  buddy: string
  status: 'active' | 'left'
  leftMonth?: number
  rotations: { r1: DepartmentId; r2?: DepartmentId; r3?: DepartmentId }
  preferences: DepartmentId[]
  /** İK tarafından önceden planlanan (taslak) kalıcı rol. */
  plannedPlacement?: DepartmentId
  competencies: { m6: CompetencyScores; m12: CompetencyScores }
  /** Rotasyon kapanışlarında host yönetici puanı (1–5). */
  hostFeedback: number[]
  /** Son 8 haftalık enerji nabzı (1–5), eskiden yeniye. */
  pulse: number[]
  /** Mevcut rotasyonda tamamlanan çıktı sayısı. */
  deliverablesDone: number
  lastSessionDate: string
  nextSessionDate: string
  reflections: Reflection[]
}

const s = (
  business: number,
  systems: number,
  data: number,
  influence: number,
  ownership: number,
  safety: number
): CompetencyScores => ({
  business,
  systems,
  data,
  influence,
  ownership,
  safety,
})

export const TRAINEES: Trainee[] = [
  {
    id: 't01',
    name: 'Ece Aydın',
    initials: 'EA',
    background: 'Endüstri Mühendisliği',
    homeCity: 'İstanbul',
    coachId: 'c1',
    buddy: 'Kaan Yücel',
    status: 'active',
    rotations: { r1: 'grid', r2: 'trading', r3: 'data' },
    preferences: ['trading', 'data'],
    plannedPlacement: 'trading',
    competencies: {
      m6: s(2.8, 2.6, 3.0, 2.4, 3.1, 2.7),
      m12: s(3.4, 3.1, 3.6, 2.9, 3.5, 3.0),
    },
    hostFeedback: [4.4, 4.6],
    pulse: [4, 4, 5, 4, 4, 5, 4, 5],
    deliverablesDone: 2,
    lastSessionDate: '2026-09-24',
    nextSessionDate: '2026-10-15',
    reflections: [
      {
        id: 'r-t01-1',
        date: '2026-10-02',
        text: 'Kestirimci bakım PoC’inde saha verisinin ne kadar kirli olduğunu gördüm. Model değil veri kalitesi darboğaz.',
      },
      {
        id: 'r-t01-2',
        date: '2026-09-18',
        text: 'Paydaş sunumunda teknik detayda boğuldum; bir sonraki sefer önce “neden önemli”yi anlatacağım.',
      },
    ],
  },
  {
    id: 't02',
    name: 'Mert Kaya',
    initials: 'MK',
    background: 'İktisat',
    homeCity: 'Ankara',
    coachId: 'c1',
    buddy: 'Seda Gül',
    status: 'active',
    rotations: { r1: 'renew', r2: 'fpa', r3: 'strategy' },
    preferences: ['fpa', 'strategy'],
    plannedPlacement: 'fpa',
    competencies: {
      m6: s(3.2, 2.5, 2.8, 2.9, 2.8, 2.4),
      m12: s(3.7, 3.0, 3.2, 3.3, 3.1, 2.8),
    },
    hostFeedback: [3.9, 4.5],
    pulse: [4, 4, 4, 4, 3, 4, 4, 4],
    deliverablesDone: 2,
    lastSessionDate: '2026-09-29',
    nextSessionDate: '2026-10-20',
    reflections: [
      {
        id: 'r-t02-1',
        date: '2026-09-30',
        text: 'Due diligence’ta finans tarafını hızlı okuyorum ama teknik riskleri atlıyorum. R1 notlarıma geri döndüm.',
      },
    ],
  },
  {
    id: 't03',
    name: 'Zeynep Arslan',
    initials: 'ZA',
    background: 'Elektrik-Elektronik Mühendisliği',
    homeCity: 'İzmir',
    coachId: 'c1',
    buddy: 'Onur Akgün',
    status: 'active',
    rotations: { r1: 'supply', r2: 'cx', r3: 'esg' },
    preferences: ['renew', 'esg'],
    competencies: {
      m6: s(2.5, 3.0, 2.9, 2.2, 3.0, 3.3),
      m12: s(2.8, 3.3, 3.1, 2.4, 2.9, 3.6),
    },
    hostFeedback: [4.1, 3.4],
    pulse: [4, 4, 4, 3, 3, 2, 3, 2],
    deliverablesDone: 1,
    lastSessionDate: '2026-08-28',
    nextSessionDate: '2026-10-10',
    reflections: [
      {
        id: 'r-t03-1',
        date: '2026-09-25',
        text: 'Ankara’ya taşınma kararı yüzünden kafam dağınık. Kalıcı rolün nerede olacağını bilmemek zorluyor.',
      },
    ],
  },
  {
    id: 't04',
    name: 'Kerem Yıldız',
    initials: 'KY',
    background: 'Bilgisayar Mühendisliği',
    homeCity: 'İstanbul',
    coachId: 'c2',
    buddy: 'Melis Tok',
    status: 'active',
    rotations: { r1: 'grid', r2: 'fpa', r3: 'data' },
    preferences: ['data', 'grid'],
    plannedPlacement: 'data',
    competencies: {
      m6: s(2.4, 2.9, 3.6, 2.3, 3.2, 2.8),
      m12: s(2.9, 3.4, 4.1, 2.7, 3.6, 3.1),
    },
    hostFeedback: [4.2, 3.8],
    pulse: [5, 4, 4, 5, 4, 4, 5, 4],
    deliverablesDone: 3,
    lastSessionDate: '2026-09-30',
    nextSessionDate: '2026-10-21',
    reflections: [],
  },
  {
    id: 't05',
    name: 'Selin Doğan',
    initials: 'SD',
    background: 'İşletme',
    homeCity: 'İstanbul',
    coachId: 'c2',
    buddy: 'Arif Şen',
    status: 'active',
    rotations: { r1: 'renew', r2: 'cx', r3: 'strategy' },
    preferences: ['strategy', 'cx'],
    competencies: {
      m6: s(3.0, 2.7, 2.6, 3.4, 3.0, 2.5),
      m12: s(3.4, 3.1, 2.9, 3.9, 3.4, 2.9),
    },
    hostFeedback: [3.8, 4.7],
    pulse: [4, 5, 4, 4, 5, 4, 4, 4],
    deliverablesDone: 2,
    lastSessionDate: '2026-09-22',
    nextSessionDate: '2026-10-13',
    reflections: [],
  },
  {
    id: 't06',
    name: 'Emre Çelik',
    initials: 'EÇ',
    background: 'Makine Mühendisliği',
    homeCity: 'Bursa',
    coachId: 'c2',
    buddy: 'Deniz Kara',
    status: 'active',
    rotations: { r1: 'supply', r2: 'trading', r3: 'esg' },
    preferences: ['renew', 'grid'],
    competencies: {
      m6: s(2.6, 2.8, 2.7, 2.5, 2.9, 3.2),
      m12: s(2.9, 3.1, 3.0, 2.7, 3.0, 3.5),
    },
    hostFeedback: [4.0, 3.5],
    pulse: [4, 4, 3, 4, 3, 3, 3, 3],
    deliverablesDone: 2,
    lastSessionDate: '2026-09-16',
    nextSessionDate: '2026-10-14',
    reflections: [],
  },
  {
    id: 't07',
    name: 'Defne Koç',
    initials: 'DK',
    background: 'Uluslararası İlişkiler',
    homeCity: 'İstanbul',
    coachId: 'c3',
    buddy: 'Bora Işık',
    status: 'active',
    rotations: { r1: 'grid', r2: 'cx', r3: 'strategy' },
    preferences: ['strategy', 'esg'],
    plannedPlacement: 'strategy',
    competencies: {
      m6: s(2.9, 2.8, 2.5, 3.5, 3.2, 2.8),
      m12: s(3.5, 3.3, 3.0, 4.0, 3.6, 3.2),
    },
    hostFeedback: [4.3, 4.6],
    pulse: [5, 5, 4, 5, 5, 4, 5, 5],
    deliverablesDone: 3,
    lastSessionDate: '2026-10-01',
    nextSessionDate: '2026-10-22',
    reflections: [],
  },
  {
    id: 't08',
    name: 'Baran Öztürk',
    initials: 'BÖ',
    background: 'İstatistik',
    homeCity: 'İstanbul',
    coachId: 'c3',
    buddy: 'Ceren Avcı',
    status: 'active',
    rotations: { r1: 'renew', r2: 'trading', r3: 'data' },
    preferences: ['data', 'trading'],
    plannedPlacement: 'data',
    competencies: {
      m6: s(2.7, 2.6, 3.5, 2.2, 3.0, 2.6),
      m12: s(3.1, 3.0, 4.0, 2.5, 3.3, 2.9),
    },
    hostFeedback: [3.7, 4.2],
    pulse: [4, 4, 4, 3, 4, 4, 4, 4],
    deliverablesDone: 2,
    lastSessionDate: '2026-09-25',
    nextSessionDate: '2026-10-16',
    reflections: [],
  },
  {
    id: 't09',
    name: 'Nehir Şahin',
    initials: 'NŞ',
    background: 'Kimya Mühendisliği',
    homeCity: 'Kocaeli',
    coachId: 'c3',
    buddy: 'Yiğit Ay',
    status: 'active',
    rotations: { r1: 'supply', r2: 'fpa', r3: 'esg' },
    preferences: ['esg', 'renew'],
    competencies: {
      m6: s(2.2, 2.6, 2.4, 2.1, 2.6, 3.0),
      m12: s(2.5, 2.8, 2.6, 2.3, 2.7, 3.3),
    },
    hostFeedback: [3.5, 3.1],
    pulse: [3, 4, 3, 3, 4, 3, 3, 3],
    deliverablesDone: 0,
    lastSessionDate: '2026-09-21',
    nextSessionDate: '2026-10-12',
    reflections: [],
  },
  {
    id: 't10',
    name: 'Can Aksoy',
    initials: 'CA',
    background: 'Ekonometri',
    homeCity: 'Ankara',
    coachId: 'c4',
    buddy: 'Eda Sarı',
    status: 'active',
    rotations: { r1: 'grid', r2: 'trading', r3: 'esg' },
    preferences: ['trading', 'fpa'],
    competencies: {
      m6: s(3.0, 2.7, 3.1, 2.6, 2.7, 2.6),
      m12: s(3.4, 3.0, 3.5, 2.9, 2.8, 3.0),
    },
    hostFeedback: [3.6, 4.4],
    pulse: [4, 3, 4, 4, 3, 4, 3, 4],
    deliverablesDone: 2,
    lastSessionDate: '2026-09-10',
    nextSessionDate: '2026-10-17',
    reflections: [],
  },
  {
    id: 't11',
    name: 'İrem Polat',
    initials: 'İP',
    background: 'Matematik',
    homeCity: 'İstanbul',
    coachId: 'c4',
    buddy: 'Sarp Erol',
    status: 'active',
    rotations: { r1: 'renew', r2: 'cx', r3: 'data' },
    preferences: ['cx', 'data'],
    competencies: {
      m6: s(2.6, 2.9, 3.3, 2.8, 3.1, 2.7),
      m12: s(3.0, 3.3, 3.8, 3.2, 3.4, 3.0),
    },
    hostFeedback: [4.0, 4.3],
    pulse: [4, 4, 4, 5, 4, 4, 4, 5],
    deliverablesDone: 2,
    lastSessionDate: '2026-09-26',
    nextSessionDate: '2026-10-19',
    reflections: [],
  },
  {
    id: 't12',
    name: 'Arda Kılıç',
    initials: 'AK',
    background: 'İnşaat Mühendisliği',
    homeCity: 'İstanbul',
    coachId: 'c4',
    buddy: 'Lale Öz',
    status: 'active',
    rotations: { r1: 'supply', r2: 'fpa', r3: 'strategy' },
    preferences: ['strategy', 'grid'],
    competencies: {
      m6: s(2.8, 3.0, 2.7, 2.7, 3.3, 3.0),
      m12: s(3.2, 3.4, 3.0, 3.0, 3.7, 3.3),
    },
    hostFeedback: [4.5, 3.9],
    pulse: [4, 4, 4, 4, 4, 3, 4, 4],
    deliverablesDone: 2,
    lastSessionDate: '2026-09-28',
    nextSessionDate: '2026-10-19',
    reflections: [],
  },
  {
    id: 't13',
    name: 'Tuna Erdem',
    initials: 'TE',
    background: 'Elektrik Mühendisliği',
    homeCity: 'Ankara',
    coachId: 'c4',
    buddy: 'Mina Taş',
    status: 'left',
    leftMonth: 4,
    rotations: { r1: 'grid' },
    preferences: ['grid'],
    competencies: {
      m6: s(0, 0, 0, 0, 0, 0),
      m12: s(0, 0, 0, 0, 0, 0),
    },
    hostFeedback: [],
    pulse: [],
    deliverablesDone: 0,
    lastSessionDate: '2026-02-20',
    nextSessionDate: '2026-02-20',
    reflections: [],
  },
]

export const ACTIVE_TRAINEES = TRAINEES.filter((t) => t.status === 'active')

export function getTrainee(id: string) {
  return TRAINEES.find((t) => t.id === id)
}

export function getCoach(id: string) {
  return COACHES.find((c) => c.id === id)
}
