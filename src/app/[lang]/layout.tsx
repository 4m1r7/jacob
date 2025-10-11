import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getDictionary } from "@/app/dictionaries/dictionaries";
import { Languages } from "@/types";

export async function generateStaticParams() {
  return [{ lang: "en" }, { lang: "fa" }];
}

type Props = {
  children: React.ReactNode;
  params: any;
};

export default function RootLayout({ children, params }: Props) {
  const { lang } = params as { lang: Languages };
  const dict = getDictionary(lang);

  return (
    <main dir={lang === "fa" ? "rtl" : "ltr"} className="relative bg-customLightSand">
      <Header lang={lang} dict={dict} />
      {children}
      <Footer lang={lang} dict={dict} />
    </main>
  );
}
