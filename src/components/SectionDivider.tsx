type pageProps = {
  title: string;
  classes?: string;
  logo?: boolean;
}

export default function Header({ title, logo, classes }: pageProps) {

  return(
    <div className={`w-full flex items-center ${classes ? classes : ''}`}>
      <img src="/ornament.svg" alt="" className="w-12" />

      <div className="flex-grow h-[1px] bg-black" />

      {logo ? (
        <img src="/logo.svg" alt="" className="w-56 invert px-20 py-3 rounded-full border-[1px] border-white" />
      ) : (
        <h2 className="text-3xl font-Mirza font-medium px-16 py-5 rounded-full border-[1px] border-black">
          {title}
        </h2>
      )}

      <div className="flex-grow h-[1px] bg-black" />

      <img src="/ornament.svg" alt="" className="w-12" />
    </div>
  )
}