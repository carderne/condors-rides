import { SlideWrapper } from "../slide-wrapper";
import type { WrappedData } from "../types";

export function IntroSlide({ data }: { data: WrappedData }) {
  return (
    <SlideWrapper gradient="from-pink-600 via-fuchsia-600 to-purple-700">
      <div className="animate-pulse text-6xl">🚴</div>
      <h1 className="mt-6 text-center text-4xl font-bold md:text-6xl">
        Your 2025
        <br />
        <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
          Wrapped
        </span>
      </h1>
      <p className="mt-4 text-xl text-white/80">Hey {data.user.name.split(" ")[0]}!</p>
      <p className="mt-2 text-lg text-white/60">Let&apos;s see what you&apos;ve been up to...</p>
    </SlideWrapper>
  );
}
