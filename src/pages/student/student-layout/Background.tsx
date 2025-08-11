export const Background: React.FC = () => {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden p-0 lg:p-4 lg:pb-28 pt-0"
      >
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-background rounded-3xl" />
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, transparent 50%, black 70%)",
              maskImage:
                "linear-gradient(to bottom, transparent 0%, transparent 50%, black 70%)",
            }}
          >
            {/* Main gradient for base tone */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange/10 via-yellow/5 to-purple/10 rounded-3xl" />
            
            {/* Large orange blob on the left - creating concave effect */}
            <div className="absolute w-[90vw] h-[120vh] top-1/2 -translate-y-1/2 -left-[40%] bg-orange rounded-full blur-[180px] opacity-70 dark:opacity-40 animate-pulse" />
            
            {/* Large purple blob on the right - creating concave effect */}
            <div className="absolute w-[90vw] h-[120vh] top-1/2 -translate-y-1/2 -right-[40%] bg-purple rounded-full blur-[180px] opacity-70 dark:opacity-40 animate-pulse" />
            
            {/* Central yellow glow - smaller and in the middle */}
            <div className="absolute w-[40vw] h-[40vw] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow rounded-full blur-[120px] opacity-60 dark:opacity-30 animate-pulse" />
            
            {/* Additional depth layers */}
            <div className="absolute w-[60vw] h-[80vh] top-1/2 -translate-y-1/2 -left-[20%] bg-orange rounded-full blur-[200px] opacity-40 dark:opacity-20" />
            <div className="absolute w-[60vw] h-[80vh] top-1/2 -translate-y-1/2 -right-[20%] bg-purple rounded-full blur-[200px] opacity-40 dark:opacity-20" />
          </div>
        </div>
      </div>
    );
  };