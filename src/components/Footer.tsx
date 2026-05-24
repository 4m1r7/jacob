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
    <div className="w-full flex flex-col justify-center items-center gap-12 px-4 md:px-40 pt-16 md:pt-32 pb-8 md:pb-16">

      {/* Divider */}
      <SectionDivider title="" logo={true} />
      
      {/* Socials */}
      <div className="flex gap-4 md:gap-8">
        <a href="https://wa.me/+9891220368203" target="_blank" className="w-14 md:w-20 aspect-square p-3 md:p-5 border-[1px] border-black rounded-full">
          <img src="/socials/whatsapp.svg" alt="" className="" />
        </a>
        <a href="" target="_blank" className="w-14 md:w-20 aspect-square p-3 md:p-5 border-[1px] border-black rounded-full">
          <img src="/socials/email.svg" alt="" className="" />
        </a>
        <a href="" target="_blank" className="w-14 md:w-20 aspect-square p-3 md:p-5 border-[1px] border-black rounded-full">
          <img src="/socials/youtube.svg" alt="" className="" />
        </a>
        <a href="" target="_blank" className="w-14 md:w-20 aspect-square p-3 md:p-5 border-[1px] border-black rounded-full">
          <img src="/socials/instagram.svg" alt="" className="" />
        </a>
      </div>

      {/* Copyright notice */}
      <div className="md:text-xl text-center font-Mirza leading-none px-4 md:px-28 py-3">
        {dict.footer.notice}
      </div>

    </div>
  )
}