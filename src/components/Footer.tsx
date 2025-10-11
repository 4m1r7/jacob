"use client"

import Link from "next/link";
import { Languages, Dictionary } from "@/types";
import SectionDivider from '@/components/SectionDivider';

type pageProps = {
  lang: Languages;
  dict: Dictionary;
}

export default function Footer({ lang, dict }: pageProps) {

  // Get the main menu strings
  const menusStrings = dict.menu;

  return(
    <div className="w-full flex flex-col justify-center items-center gap-12 px-40 pt-32 pb-16">

      {/* Divider */}
      <SectionDivider title="" logo={true} />
      
      {/* Socials */}
      <div className="flex gap-16">
        <a href="" target="_blank" className="w-20 aspect-square p-5 border-[1px] border-black rounded-full">
          <img src="socials/email.svg" alt="" className="" />
        </a>
        <a href="" target="_blank" className="w-20 aspect-square p-5 border-[1px] border-black rounded-full">
          <img src="socials/youtube.svg" alt="" className="" />
        </a>
        <a href="" target="_blank" className="w-20 aspect-square p-5 border-[1px] border-black rounded-full">
          <img src="socials/instagram.svg" alt="" className="" />
        </a>
      </div>

      {/* Copyright notice */}
      <div className="text-xl font-Mirza leading-none px-28 py-3">
        {dict.footer.notice}
      </div>

    </div>
  )
}