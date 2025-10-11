import en from '@/app/dictionaries/en.json';
import fa from '@/app/dictionaries/fa.json';

const dictionaries = { en, fa };

export function getDictionary(locale: 'en' | 'fa') {
  return dictionaries[locale];
}
