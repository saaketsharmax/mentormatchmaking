import { useState } from 'react';
import Link from 'next/link';
import { createMentor, submitExperience } from '@/lib/api';

type Step = 'info' | 'experience' | 'submitting' | 'done' | 'add-another';

export default function MentorOnboard() {
  const [step, setStep] = useState<Step>('info');
  const [error, setError] = useState<string | null>(null);

  // Mentor info
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Experience
  const [rawProblem, setRawProblem] = useState('');
  const [rawContext, setRawContext] = useState('');
  const [rawSolution, setRawSolution] = useState('');
  const [rawOutcomes, setRawOutcomes] = useState('');
  const [yearOccurred, setYearOccurred] = useState('');
  const [companyStage, setCompanyStage] = useState('SEED');

  // Count
  const [experienceCount, setExperienceCount] = useState(0);

  const handleCreateMentor = async () => {
    setError(null);
    try {
      const mentor = await createMentor({
        name,
        email,
        bio: bio || undefined,
        linkedinUrl: linkedinUrl || undefined,
      });
      setMentorId(mentor.id);
      setStep('experience');
    } catch (err: any) {
      setError(err.message || 'Failed to create profile');
    }
  };

  const handleSubmitExperience = async () => {
    if (!mentorId) return;

    setStep('submitting');
    setError(null);

    try {
      await submitExperience({
        mentorId,
        rawProblem,
        rawContext,
        rawSolution,
        rawOutcomes,
        yearOccurred: yearOccurred ? parseInt(yearOccurred, 10) : undefined,
        companyStage,
      });

      setExperienceCount((c) => c + 1);
      setStep('add-another');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setStep('experience');
    }
  };

  const resetExperienceForm = () => {
    setRawProblem('');
    setRawContext('');
    setRawSolution('');
    setRawOutcomes('');
    setYearOccurred('');
    setCompanyStage('SEED');
    setStep('experience');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/" className="text-sanctuary-700 font-bold">
            Sanctuary Intelligence
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Step 1: Info */}
        {step === 'info' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Join as a Mentor</h2>
            <p className="text-slate-600 mb-8">
              Help founders by sharing experiences from your journey. We match based on what you&apos;ve actually done, not titles or keywords.
            </p>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="label">Your name</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="label">Short bio (optional)</label>
                <textarea
                  className="textarea h-20"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Current role and relevant background"
                />
              </div>

              <div>
                <label className="label">LinkedIn URL (optional)</label>
                <input
                  type="url"
                  className="input"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <button
                className="btn-primary w-full"
                onClick={handleCreateMentor}
                disabled={!name || !email}
              >
                Continue to add experience
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 'experience' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Share an Experience
            </h2>
            <p className="text-slate-600 mb-8">
              Tell us about a specific hard problem you solved. The more detail you provide, the better we can match you with founders facing similar challenges.
            </p>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="label">
                  Describe a specific hard problem you personally solved
                </label>
                <textarea
                  className="textarea h-28"
                  value={rawProblem}
                  onChange={(e) => setRawProblem(e.target.value)}
                  placeholder="What was the challenge? Be specific about the problem, not just the area."
                />
                <p className="text-xs text-slate-500 mt-1">
                  Example: &quot;We needed to close our first enterprise customer but had no brand recognition, no case studies, and prospects kept ghosting after the demo.&quot;
                </p>
              </div>

              <div>
                <label className="label">
                  What was the context? (Stage, constraints, what failed first)
                </label>
                <textarea
                  className="textarea h-28"
                  value={rawContext}
                  onChange={(e) => setRawContext(e.target.value)}
                  placeholder="What stage was the company? What constraints were you working with? What did you try that didn't work?"
                />
                <p className="text-xs text-slate-500 mt-1">
                  The failed attempts are valuable &mdash; they show depth and help us avoid matching you with founders who&apos;ve already tried those things.
                </p>
              </div>

              <div>
                <label className="label">What finally worked?</label>
                <textarea
                  className="textarea h-28"
                  value={rawSolution}
                  onChange={(e) => setRawSolution(e.target.value)}
                  placeholder="What approach or actions led to success? Why did it work?"
                />
              </div>

              <div>
                <label className="label">
                  What were the outcomes? (Measurable changes, lessons learned)
                </label>
                <textarea
                  className="textarea h-20"
                  value={rawOutcomes}
                  onChange={(e) => setRawOutcomes(e.target.value)}
                  placeholder="What changed as a result? What would you tell someone facing this today?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">When did this happen?</label>
                  <input
                    type="number"
                    className="input"
                    value={yearOccurred}
                    onChange={(e) => setYearOccurred(e.target.value)}
                    placeholder="2023"
                    min="2000"
                    max="2026"
                  />
                </div>

                <div>
                  <label className="label">Company stage at the time</label>
                  <select
                    className="input"
                    value={companyStage}
                    onChange={(e) => setCompanyStage(e.target.value)}
                  >
                    <option value="PRE_SEED">Pre-seed</option>
                    <option value="SEED">Seed</option>
                    <option value="SERIES_A">Series A</option>
                    <option value="SERIES_B_PLUS">Series B+</option>
                    <option value="GROWTH">Growth</option>
                  </select>
                </div>
              </div>

              <button
                className="btn-primary w-full"
                onClick={handleSubmitExperience}
                disabled={!rawProblem || !rawContext || !rawSolution || !rawOutcomes}
              >
                Submit Experience
              </button>
            </div>
          </div>
        )}

        {/* Submitting */}
        {step === 'submitting' && (
          <div className="card text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-sanctuary-200 border-t-sanctuary-600 rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Processing your experience...
            </h2>
            <p className="text-slate-600">
              We&apos;re extracting the key patterns from your narrative.
            </p>
          </div>
        )}

        {/* Add another */}
        {step === 'add-another' && (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Experience added!
            </h2>
            <p className="text-slate-600 mb-6">
              You&apos;ve added {experienceCount} experience{experienceCount > 1 ? 's' : ''}. More experiences mean better matches.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary" onClick={resetExperienceForm}>
                Add Another Experience
              </button>
              <button
                className="btn-secondary"
                onClick={() => setStep('done')}
              >
                I&apos;m Done
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {step === 'done' && (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-sanctuary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-sanctuary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Thank you for joining!
            </h2>
            <p className="text-slate-600 mb-6">
              You&apos;ve added {experienceCount} experience{experienceCount > 1 ? 's' : ''}. We&apos;ll reach out when there&apos;s a founder who could benefit from your insights.
            </p>
            <Link href="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
