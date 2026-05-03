"use client"

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
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
  const isHome = rest.length === 0 || rest.join('/') === '';

  // Get the main menu strings
  const menusStrings = dict.menu;

  // Scroll logic
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  const showScrolled = !isHome || scrolled;

  return(
    <motion.header
      className="w-full fixed top-0 left-0 z-40"
      initial={false}
    >

      <motion.div
        initial={{
          backgroundColor: "rgba(0,0,0,0)",
        }}
        animate={{
          backgroundColor: showScrolled ? "rgba(231, 225, 218, 1)" : "rgba(0,0,0,0)",
        }}
        transition={{
          duration: 0.1,
          ease: "linear",
        }}
        className={`flex justify-between items-center px-10 transition-all border-black ${
          showScrolled ? "border-b-[.5px] duration-200" : "border-b-0 duration-75"
        }`}
      >

        {/* Logo */}
        <Link href={`/${lang}`} className="flex justify-center items-center relative">
          <img
            src="/logo.svg"
            alt="logo"
            className="w-[5vw] opacity-0"
          />
          {showScrolled && (
            <motion.img
              layoutId="main-logo"
              src="/logo.svg"
              alt="logo"
              className="absolute w-[3vw] brightness-0 saturate-100"
              transition={{ duration: showScrolled ? .75 : 0, ease: "easeInOut" }}
            />
          )}
        </Link>

        {/* Menu */}
        <nav className="w-fit flex items-center gap-6">
          {menu.map((item) => (
            <Link
              key={item.link}
              href={`/${lang}/${item.link}`}
              className={`text-2xl leading-none tracking-widest font-Mirza rtl:tracking-normal
                  ${showScrolled ? 'text-black' : 'text-white'}
                `}
            >
              {menusStrings[item.title]}
            </Link>
          ))}
          <Link
            href={switchPath}
            className={`text-2xl font-Mirza leading-none tracking-widest ltr:tracking-normal
                ${showScrolled ? 'text-black' : 'text-white'}
              `}
          >
            {{ en: 'فارسی', fa: 'English' }[lang]}
          </Link>
        </nav>
      </motion.div>
    </motion.header>
  )
}