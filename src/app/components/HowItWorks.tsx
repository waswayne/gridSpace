import { Search, CheckCircle, Zap, LucideIcon } from "lucide-react";

interface StepCardProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  iconBgColor: string;
}

const StepCard = ({ Icon, title, description, iconBgColor }: StepCardProps) => (
  <div className="bg-white p-8 rounded-lg shadow-sm w-full relative min-h-[246px] max-lg:pt-16 max-md:pt-8 max-md:min-h-[193px] flex flex-col items-center justify-center">
    <div className={`w-[50px] h-[50px] md:w-[70px] md:h-[70px] ${iconBgColor} rounded-full flex items-center justify-center mx-auto mb-4 absolute top-[-12%] left-1/2 -translate-x-1/2`}>
      <Icon className="w-[50%] h-[50%] text-white" />
    </div>
    <h3 className="text-[16px] md:text-[24px] font-bold text-[#121212] font-700 text-center mb-4">
      {title}
    </h3>
    <p className="text-center text-[14px] md:text-[18px] text-[#121212]">
      {description}
    </p>
  </div>
);

const steps: StepCardProps[] = [
  {
    Icon: Search,
    title: "Search & Discover",
    description: "Browse verified workspaces in your area with detailed photos, amenities and real time availability",
    iconBgColor: "bg-[#002F5B]"
  },
  {
    Icon: CheckCircle,
    title: "Book Instantly",
    description: "Reserve your perfect workspace instantly with secure payment and flexible booking options",
    iconBgColor: "bg-[#F25417]"
  },
  {
    Icon: Zap,
    title: "Work Productively",
    description: "Arrive and get productive immediately with reliable power, fast WiFi and all essential amenities",
    iconBgColor: "bg-[#002F5B]"
  }
];

export default function HowItWorks() {
  return (
    <section className="bg-[#F9F3F1] py-5">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center mx-auto mb-[60px] max-md:mb-[50px] gap-[8px] w-full max-w-[613px] px-4 md:px-0">
          <h2 className="font-inter font-bold text-[20px] md:text-[32px] leading-[29px] md:leading-[39px] text-[#002F5B] text-center">
            How GridSpace Works
          </h2>
          <p className="font-inter font-normal text-[16px] md:text-[20px] leading-[20px] md:leading-[24px] text-[#121212] text-center">
            Get access to productive workspaces in just three simple steps
          </p>
        </div>

        <div className="flex flex-col max-md:items-center max-md:gap-10 md:flex-row gap-6 md:gap-[27px] justify-between">
          {steps.map((step, index) => (
            <StepCard key={index} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}
