import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { submitBottleneck, createStartup } from '@/lib/api';

type Step = 'info' | 'bottleneck' | 'submitting' | 'done';

export default function FounderSubmit() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('info');
  const [error, setError] = useState<string | null>(null);

  // Founder info
  const [founderName, setFounderName] = useState('');
  const [email, setEmail] = useState('');
  const [startupName, setStartupName] = useState('');
  const [stage, setStage] = useState('PRE_SEED');
  const [teamSize, setTeamSize] = useState('');

  // Bottleneck
  const [rawBlocker, setRawBlocker] = useState('');
  const [rawAttempts, setRawAttempts] = useState('');
  const [rawSuccessCriteria, setRawSuccessCriteria] = useState('');
  const [priority, setPriority] = useState('STANDARD');

  // Result
  const [bottleneckId, setBottleneckId] = useState<string | null>(null);

  const handleSubmit = async () => {
    setStep('submitting');
    setError(null);

    try {
      const startup = await createStartup({
        name: startupName,
        founderName,
        email,
        stage,
        teamSize: teamSize ? parseInt(teamSize, 10) : undefined,
      });

      const result = await submitBottleneck({
        startupId: startup.id,
        rawBlocker,
        rawAttempts,
        rawSuccessCriteria,
        stage,
        teamSize: teamSize ? parseInt(teamSize, 10) : undefined,
      });

      setBottleneckId(result.id);
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStep('bottleneck');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="brutal-border border-t-0 border-l-0 border-r-0 grid grid-cols-3 divide-x-4 divide-black bg-white">
        <div className="p-4 flex flex-col justify-between">
          <span className="text-xs font-bold">VOL. 01</span>
          <div className="flex items-center gap-2 mt-4">
            <div className="size-6 bg-black"></div>
            <Link href="/" className="font-black text-xl tracking-tighter">SANCTUARY</Link>
          </div>
        </div>
        <div className="p-4 flex flex-col justify-between">
          <span className="text-xs font-bold text-center">[SYSTEM_ACTIVE]</span>
          <nav className="flex justify-center gap-4 text-xs font-bold mt-4">
            <Link href="/operator" className="hover:underline">DASHBOARD</Link>
            <span className="text-gray-300">/</span>
            <span className="underline text-primary">BOTTLENECKS</span>
            <span className="text-gray-300">/</span>
            <Link href="/mentor/onboard" className="hover:underline">MENTORS</Link>
          </nav>
        </div>
        <div className="p-4 flex flex-col justify-between items-end">
          <span className="text-xs font-bold">YEAR: 2024</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-4xl">
          {/* Step 1: Info */}
          {step === 'info' && (
            <div className="card-brutal bg-white">
              <div className="bg-black text-white p-4 flex items-center justify-between">
                <span className="text-lg font-black tracking-widest">▶ ENTITY_REGISTRATION</span>
                <span className="text-xs font-bold">STEP_01</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-8 grid-cell border-b-0 bg-white">
                  <h2 className="header-block text-3xl mb-6">REGISTER_STARTUP</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="label-brutal">FOUNDER_NAME</label>
                      <input
                        type="text"
                        className="input-brutal"
                        value={founderName}
                        onChange={(e) => setFounderName(e.target.value)}
                        placeholder="ENTER NAME..."
                      />
                    </div>

                    <div>
                      <label className="label-brutal">EMAIL_ADDRESS</label>
                      <input
                        type="email"
                        className="input-brutal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="FOUNDER@STARTUP.COM"
                      />
                    </div>

                    <div>
                      <label className="label-brutal">STARTUP_NAME</label>
                      <input
                        type="text"
                        className="input-brutal"
                        value={startupName}
                        onChange={(e) => setStartupName(e.target.value)}
                        placeholder="ENTER STARTUP NAME..."
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 flex flex-col">
                  <div className="grid-cell bg-accent-cream flex-1">
                    <label className="label-brutal">STATUS / STAGE</label>
                    <select
                      className="input-brutal mt-2"
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                    >
                      <option value="PRE_SEED">PRE-SEED / BUILD</option>
                      <option value="SEED">SEED / GROWTH</option>
                      <option value="SERIES_A">SERIES A / SCALE</option>
                      <option value="SERIES_B_PLUS">SERIES B+</option>
                    </select>
                  </div>
                  <div className="grid-cell bg-accent-green text-white border-r-0">
                    <label className="label-brutal text-white/70">TEAM_SIZE</label>
                    <input
                      type="number"
                      className="input-brutal bg-transparent border-white text-white placeholder:text-white/50 mt-2"
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t-4 border-black">
                <button
                  className="btn-brutal w-full border-0"
                  onClick={() => setStep('bottleneck')}
                  disabled={!founderName || !email || !startupName}
                >
                  <span>CONTINUE</span>
                  <span className="text-4xl">→</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Bottleneck */}
          {step === 'bottleneck' && (
            <div className="card-brutal bg-white">
              <div className="bg-black text-white p-4 flex items-center justify-between">
                <span className="text-lg font-black tracking-widest">▶ SUBMIT_BOTTLENECK_01</span>
                <span className="text-xs font-bold">STRICT_MATCHING: ON</span>
              </div>

              {error && (
                <div className="bg-match-low text-white p-4 text-sm font-bold">
                  ERROR: {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12">
                <div className="md:col-span-8 grid-cell border-b-0 bg-white">
                  <div className="flex justify-between items-center mb-6">
                    <span className="bg-black text-white px-2 py-1 text-xs font-bold">ENTRY_FIELD</span>
                    <span className="text-[10px] font-bold text-gray-400">MIN_CHARS: 50</span>
                  </div>

                  <h2 className="header-block text-2xl mb-4">WHAT&apos;S BLOCKING PROGRESS RIGHT NOW?</h2>
                  <textarea
                    className="textarea-brutal h-[200px] text-lg normal-case"
                    value={rawBlocker}
                    onChange={(e) => setRawBlocker(e.target.value)}
                    placeholder="DESCRIBE THE TECHNICAL OR STRATEGIC HURDLE..."
                  />

                  <div className="mt-6">
                    <label className="label-brutal">WHAT HAVE YOU ALREADY TRIED?</label>
                    <textarea
                      className="textarea-brutal h-[100px] normal-case"
                      value={rawAttempts}
                      onChange={(e) => setRawAttempts(e.target.value)}
                      placeholder="LIST PREVIOUS ATTEMPTS AND OUTCOMES..."
                    />
                  </div>

                  <div className="mt-6">
                    <label className="label-brutal">SUCCESS_CRITERIA (14 DAYS)</label>
                    <textarea
                      className="textarea-brutal h-[80px] normal-case"
                      value={rawSuccessCriteria}
                      onChange={(e) => setRawSuccessCriteria(e.target.value)}
                      placeholder="DEFINE WHAT SUCCESS LOOKS LIKE..."
                    />
                  </div>

                  <div className="mt-6 pt-4 border-t-2 border-dashed border-black">
                    <p className="text-[10px] font-bold text-gray-600">
                      PROMPT: DEFINE SPECIFICITY OF PROBLEM // OUTLINE PREVIOUS ATTEMPTS // LIST REQUIRED EXPERTISE.
                    </p>
                  </div>
                </div>

                <div className="md:col-span-4 flex flex-col">
                  <div className="grid-cell bg-accent-cream flex-1">
                    <span className="label-brutal">STARTUP</span>
                    <p className="text-lg font-black mt-2">{startupName}</p>
                    <p className="text-xs font-bold text-gray-500 mt-1">{stage.replace('_', ' ')}</p>
                  </div>
                  <div className="grid-cell bg-accent-green text-white">
                    <span className="label-brutal text-white/70">PRIORITY_LEVEL</span>
                    <div className="flex flex-col gap-2 mt-4">
                      {['LOW', 'STANDARD', 'CRITICAL'].map((p) => (
                        <label key={p} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="priority"
                            checked={priority === p}
                            onChange={() => setPriority(p)}
                            className="hidden peer"
                          />
                          <div className="size-4 border-2 border-white peer-checked:bg-white transition-all"></div>
                          <span className={`text-sm font-black ${priority === p ? 'opacity-100' : 'opacity-60'}`}>
                            {p}_PRIORITY
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid-cell bg-black flex items-center justify-center p-8 border-r-0">
                    <div className="size-16 rounded-full border-[8px] border-white flex items-center justify-center">
                      <div className="size-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 border-t-4 border-black">
                <div className="md:col-span-4 p-4 border-r-4 border-black">
                  <button
                    className="btn-brutal-outline w-full"
                    onClick={() => setStep('info')}
                  >
                    ← BACK
                  </button>
                </div>
                <div className="md:col-span-8 p-0">
                  <button
                    className="btn-brutal w-full border-0"
                    onClick={handleSubmit}
                    disabled={!rawBlocker || !rawAttempts || !rawSuccessCriteria}
                  >
                    <span>FIND_MENTORS</span>
                    <span className="text-4xl">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submitting */}
          {step === 'submitting' && (
            <div className="card-brutal bg-white p-12 text-center">
              <div className="animate-pulse">
                <div className="size-24 border-8 border-black mx-auto mb-8 flex items-center justify-center">
                  <div className="size-8 bg-primary animate-bounce"></div>
                </div>
              </div>
              <h2 className="header-block text-3xl mb-4">ANALYZING_BOTTLENECK...</h2>
              <p className="text-sm font-bold text-gray-600">
                STRUCTURING SUBMISSION AND FINDING PATTERN MATCHES
              </p>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="card-brutal bg-white">
              <div className="bg-match-high text-black p-4 flex items-center justify-between">
                <span className="text-lg font-black tracking-widest">✓ SUBMISSION_COMPLETE</span>
                <span className="text-xs font-bold">STATUS: PROCESSING</span>
              </div>
              <div className="p-12 text-center">
                <div className="size-24 bg-match-high mx-auto mb-8 flex items-center justify-center brutal-border">
                  <span className="text-5xl">✓</span>
                </div>
                <h2 className="header-block text-3xl mb-4">BOTTLENECK_SUBMITTED</h2>
                <p className="text-sm font-bold text-gray-600 mb-8 normal-case">
                  We&apos;re finding mentors who&apos;ve been in your shoes. A Sanctuary operator will review the matches and reach out with an introduction.
                </p>
                <div className="bg-accent-cream brutal-border p-4 inline-block">
                  <span className="text-xs font-bold text-gray-500">BOTTLENECK_ID:</span>
                  <span className="text-sm font-black ml-2">{bottleneckId}</span>
                </div>
              </div>
              <div className="border-t-4 border-black">
                <Link href="/" className="btn-brutal w-full border-0">
                  <span>RETURN_HOME</span>
                  <span className="text-4xl">→</span>
                </Link>
              </div>
            </div>
          )}
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
