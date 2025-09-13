"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  User,
  Grid3X3,
  Monitor,
  BookOpen,
  Users,
  Handshake,
  Presentation,
  Layers,
  MapPin,
  Upload,
} from "lucide-react";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [customLocation, setCustomLocation] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (currentStep === 1 && selectedRole) {
      // Store the selected role and move to step 2
      localStorage.setItem("userRole", selectedRole);
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedPurposes.length > 0) {
      // Store the selected purposes and move to step 3
      localStorage.setItem("userPurposes", JSON.stringify(selectedPurposes));
      setCurrentStep(3);
    } else if (currentStep === 3 && (selectedLocation || customLocation)) {
      // Store the selected location and move to step 4
      const location = selectedLocation || customLocation;
      localStorage.setItem("userLocation", location);
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Complete onboarding (profile picture is optional)
      if (profilePicture) {
        localStorage.setItem("userProfilePicture", profilePicture);
      }
      router.push("/");
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      router.back();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const togglePurpose = (purpose: string) => {
    setSelectedPurposes((prev) =>
      prev.includes(purpose)
        ? prev.filter((p) => p !== purpose)
        : [...prev, purpose]
    );
  };

  const selectLocation = (location: string) => {
    setSelectedLocation(location);
    setCustomLocation(""); // Clear custom location when selecting a popular city
  };

  const popularCities = [
    "Abuja",
    "Lagos",
    "Port Harcourt",
    "Ibadan",
    "Benin",
    "Uyo",
    "Kaduna",
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F5] flex items-center justify-center p-4">
      <div className="w-full max-w-[1238px] flex flex-col items-start gap-10">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex flex-col items-center gap-3 w-full">
            <h1 className="text-[40px] font-bold text-[#002F5B] text-center leading-[48px]">
              Welcome to GridSpace
            </h1>
            <p className="text-[24px] font-normal text-[#6D6D6D] text-center leading-[29px]">
              Let&apos;s personalise your workspace experience
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col items-start gap-1.5 w-full">
            <div className="w-full h-[7px] bg-[#D9D9D9] rounded-[12px]">
              <div
                className="h-[7px] bg-[#002F5B] rounded-[12px] transition-all duration-300"
                style={{
                  width:
                    currentStep === 1
                      ? "265px"
                      : currentStep === 2
                      ? "676px"
                      : currentStep === 3
                      ? "1118px"
                      : "1241px",
                }}
              ></div>
            </div>
            <p className="text-[16px] font-normal text-[#6D6D6D] text-center leading-[19px]">
              Step {currentStep} of 4
            </p>
          </div>
        </div>

        {/* Step 1: Role Selection */}
        {currentStep === 1 && (
          <div className="flex flex-col items-start gap-6 w-full">
            <div className="flex flex-col items-start gap-10 w-full">
              {/* Looking for Spaces Card */}
              <div
                className={`w-full h-[220px] bg-white border border-[#D1D5DB] rounded-[8px] p-[70px_37px] cursor-pointer transition-all duration-200 ${
                  selectedRole === "seeker" ? "ring-2 ring-[#002F5B]" : ""
                }`}
                onClick={() => setSelectedRole("seeker")}
              >
                <div className="flex flex-row justify-center items-center gap-[637px] w-full h-[80px]">
                  <div className="flex flex-row justify-center items-center gap-6 w-[494px] h-[80px]">
                    {/* Icon */}
                    <div className="w-[80px] h-[80px] bg-[#002F5B] rounded-[8px] flex items-center justify-center">
                      <User className="w-[45.71px] h-[45.71px] text-white" />
                    </div>

                    {/* Text Content */}
                    <div className="flex flex-col justify-center items-start gap-2 w-[357px] h-[69px]">
                      <h3 className="w-[336px] h-[39px] font-semibold text-[32px] leading-[39px] text-[#002F5B]">
                        I&apos;m looking for spaces
                      </h3>
                      <p className="w-[357px] h-[22px] font-normal text-[18px] leading-[22px] text-[#686767]">
                        Find and book workspaces for your needs
                      </p>
                    </div>
                  </div>

                  {/* Radio Button */}
                  <div
                    className={`w-[33px] h-[33px] bg-white border border-[#264582] rounded-full flex items-center justify-center ${
                      selectedRole === "seeker" ? "bg-[#002F5B]" : ""
                    }`}
                  >
                    {selectedRole === "seeker" && (
                      <div className="w-[12px] h-[12px] bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Host Spaces Card */}
              <div
                className={`w-full h-[220px] bg-white border border-[#D1D5DB] rounded-[8px] p-[70px_37px] cursor-pointer transition-all duration-200 ${
                  selectedRole === "host" ? "ring-2 ring-[#002F5B]" : ""
                }`}
                onClick={() => setSelectedRole("host")}
              >
                <div className="flex flex-row justify-center items-center gap-[637px] w-full h-[80px]">
                  <div className="flex flex-row justify-center items-center gap-6 w-[494px] h-[80px]">
                    {/* Icon */}
                    <div className="w-[80px] h-[80px] bg-[#002F5B] rounded-[8px] flex items-center justify-center">
                      <Grid3X3 className="w-[45.71px] h-[45.71px] text-white" />
                    </div>

                    {/* Text Content */}
                    <div className="flex flex-col justify-center items-start gap-2 w-[336px] h-[69px]">
                      <h3 className="w-[336px] h-[39px] font-semibold text-[32px] leading-[39px] text-[#002F5B]">
                        I want to host spaces
                      </h3>
                      <p className="w-[318px] h-[22px] font-normal text-[18px] leading-[22px] text-[#686767]">
                        List your workspace and earn income
                      </p>
                    </div>
                  </div>

                  {/* Radio Button */}
                  <div
                    className={`w-[33px] h-[33px] bg-white border border-[#264582] rounded-full flex items-center justify-center ${
                      selectedRole === "host" ? "bg-[#002F5B]" : ""
                    }`}
                  >
                    {selectedRole === "host" && (
                      <div className="w-[12px] h-[12px] bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Workspace Purpose Selection */}
        {currentStep === 2 && (
          <div className="w-full h-[596px] bg-white rounded-[8px] relative">
            {/* Content Container */}
            <div className="absolute w-[1191px] h-[280px] left-[25px] top-[182px] flex flex-col items-start gap-[14px]">
              {/* Section Title */}
              <div className="absolute w-[525px] h-[73px] left-[calc(50%-525px/2-1px)] top-[-122px] flex flex-col items-center gap-3">
                <h2 className="w-[525px] h-[39px] font-bold text-[32px] leading-[39px] text-[#002F5B] text-center">
                  What will you use workspace for?
                </h2>
                <p className="w-[525px] h-[22px] font-normal text-[18px] leading-[22px] text-[#6D6D6D] text-center">
                  Select all that apply to help us recommend the best spaces
                </p>
              </div>

              {/* Purpose Options Grid */}
              <div className="flex flex-col items-start gap-[21px] w-full">
                {/* Row 1 */}
                <div className="flex flex-row items-center gap-[21px] w-full h-[84px]">
                  {/* Remote Work */}
                  <div
                    className={`w-[585px] h-[84px] bg-white border border-[#D1D5DB] rounded-[12px] p-[11px_18px] cursor-pointer transition-all duration-200 ${
                      selectedPurposes.includes("remote-work")
                        ? "ring-2 ring-[#002F5B]"
                        : ""
                    }`}
                    onClick={() => togglePurpose("remote-work")}
                  >
                    <div className="flex flex-row items-center gap-6 w-full h-[43px]">
                      <div className="w-[40px] h-[40px] bg-[#E1E1E1] rounded-[12px] flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-[#121212]" />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-0 w-[195px] h-[43px]">
                        <h3 className="w-[130px] h-[24px] font-semibold text-[20px] leading-[24px] text-[#002F5B]">
                          Remote Work
                        </h3>
                        <p className="w-[195px] h-[19px] font-normal text-[16px] leading-[19px] text-[#686767]">
                          Focus on daily work tasks
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Study Session */}
                  <div
                    className={`w-[585px] h-[84px] bg-white border border-[#D1D5DB] rounded-[12px] p-[11px_18px] cursor-pointer transition-all duration-200 ${
                      selectedPurposes.includes("study")
                        ? "ring-2 ring-[#002F5B]"
                        : ""
                    }`}
                    onClick={() => togglePurpose("study")}
                  >
                    <div className="flex flex-row items-center gap-6 w-full h-[43px]">
                      <div className="w-[40px] h-[40px] bg-[#E1E1E1] rounded-[12px] flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-[#121212]" />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-0 w-[173px] h-[43px]">
                        <h3 className="w-[139px] h-[24px] font-semibold text-[20px] leading-[24px] text-[#002F5B]">
                          Study Session
                        </h3>
                        <p className="w-[173px] h-[19px] font-normal text-[16px] leading-[19px] text-[#686767]">
                          Quiet Place for reading
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex flex-row items-center gap-[21px] w-full h-[84px]">
                  {/* Team meetings */}
                  <div
                    className={`w-[585px] h-[84px] bg-white border border-[#D1D5DB] rounded-[12px] p-[11px_18px] cursor-pointer transition-all duration-200 ${
                      selectedPurposes.includes("meetings")
                        ? "ring-2 ring-[#002F5B]"
                        : ""
                    }`}
                    onClick={() => togglePurpose("meetings")}
                  >
                    <div className="flex flex-row items-center gap-6 w-full h-[43px]">
                      <div className="w-[40px] h-[40px] bg-[#E1E1E1] rounded-[12px] flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#121212]" />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-0 w-[210px] h-[43px]">
                        <h3 className="w-[149px] h-[24px] font-semibold text-[20px] leading-[24px] text-[#002F5B]">
                          Team meetings
                        </h3>
                        <p className="w-[210px] h-[19px] font-normal text-[16px] leading-[19px] text-[#686767]">
                          Collaborate with colleagues
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Networking */}
                  <div
                    className={`w-[585px] h-[84px] bg-white border border-[#D1D5DB] rounded-[12px] p-[11px_18px] cursor-pointer transition-all duration-200 ${
                      selectedPurposes.includes("networking")
                        ? "ring-2 ring-[#002F5B]"
                        : ""
                    }`}
                    onClick={() => togglePurpose("networking")}
                  >
                    <div className="flex flex-row items-center gap-6 w-full h-[43px]">
                      <div className="w-[40px] h-[40px] bg-[#E1E1E1] rounded-[12px] flex items-center justify-center">
                        <Handshake className="w-6 h-6 text-[#121212]" />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-0 w-[183px] h-[43px]">
                        <h3 className="w-[113px] h-[24px] font-semibold text-[20px] leading-[24px] text-[#002F5B]">
                          Networking
                        </h3>
                        <p className="w-[183px] h-[19px] font-normal text-[16px] leading-[19px] text-[#686767]">
                          Meet New Professionals
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="flex flex-row items-center gap-[21px] w-full h-[84px]">
                  {/* Presentations */}
                  <div
                    className={`w-[585px] h-[84px] bg-white border border-[#D1D5DB] rounded-[12px] p-[11px_18px] cursor-pointer transition-all duration-200 ${
                      selectedPurposes.includes("presentations")
                        ? "ring-2 ring-[#002F5B]"
                        : ""
                    }`}
                    onClick={() => togglePurpose("presentations")}
                  >
                    <div className="flex flex-row items-center gap-6 w-full h-[43px]">
                      <div className="w-[40px] h-[40px] bg-[#E1E1E1] rounded-[12px] flex items-center justify-center">
                        <Presentation className="w-6 h-6 text-[#121212]" />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-0 w-[201px] h-[43px]">
                        <h3 className="w-[135px] h-[24px] font-semibold text-[20px] leading-[24px] text-[#002F5B]">
                          Presentations
                        </h3>
                        <p className="w-[201px] h-[19px] font-normal text-[16px] leading-[19px] text-[#686767]">
                          Present to Client or Teams
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Creative Work */}
                  <div
                    className={`w-[585px] h-[84px] bg-white border border-[#D1D5DB] rounded-[12px] p-[11px_18px] cursor-pointer transition-all duration-200 ${
                      selectedPurposes.includes("creative")
                        ? "ring-2 ring-[#002F5B]"
                        : ""
                    }`}
                    onClick={() => togglePurpose("creative")}
                  >
                    <div className="flex flex-row items-center gap-6 w-full h-[43px]">
                      <div className="w-[40px] h-[40px] bg-[#E1E1E1] rounded-[12px] flex items-center justify-center">
                        <Layers className="w-6 h-6 text-[#121212]" />
                      </div>
                      <div className="flex flex-col justify-center items-start gap-0 w-[269px] h-[43px]">
                        <h3 className="w-[137px] h-[24px] font-semibold text-[20px] leading-[24px] text-[#002F5B]">
                          Creative Work
                        </h3>
                        <p className="w-[269px] h-[19px] font-normal text-[16px] leading-[19px] text-[#686767]">
                          Designs and other creative projects
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Location Selection */}
        {currentStep === 3 && (
          <div className="w-full h-[596px] bg-white rounded-[8px] relative">
            {/* Content Container */}
            <div className="absolute w-[1204px] h-[476px] left-[21px] top-[60px] flex flex-col items-center gap-8">
              {/* Main Content */}
              <div className="w-[861px] h-[396px] flex flex-col items-center gap-[49px]">
                {/* Section Title */}
                <div className="w-[503px] h-[73px] flex flex-col items-center gap-3">
                  <h2 className="w-[503px] h-[39px] font-bold text-[32px] leading-[39px] text-[#002F5B] text-center">
                    Where are you based?
                  </h2>
                  <p className="w-[503px] h-[22px] font-normal text-[18px] leading-[22px] text-[#686767] text-center">
                    Tell us your primary city to show you relevant workspaces
                  </p>
                </div>

                {/* Location Input and Popular Cities */}
                <div className="w-[861px] h-[274px] flex flex-col items-center gap-10">
                  {/* Location Input Field */}
                  <div className="w-[861px] h-[84px] bg-white border border-[#D1D5DB] rounded-[8px] p-[11px_40px] flex items-center gap-[13px]">
                    <div className="w-[483px] h-[24px] flex items-center gap-[263px]">
                      <MapPin className="w-6 h-6 text-[#6D6D6D]" />
                      <input
                        type="text"
                        placeholder="Enter location or city"
                        className="flex-1 text-[20px] leading-[24px] text-[#6D6D6D] outline-none placeholder:text-[#6D6D6D]"
                        value={customLocation}
                        onChange={(e) => {
                          setCustomLocation(e.target.value);
                          setSelectedLocation(""); // Clear selected location when typing
                        }}
                      />
                    </div>
                  </div>

                  {/* Popular Cities Section */}
                  <div className="w-[599px] h-[150px] flex flex-col items-center gap-3">
                    <h3 className="w-[599px] h-[22px] font-semibold text-[18px] leading-[22px] text-[#686767] text-center">
                      Popular Cities:
                    </h3>

                    {/* Cities Grid */}
                    <div className="w-[599px] h-[116px] flex flex-col items-center gap-5">
                      {/* First Row */}
                      <div className="w-[599px] h-[48px] flex items-center gap-5">
                        {popularCities.slice(0, 5).map((city) => (
                          <button
                            key={city}
                            onClick={() => selectLocation(city)}
                            className={`px-4 py-3 rounded-[8px] transition-all duration-200 ${
                              selectedLocation === city
                                ? "bg-[#002F5B] text-white"
                                : "bg-[#F1F1F1] text-[#002F5B] hover:bg-[#E1E1E1]"
                            }`}
                          >
                            <span className="font-normal text-[20px] leading-[24px]">
                              {city}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Second Row */}
                      <div className="w-[194px] h-[48px] flex items-center gap-5">
                        {popularCities.slice(5).map((city) => (
                          <button
                            key={city}
                            onClick={() => selectLocation(city)}
                            className={`px-4 py-3 rounded-[8px] transition-all duration-200 ${
                              selectedLocation === city
                                ? "bg-[#002F5B] text-white"
                                : "bg-[#F1F1F1] text-[#002F5B] hover:bg-[#E1E1E1]"
                            }`}
                          >
                            <span className="font-normal text-[20px] leading-[24px]">
                              {city}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Profile Picture Upload */}
        {currentStep === 4 && (
          <div className="w-full h-[623px] bg-white rounded-[8px] relative">
            {/* Content Container */}
            <div className="absolute w-[318px] h-[358px] left-[calc(50%-318px/2)] top-[66px] flex flex-col items-center gap-6">
              {/* Main Content */}
              <div className="w-[318px] h-[291px] flex flex-col items-center gap-[33px]">
                {/* Section Title */}
                <div className="w-[318px] h-[73px] flex flex-col items-center gap-2">
                  <h2 className="w-[318px] h-[39px] font-bold text-[32px] leading-[39px] text-[#002F5B] text-center">
                    Add a profile picture
                  </h2>
                  <p className="w-[318px] h-[22px] font-normal text-[18px] leading-[22px] text-[#686767] text-center">
                    Help others recognise you (optional)
                  </p>
                </div>

                {/* Profile Picture Upload */}
                <div className="w-[185px] h-[185px] flex flex-col items-center gap-6">
                  {/* Profile Picture Placeholder */}
                  <div className="w-[185px] h-[185px] bg-[#EAEAEA] rounded-[100px] flex items-center justify-center p-[60px]">
                    {profilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="w-full h-full rounded-[100px] object-cover"
                      />
                    ) : (
                      <Upload className="w-20 h-20 text-[#C4C7CB]" />
                    )}
                  </div>

                  {/* Choose Picture Button */}
                  <label className="w-[152px] h-[43px] bg-white border border-[#F25417] rounded-[12px] flex items-center justify-center cursor-pointer hover:bg-[#FFF3EE] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <span className="font-bold text-[16px] leading-[19px] text-[#F25417]">
                      Choose Picture
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Skip Instruction */}
            <div className="absolute w-[583px] h-[22px] left-[calc(50%-583px/2)] top-[456.5px]">
              <p className="font-normal text-[18px] leading-[22px] text-[#686767] text-center">
                You can skip this step and add a profile photo later in your
                settings
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-row items-center gap-[994px] w-full h-[48px]">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex flex-row justify-center items-center gap-2.5 px-4 py-3 rounded-[12px] hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-[#121212]" />
            <span className="font-bold text-[16px] leading-[19px] text-[#121212]">
              Back
            </span>
          </button>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={
              currentStep === 1
                ? !selectedRole
                : currentStep === 2
                ? selectedPurposes.length === 0
                : currentStep === 3
                ? !selectedLocation && !customLocation
                : false
            }
            className={`flex flex-row justify-center items-center gap-2.5 px-4 py-3 rounded-[12px] transition-colors ${
              (
                currentStep === 1
                  ? selectedRole
                  : currentStep === 2
                  ? selectedPurposes.length > 0
                  : currentStep === 3
                  ? selectedLocation || customLocation
                  : true
              )
                ? "bg-[#F25417] hover:bg-[#E04A15] text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span className="font-bold text-[16px] leading-[19px]">
              {currentStep === 4 ? "Complete Setup" : "Continue"}
            </span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
