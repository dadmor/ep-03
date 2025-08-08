/* path: src/pages/student/components/layout/Background.tsx */
import React from "react";

const Background: React.FC = () => {
  return (
    <div
      aria-hidden
      className="opacity-50  pointer-events-none fixed inset-0 z-0 overflow-hidden p-0 lg:p-4 lg:pb-28 pt-0"
    >
      <div className="relative w-full h-full">
        {/* Białe tło (górna połowa widoczna na czysto) */}
        <div className="absolute inset-0 bg-white rounded-3xl" />

        {/* Warstwa kolorów z maską (od 50% w dół) */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, transparent 50%, black 70%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, transparent 50%, black 70%)",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "cover",
            maskSize: "cover",
          }}
        >
          {/* Gradient bazowy */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-yellow-300 to-purple-500 opacity-50 rounded-3xl" />

          {/* Blob-y */}
          <div className="absolute w-[60vw] h-[60vw] top-1/2 -left-1/4 bg-orange-400 rounded-full mix-blend-multiply blur-[220px] opacity-40 animate-pulse" />
          <div className="absolute w-[50vw] h-[50vw] top-[65%] left-1/2 bg-yellow-300 rounded-full mix-blend-multiply blur-[220px] opacity-40 animate-pulse" />
          <div className="absolute w-[55vw] h-[55vw] top-[75%] -right-1/4 bg-purple-500 rounded-full mix-blend-multiply blur-[220px] opacity-40 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default Background;
