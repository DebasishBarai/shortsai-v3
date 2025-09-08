import { ArrowRight } from "lucide-react";
import Marquee from "react-fast-marquee";
import Image from "next/image";

export const HeroSection = () => {
  const images = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="h-[80vh] w-full flex flex-col justify-center items-center text-center px-4">

      {/* Marquee with images */}
      <div className="absolute top-[15%] inset-0 z-0">
        <Marquee gradient={false} speed={50}>
          {images.map((i) => (
            <div key={i} className="mx-6">
              <Image
                src={`/marquee/slider${i}.webp`}
                alt={`Slider ${i}`}
                width={300}
                height={400}
                className="w-[300px] h-[500px] object-cover rounded-xl mx-5 opacity-50"
              />
            </div>
          ))}
        </Marquee>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <h1 className="z-20 text-4xl md:text-6xl font-light leading-tight mb-4">
        Create Stunning{" "}
        <strong className="font-bold">Movies &amp; Episodes</strong> With <br />
        <span className="text-pink-400">AI-Powered Storytelling</span>
      </h1>

      <p className="z-20 max-w-2xl text-lg md:text-xl text-gray-300 mb-6">
        Bring your stories to life with AI: craft web series, generate unique
        character visuals, produce short narrated videos, and access a suite of
        creative tools — all in one place.
      </p>

      {/* Call to action */}
      <div className="z-20 px-2 p-2 border rounded-full flex gap-5 items-center bg-secondary">
        <span className="text-sm font-normal w-[150px] md:w-[250px] lg:w-[450px] text-start px-4"></span>

        <a href="/dashboard">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow hover:bg-primary/90 h-8 px-3 text-xs rounded-full bg-gradient-to-r from-[#BE575F] via-[#A338E3] to-[#AC76D6] text-white">
            Try Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </a>
      </div>
    </div>
  );
};
