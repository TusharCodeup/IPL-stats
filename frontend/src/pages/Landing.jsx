import React, { useState } from 'react';
import { 
  TrendingUp, Activity, Cpu, ShieldCheck, 
  ChevronDown, MessageSquare, Award, Zap, 
  HelpCircle, Sparkles, CheckCircle2 
} from 'lucide-react';

const Landing = ({ onGetStarted }) => {
  const [activeFaq, setActiveFaq] = useState(null);

  const stats = [
    { value: '87.4%', label: 'Predictive Accuracy', icon: Award },
    { value: '50,000+', label: 'Predictions Generated', icon: Activity },
    { value: '< 200ms', label: 'Inference Latency', icon: Zap }
  ];

  const features = [
    {
      title: 'Ensemble Predictive Model',
      description: 'Leverages XGBoost, Random Forest, and Form Index analysis to compute pre-match winning outcomes.',
      icon: Cpu,
      badge: 'ML Native'
    },
    {
      title: 'Real-Time Live Simulator',
      description: 'Stream live match projections ball-by-ball. Win probability updates instantly as the chase develops.',
      icon: TrendingUp,
      badge: 'WebSockets'
    },
    {
      title: 'Explainable AI Insights',
      description: 'Understand the "Why" behind the numbers. Get detailed SHAP explanations highlighting form, toss, and venue impacts.',
      icon: ShieldCheck,
      badge: 'SHAP Data'
    }
  ];

  const pricing = [
    {
      name: 'Free Trial',
      price: '₹0',
      period: 'forever',
      features: [
        '5 predictions on registration',
        'Pre-match model predictions',
        'Basic statistics & historical logs',
        'Community support access'
      ],
      cta: 'Start Analyzing Free',
      highlighted: false,
      tier: 'free'
    },
    {
      name: 'Pro Member',
      price: '₹99',
      period: 'month',
      features: [
        'Unlimited match predictions',
        'Ball-by-ball live simulation access',
        'Advanced SHAP model explanations',
        'All team H2H venue analytics',
        '24/7 Priority support'
      ],
      cta: 'Upgrade to Pro Tier',
      highlighted: true,
      tier: 'pro'
    }
  ];

  const faqs = [
    {
      q: 'How does the model calculate win probabilities?',
      a: 'The platform uses an ensemble of gradient-boosted decision trees (XGBoost) and random forest classifiers. It evaluates current team form (past 5 matches), historical head-to-head ratios, venue characteristics, toss outcomes, and live chase game states (runs, wickets, balls remaining).'
    },
    {
      q: 'What is the backtested accuracy of the predictions?',
      a: 'Across the last three IPL seasons, our pre-match models maintained an average ROC-AUC score of 0.87, achieving over 87% accuracy in identifying the eventual match winner.'
    },
    {
      q: 'How do the simulation credits work?',
      a: 'New registrations receive 5 free credits. Each pre-match prediction or live simulator launch consumes 1 credit. Upgrading to the Pro tier grants unlimited simulation runs and unlocks model explainability metrics.'
    },
    {
      q: 'Is the payment gateway secure?',
      a: 'Yes, our billing checkout simulates a standard secure Razorpay transaction wrapper, encrypting all sandbox requests and synchronizing your upgraded features in real time.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b0f19] dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 max-w-7xl mx-auto text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-indigo-100 dark:border-gray-800 bg-indigo-50/50 dark:bg-gray-900/30 mb-8 animate-pulse-slow">
          <Sparkles className="w-4 h-4 text-indigo-500 dark:text-emerald-400" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-700 dark:text-emerald-400">Next-Gen Predictive Sports Engine</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight font-display text-slate-900 dark:text-white leading-tight">
          IPL Match Predictions <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400">
            Powered by Machine Learning
          </span>
        </h1>
        
        <p className="max-w-2xl mx-auto mt-6 text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
          Analyze historical IPL matchups, run ball-by-ball game chase simulations, and understand feature impacts with explainable AI graphs.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-indigo-600 dark:bg-emerald-500 text-white dark:text-slate-950 font-black py-4 px-8 rounded-2xl flex items-center justify-center space-x-2 shadow-xl hover:shadow-indigo-500/10 dark:hover:shadow-emerald-500/20 active:scale-[0.98] transition-all hover:scale-[1.01] cursor-pointer"
          >
            <span>Start Free Predictions</span>
            <span className="text-lg">⚡</span>
          </button>
          <a
            href="#pricing"
            className="w-full sm:w-auto border border-slate-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-emerald-500/30 bg-white/50 dark:bg-gray-900/20 py-4 px-8 rounded-2xl font-bold flex items-center justify-center hover:bg-slate-50 dark:hover:bg-gray-900/50 transition-colors"
          >
            View Pricing Plans
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-200/60 dark:border-gray-900 bg-white/40 dark:bg-[#0e1322]/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 sm:px-6 lg:px-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center p-4">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-emerald-400 mb-4 border border-indigo-100/50 dark:border-indigo-950/20">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-4xl font-black text-slate-900 dark:text-white font-display">{stat.value}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">{stat.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Cards Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">Engineered for Accuracy</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">A multi-layered statistical platform built on historical records from 2008–2026.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div 
                key={i} 
                className="glass-card p-6 bg-white dark:bg-[#111827]/30 border border-slate-200 dark:border-gray-900 rounded-3xl shadow-lg relative overflow-hidden group hover:border-indigo-500 dark:hover:border-emerald-500 transition-all hover:scale-[1.01]"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-emerald-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-emerald-400">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Table Section */}
      <section id="pricing" className="py-20 border-t border-slate-200/60 dark:border-gray-900 bg-white/40 dark:bg-[#0e1322]/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">Flexible Pricing Plans</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Choose the tier that matches your forecasting and analytic requirements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricing.map((tier, i) => (
              <div 
                key={i} 
                className={`glass-card p-8 rounded-3xl border shadow-xl relative overflow-hidden flex flex-col justify-between ${
                  tier.highlighted 
                    ? 'border-indigo-500 bg-slate-900 text-white dark:bg-[#111827] dark:border-emerald-500' 
                    : 'border-slate-200 bg-white text-slate-900 dark:bg-gray-950/50 dark:border-gray-900 dark:text-gray-100'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                )}
                
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-extrabold">{tier.name}</h3>
                    {tier.highlighted && (
                      <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-600 dark:bg-emerald-500 text-white dark:text-slate-950 px-3 py-1 rounded-full">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-baseline space-x-1 mb-6">
                    <span className="text-5xl font-black font-display">{tier.price}</span>
                    <span className="text-xs text-gray-400">/ {tier.period}</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-xs">
                        <CheckCircle2 className={`w-4.5 h-4.5 flex-shrink-0 ${
                          tier.highlighted ? 'text-indigo-400 dark:text-emerald-400' : 'text-indigo-600 dark:text-emerald-500'
                        }`} />
                        <span className={tier.highlighted ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={onGetStarted}
                  className={`w-full font-black py-3.5 px-4 rounded-xl text-center active:scale-[0.98] transition-all cursor-pointer text-xs ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400 text-white dark:text-slate-950 shadow-lg shadow-indigo-500/20 dark:shadow-emerald-500/20'
                      : 'bg-slate-100 dark:bg-gray-900 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-gray-800 hover:bg-slate-200 dark:hover:bg-gray-800/80'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display flex items-center justify-center gap-2">
            <HelpCircle className="w-7 h-7 text-indigo-500 dark:text-emerald-400" />
            <span>Frequently Asked Questions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx}
                className="border border-slate-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#111827]/40 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-slate-800 dark:text-gray-200 focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-slate-100 dark:border-gray-900/50 pt-3 animate-slide-down">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Landing;
