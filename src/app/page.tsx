import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Card from "@/app/components/Card";
// Button is used inside components; included implicitly.
import { Building2, UsersRound, FolderKanban } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <main>
        {/* Hero */}
        <section className=" flex items-center bg-gradient-to-b h-[588px] from-[#F25417] to-[#002F5B] text-white">
          <div className="mx-auto max-w-6xl px-4 py-28 text-center">
            <h1 className="leading-[100%] text-3xl font-extrabold sm:text-[64px]">
              Choose How You Work
            </h1>
            <p className=" leading-[100%] text-3xl font-extrabold text-[#F25417] sm:text-[64px]">
              With Gridspace
            </p>
            <p className="mx-auto mt-4 max-md:text-sm text-[24px] text-white">
              One platform. Three ways to connect with opportunities.
            </p>
          </div>
        </section>

        {/* Cards */}
        <section className="bg-[#F9F3F1]">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="grid gap-6 md:grid-cols-3">
              <Card
                title="Cowork Spaces"
                icon={<Building2 className="h-7 w-7 text-[#002F5B]" />}
                cta={{
                  label: "Explore Spaces",
                  href: "#",
                  variant: "secondary",
                }}
                className="bg-[#EDF6FF]"
              />
              <Card
                title="Rapid Recruiting"
                icon={<UsersRound className="h-7 w-7 text-[#F25419]" />}
                cta={{
                  label: "Start Recruiting",
                  href: "#",
                  variant: "primary",
                }}
                className="bg-[#FFEBE3]"
              />
              <Card
                title="Projects"
                icon={<FolderKanban className="h-7 w-7 text-[#002F5B]" />}
                cta={{
                  label: "Discover Project",
                  href: "#",
                  variant: "secondary",
                }}
                className="bg-[#EDF6FF]"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
