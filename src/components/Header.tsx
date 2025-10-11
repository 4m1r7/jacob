"use client"

import Link from "next/link";
// import Logo from "./Logo";
import { menu } from "@/lib/navigation";
import { Languages, Dictionary } from "@/types";
import { usePathname } from "next/navigation";

type pageProps = {
  lang: Languages;
  dict: Dictionary;
}

export default function Header({ lang, dict }: pageProps) {

  // Create lang switcher path
  const pathname = usePathname();
  const [_empty, _currentLang, ...rest] = pathname.split('/');
  const switchPath = `/${{ en: 'fa', fa: 'en' }[lang]}/${rest.join('/')}`;

  // Get the main menu strings
  const menusStrings = dict.menu;

  return(
    <div className="w-full fixed top-0 left-0 px-10 pt-8 z-40">

      <div className="flex justify-between items-center px-10 py-4 bg-black/30 backdrop-blur-sm border-[1px] border-white/20 rounded-full">

        {/* Logo */}
        <img src="/logo.svg" alt="" className="w-[5%]" />

        {/* Menu */}
        <nav className="h-fit flex gap-6 items-end">
          {menu.map((item) => (
            <Link
              key={item.link}
              href={`/${lang}/${item.link}`}
              className="text-2xl text-white leading-none tracking-widest font-Mirza rtl:tracking-normal"
            >
              <span className="flex translate-y-[15%]">
                {menusStrings[item.title]}
              </span>
            </Link>
          ))}
            <Link
              href={switchPath}
              className="text-2xl text-white font-Mirza leading-none tracking-widest ltr:tracking-normal"
            >
              <span className="flex translate-y-[15%]">
                {{ en: 'فارسی', fa: 'English' }[lang]}
              </span>
            </Link>
        </nav>
      </div>
    </div>
  )
}