import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="brutal-border border-t-0 border-l-0 border-r-0 grid grid-cols-3 divide-x-4 divide-black bg-white">
        <div className="p-4 flex flex-col justify-between">
          <span className="text-xs font-bold">VOL. 01</span>
          <div className="flex items-center gap-2 mt-4">
            <div className="size-6 bg-black"></div>
            <h1 className="font-black text-xl tracking-tighter">SANCTUARY</h1>
          </div>
        </div>
        <div className="p-4 flex flex-col justify-between">
          <span className="text-xs font-bold text-center">[SYSTEM_ACTIVE]</span>
          <nav className="flex justify-center gap-4 text-xs font-bold mt-4">
            <Link href="/operator" className="hover:underline">DASHBOARD</Link>
            <span className="text-gray-300">/</span>
            <Link href="/founder/submit" className="hover:underline">BOTTLENECKS</Link>
            <span className="text-gray-300">/</span>
            <Link href="/mentor/onboard" className="hover:underline">MENTORS</Link>
          </nav>
        </div>
        <div className="p-4 flex flex-col justify-between items-end">
          <span className="text-xs font-bold">YEAR: 2024</span>
          <div className="flex items-center gap-3 mt-4">
            <span className="text-xs font-bold">NETWORK_INTEL</span>
            <div className="size-3 bg-match-high"></div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-4xl">
          {/* Main card */}
          <div className="card-brutal bg-white">
            <div className="bg-black text-white p-4 flex items-center justify-between">
              <span className="text-lg font-black tracking-widest">▶ SANCTUARY_NETWORK_INTELLIGENCE</span>
              <span className="text-xs font-bold">V2.4</span>
            </div>

            <div className="p-12 text-center">
              <h2 className="header-block text-5xl md:text-7xl mb-6">
                FIND THE MENTOR WHO&apos;S BEEN IN YOUR EXACT SHOES
              </h2>
              <p className="text-lg font-bold text-gray-600 mb-12 max-w-2xl mx-auto normal-case">
                We match founders with mentors based on lived experience, not keywords.
                Tell us what&apos;s blocking you, and we&apos;ll find someone who&apos;s solved it before.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 brutal-border">
                <Link
                  href="/founder/submit"
                  className="p-8 bg-primary text-black hover:bg-black hover:text-white transition-colors border-r-0 md:border-r-4 border-black flex flex-col items-center justify-center gap-2 group"
                >
                  <span className="text-4xl mb-2">→</span>
                  <span className="text-2xl font-black tracking-tighter">SUBMIT_BOTTLENECK</span>
                  <span className="text-xs font-bold opacity-70">I&apos;M A FOUNDER</span>
                </Link>
                <Link
                  href="/mentor/onboard"
                  className="p-8 bg-accent-green text-white hover:bg-black transition-colors flex flex-col items-center justify-center gap-2 group"
                >
                  <span className="text-4xl mb-2">+</span>
                  <span className="text-2xl font-black tracking-tighter">ADD_EXPERIENCE</span>
                  <span className="text-xs font-bold opacity-70">I&apos;M A MENTOR</span>
                </Link>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 mt-1">
            <div className="bg-accent-cream brutal-border border-t-0 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-black text-white px-2 py-1 text-xs font-black">01</span>
                <span className="text-xs font-bold text-gray-500">PROTOCOL</span>
              </div>
              <h3 className="font-black text-lg mb-2 tracking-tighter">DESCRIBE_BOTTLENECK</h3>
              <p className="text-xs font-bold text-gray-600 normal-case">
                Tell us what&apos;s actually blocking progress. Not a pitch — the real challenge.
              </p>
            </div>
            <div className="bg-accent-pink brutal-border border-t-0 border-l-0 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-black text-white px-2 py-1 text-xs font-black">02</span>
                <span className="text-xs font-bold text-gray-500">ANALYSIS</span>
              </div>
              <h3 className="font-black text-lg mb-2 tracking-tighter">PATTERN_MATCH</h3>
              <p className="text-xs font-bold text-gray-600 normal-case">
                Our system finds mentors who&apos;ve solved problems with the same shape.
              </p>
            </div>
            <div className="bg-white brutal-border border-t-0 border-l-0 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-black text-white px-2 py-1 text-xs font-black">03</span>
                <span className="text-xs font-bold text-gray-500">EXECUTION</span>
              </div>
              <h3 className="font-black text-lg mb-2 tracking-tighter">WARM_INTRO</h3>
              <p className="text-xs font-bold text-gray-600 normal-case">
                A Sanctuary operator reviews and facilitates the introduction.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 w-full max-w-4xl flex justify-between items-center px-2">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-gray-500">AUTH: VERIFIED</span>
            <span className="text-[10px] font-bold text-gray-500">LATENCY: 14MS</span>
          </div>
          <div className="text-[10px] font-bold text-gray-500">
            NEED_ASSISTANCE? <Link href="/operator" className="underline">TALK_TO_OPERATOR</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
