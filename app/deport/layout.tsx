

import Footer from "@/components/ui/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
        <div className="flex-grow p-6 lg:overflow-y-auto lg:p-12 mt-10">{children}</div>

      <Footer border={true} />
    </>
  );
}