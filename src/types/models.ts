import type { Calculator } from 'lucide-react'

export type Level = 'Preescolar' | 'Primaria' | 'Secundaria' | 'Universidad'
export type AccountRole = 'student' | 'teacher' | 'parent'
export type DemoAccount = { name: string; email: string; role: AccountRole; ageDeclared: boolean }
export type ChildProfile = { id: number; name: string; stage: Level; year: string }
export type StageInfo = { description: string; age: string; years: string[]; subjects: string[]; goal: string; icon: typeof Calculator; color: string }
export const LEVEL_OPTIONS: Level[] = ['Preescolar', 'Primaria', 'Secundaria', 'Universidad']
