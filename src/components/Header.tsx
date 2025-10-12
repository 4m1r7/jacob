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

  // Get the main menu strings
  const menusStrings = dict.menu;

  // Scroll logic
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  return(
    <motion.header
      className="w-full fixed top-0 left-0 px-10 pt-8 z-40"
      initial={false}
    >

      <motion.div
        initial={{
          backgroundColor: "rgba(0,0,0,0)",
          borderColor: "rgba(255,255,255,0)",
          boxShadow: "0 0 0 rgba(0,0,0,0)",
        }}
        animate={{
          backgroundColor: scrolled ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0)",
          borderColor: scrolled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0)",
          boxShadow: scrolled ? "0 4px 12px rgba(0,0,0,0.15)" : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={{
          duration: scrolled ? 0.3 : 0.1,
          ease: "linear",
        }}
        className={`flex justify-between items-center px-10 py-4 border rounded-full transition-all ${
          scrolled ? "backdrop-blur-xs duration-200" : "backdrop-blur-0 duration-75"
        }`}
      >

        {/* Logo */}
        <div className="flex justify-center items-center relative">
          <img
            src="/logo.svg"
            alt="logo"
            className="w-[3vw] opacity-0"
          />
          {scrolled && (
            <motion.img
              layoutId="main-logo"
              src="/logo.svg"
              alt="logo"
              className="absolute w-[3vw]"
              transition={{ duration: .75, ease: "easeInOut" }}
            />
          )}
        </div>

        {/* Menu */}
        <nav className="w-fit flex items-center gap-6">
          {menu.map((item) => (
            <Link
              key={item.link}
              href={`/${lang}/${item.link}`}
              className="text-2xl text-white leading-none tracking-widest font-Mirza rtl:tracking-normal"
            >
              {menusStrings[item.title]}
            </Link>
          ))}
          <Link
            href={switchPath}
            className="text-2xl text-white font-Mirza leading-none tracking-widest ltr:tracking-normal"
          >
            {{ en: 'فارسی', fa: 'English' }[lang]}
          </Link>
        </nav>
      </motion.div>
    </motion.header>
  )
}