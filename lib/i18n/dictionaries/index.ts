import { en } from './en'
import { ar } from './ar'
import type { Locale } from '../config'

export const dictionaries = {
  en,
  ar
} as const

export type Dictionary = typeof en

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale] ?? dictionaries.en
} 