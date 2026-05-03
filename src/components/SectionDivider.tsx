type pageProps = {
  title: string;
  classes?: string;
  logo?: boolean;
}

export default function Header({ title, logo, classes }: pageProps) {

  return(
    <div className={`w-full flex items-center ${classes ? classes : ''}`}>
      <img src="/ornament.svg" alt="" className="w-6" />

      <div className="flex-grow h-[1px] bg-black" />

      {logo ? (
        <img src="/logo.svg" alt="" className="w-60 invert px-24 py-2 rounded-full border-[1px] border-white" />
      ) : (
        <h2 className="px-24 py-2 rounded-full border-[1px] border-black">
          <div className="text-3xl font-Mirza font-medium leading-none translate-y-[15%]">
            {title}
          </div>
        </h2>
      )}

      <div className="flex-grow h-[1px] bg-black" />

      <img src="/ornament.svg" alt="" className="w-6" />
    </div>
  )
}