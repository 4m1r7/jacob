import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center gap-[32px] relative">

      {/* Background */}
      <video
        src="/home/khaje-ataa.mp4"
        poster="/home/khaje-ataa.jpg"
        className="absolute top-0 left-0 w-full h-full object-cover"
        muted
        autoPlay
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-black/40" />

      <div className="flex flex-col justify-center items-center gap-5 relative">
        <img src="/logo.png" alt="Khaje Ata Logo" className="w-40" />
        <h1 className="text-5xl text-white font-medium font-Vazirmatn">دیدار نزدیک است...</h1>

        {/* Social links */}
        <div className="flex items-center gap-7 invert">
          <a href="mailto:khajeatafestival@gmail.com">
            <img src="/socials/email.svg" alt="" className="w-8" />
          </a>
          <a href="https://www.youtube.com/@Khajeata">
            <img src="/socials/youtube.svg" alt="" className="w-9" />
          </a>
          <a href="https://www.instagram.com/khaajeata/?hl=en">
            <img src="/socials/instagram.svg" alt="" className="w-7" />
          </a>
        </div>
      </div>
    </main>
  );
}
