import React from 'react';
import { MetaData } from '../types';
import { BookOpen, CheckCircle, AlertTriangle, Shield, Calculator, BarChart3, Database, Crown, Sparkles } from 'lucide-react';

interface MethodologyProps {
  meta: MetaData;
}

export const Methodology: React.FC<MethodologyProps> = ({ meta }) => {
  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-400/15 text-amber-300 border border-amber-400/35 mb-2 shadow-sm">
          <Crown size={13} className="text-amber-400" />
          <span>Analytical Transparency & Rigour</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Pressure Reliability Index (PRI) Methodology</span>
          <Sparkles size={20} className="text-amber-400" />
        </h2>
        <p className="text-xs sm:text-sm text-sky-200/80 mt-1 leading-relaxed font-medium">
          Comprehensive mathematical specification, Bayesian shrinkage framework, situational definitions, and model assumptions.
        </p>
      </div>

      {/* Core Formula Card */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden space-y-4 border-amber-400/30">
        <div className="flex items-center gap-2 text-amber-400">
          <Calculator size={20} />
          <h3 className="font-extrabold text-lg text-white">Mathematical Model Formulation</h3>
        </div>

        <div className="p-4 rounded-2xl bg-black/45 border border-amber-400/30 text-center sm:text-left overflow-x-auto shadow-inner">
          <div className="font-mono text-sm sm:text-base font-black text-gradient-gold-royal">
            PRI = 100 × [ 0.40 × PressurePerf + 0.25 × ClutchUplift + 0.20 × Consistency + 0.15 × SampleConfidence ]
          </div>
        </div>

        <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed font-medium">
          The Pressure Reliability Index is a composite scale between <strong className="text-gradient-gold-royal font-black">0 and 100</strong> designed to distinguish authentic clutch match-winners from high-variance outliers. It balances absolute execution under pressure against baseline delta, stability, and statistical volume confidence.
        </p>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white/5 border border-royals-pink/40 space-y-1.5 shadow-sm">
            <div className="text-xs font-black text-gradient-pink-electric uppercase tracking-wider">
              1. Pressure Execution (40% Weight)
            </div>
            <p className="text-xs text-sky-200/80 leading-relaxed font-medium">
              Measures adjusted execution in pressure balls. For batters: shrunk strike rate (40%), average (30%), boundary % (20%), and dot-ball resistance (10%). For bowlers: inverted economy (40%), wicket-taking strike rate (30%), and dot % (20%).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-sky-400/40 space-y-1.5 shadow-sm">
            <div className="text-xs font-black text-gradient-blue-royal uppercase tracking-wider">
              2. Clutch Uplift (25% Weight)
            </div>
            <p className="text-xs text-sky-200/80 leading-relaxed font-medium">
              Evaluates performance differential (&Delta;) when transitioning from non-pressure to pressure situations. Rewards players whose output increases when the game is on the line, with an excellence floor for world-class elite performers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-emerald-400/40 space-y-1.5 shadow-sm">
            <div className="text-xs font-black text-emerald-300 uppercase tracking-wider">
              3. Innings Consistency (20% Weight)
            </div>
            <p className="text-xs text-sky-200/80 leading-relaxed font-medium">
              Evaluates stability across distinct match occasions. Calculates the proportion of pressure innings where batters strike &ge; 135 or bowlers concede &le; 8.5 RPO, penalized by cross-match standard deviation variance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-amber-400/40 space-y-1.5 shadow-sm">
            <div className="text-xs font-black text-gradient-gold-royal uppercase tracking-wider">
              4. Sample Confidence &amp; Shrinkage (15% Weight)
            </div>
            <p className="text-xs text-sky-200/80 leading-relaxed font-medium">
              Applies Empirical Bayesian Shrinkage: Prior weight K = 80, shrinking observed rate toward population prior: Obs &times; (n / (n + 80)) + Prior &times; (80 / (n + 80)). Small-sample flukes automatically regress toward the mean.
            </p>
          </div>
        </div>
      </div>

      {/* Situational Pressure Definitions */}
      <div className="glass-panel p-6 sm:p-8 space-y-6">
        <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
          <Shield size={18} className="text-royals-pink" />
          <span>Operational Definition of Match Pressure</span>
        </h3>

        <p className="text-xs sm:text-sm text-sky-200/90 leading-relaxed font-medium">
          Pressure is defined as acute match states where the marginal value of every run and delivery diverges significantly from median phases. Every legal delivery is evaluated dynamically:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Batting Pressure */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-gradient-pink-electric uppercase tracking-wider flex items-center gap-1.5">
              <span>Batting Pressure Triggers (38.4% of Balls)</span>
            </h4>
            <ul className="space-y-2 text-xs text-sky-200/80 font-medium">
              {meta.pressure_defs.batting.map((def, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-royals-pink mt-0.5 flex-shrink-0" />
                  <span>{def}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bowling Pressure */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-gradient-blue-royal uppercase tracking-wider flex items-center gap-1.5">
              <span>Bowling Pressure Triggers (31.2% of Balls)</span>
            </h4>
            <ul className="space-y-2 text-xs text-sky-200/80 font-medium">
              {meta.pressure_defs.bowling.map((def, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle size={14} className="text-sky-400 mt-0.5 flex-shrink-0" />
                  <span>{def}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Assumptions & Limitations */}
      <div className="glass-panel p-6 sm:p-8 space-y-4">
        <h3 className="font-extrabold text-lg text-white flex items-center gap-2 text-amber-400">
          <AlertTriangle size={18} />
          <span>Model Assumptions & Scope Limitations</span>
        </h3>

        <div className="space-y-2.5 text-xs text-sky-200/80 font-medium">
          {meta.limitations.map((lim, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/5">
              <span className="font-extrabold text-amber-400 flex-shrink-0">•</span>
              <span>{lim}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data Governance Statement */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-xs text-sky-200/80 flex items-start gap-3">
        <Database size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-gradient-gold-royal font-black">Confidentiality & Local Processing Guarantee: </strong>
          All 200,961 deliveries, player maps, and competition records are stored and processed locally within the Rajasthan Royals analytical sandbox. No proprietary match logs or player metrics are published, hosted, or exposed to external servers.
        </div>
      </div>
    </div>
  );
};
