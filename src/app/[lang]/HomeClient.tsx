'use client';

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from "swiper/modules";
import 'swiper/css';
import SectionDivider from '@/components/SectionDivider';
import { productCategories } from '@/lib/productCategories';
import { Dictionary } from "@/types";
import { useState } from "react";

type officeProps = {
  dict: Dictionary;
}


export default function HomeClient({ dict }: officeProps) {

  // Scroll logic
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });
  
  return (
    <div>

      {/* Hero */}
      <div className="w-full aspect-square md:aspect-[2.5/1] flex justify-center items-center relative">
        <Swiper
          modules={[Autoplay]}
          slidesPerView={1}
          centeredSlides={true}
          loop={true}
          autoplay={{
            delay: 5000,
          }}
          speed={500}
          className="w-full h-full projects-slider"
        >
          {[
            "hero-slide-1.jpg",
            "hero-slide-2.jpg",
            "hero-slide-3.jpg",
            "hero-slide-4.jpg",
          ].map(img => (
            <SwiperSlide key={img}>
              <img
                src={`/home/${img}`}
                alt=""
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />

        {/* Logo */}
        {!scrolled && (
          <motion.img
            layoutId="main-logo"
            src="/logo.svg"
            alt="hero logo"
            className="absolute w-[25vw] max-w-[400px] z-10"
            transition={{ duration: 0.75, ease: "easeInOut" }}
          />
        )}
      </div>


      {/* Page Content */}
      <div className="flex flex-col items-center gap-20 px-4 md:px-40 pt-20">
        <SectionDivider title={dict.menu.products} />
        <div className="w-full flex flex-col gap-5 px-2 md:px-20">
          {productCategories.map((cat, idx) => (
            <Link
              href={cat.link}
              key={idx}
              className="w-full flex justify-between items-center py-10 px-2 md:px-16 rounded-full overflow-hidden relative group"
            >
              {/* Background image */}
              <img src={cat.image} alt={cat.title} className="absolute top-0 left-0 w-full h-full object-cover" />

              <div className="w-full flex justify-between items-center z-10">
                {/* Ornament */}
                <img src="/ornament.svg" alt={cat.title} className="w-12 invert opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Category name */}
                <h3 className="text-5xl text-white font-Mirza leading-none translate-y-[15%]">
                  {dict.products[cat.title]}
                </h3>
                
                {/* Ornament */}
                <img src="/ornament.svg" alt={cat.title} className="w-12 invert opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}