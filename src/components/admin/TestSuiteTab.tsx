import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

interface TestCaseResult {
  id: number;
  name: string;
  category: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export const TestSuiteTab: React.FC = () => {
  const [running, setRunning] = useState<boolean>(false);
  const [report, setReport] = useState<{
    summary: { total: number; passed: number; failed: number };
    results: TestCaseResult[];
  } | null>(null);

  const handleRunTests = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/tests/run', { method: 'POST' });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Suite Header */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              18-Scenario Automotive Platform Verification Suite
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Automated verification covering Gemini catalog grounding, concurrency slot conflict prevention, WhatsApp webhook verification, and RBAC security gates.
          </p>
        </div>

        <button
          disabled={running}
          onClick={handleRunTests}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          {running ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing 18 Scenarios...
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Execute Complete Test Suite
            </>
          )}
        </button>
      </div>

      {/* Summary Scorecards */}
      {report && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-xs text-zinc-400 uppercase font-mono">Total Scenarios</div>
            <div className="text-2xl font-extrabold text-white font-mono mt-1">
              {report.summary.total}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="text-xs text-emerald-400 uppercase font-mono">Passed</div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
              {report.summary.passed}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-xs text-zinc-400 uppercase font-mono">Failed</div>
            <div
              className={`text-2xl font-extrabold font-mono mt-1 ${
                report.summary.failed === 0 ? 'text-zinc-500' : 'text-rose-400'
              }`}
            >
              {report.summary.failed}
            </div>
          </div>
        </div>
      )}

      {/* Test Results Table */}
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-400 font-mono">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Verification Scenario</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Result</th>
                <th className="px-4 py-3.5">Execution Details</th>
                <th className="px-4 py-3.5 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {!report ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                    Click "Execute Complete Test Suite" to run automated end-to-end verification.
                  </td>
                </tr>
              ) : (
                report.results.map((test) => (
                  <tr key={test.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-zinc-500">{test.id}</td>
                    <td className="px-4 py-3 font-semibold text-white">{test.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                        {test.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {test.passed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> PASSED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold text-[11px]">
                          <XCircle className="w-3 h-3 text-rose-400" /> FAILED
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 max-w-md">{test.message}</td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-500">{test.durationMs}ms</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
