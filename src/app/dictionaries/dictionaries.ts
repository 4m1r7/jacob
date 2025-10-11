import 'server-only'
 
const dictionaries = {
  en: () => import('@/app/dictionaries/en.json').then((module) => module.default),
  fa: () => import('@/app/dictionaries/fa.json').then((module) => module.default),
}
 
export const getDictionary = async (locale: 'en' | 'fa') =>
  dictionaries[locale]()