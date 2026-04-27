import HomeClient from './HomeClient'
import { getDictionary } from '../dictionaries/dictionaries';
import { Languages } from '@/types';

export const metadata = {
  title: "Home | Jacob Carpet",
  description: "Jacob Carpet Store", 
};

export default async function Page({ params }: { params: Promise<{ lang: Languages }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return <HomeClient dict={dict} />;
}