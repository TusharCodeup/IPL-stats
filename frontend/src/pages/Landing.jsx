import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Activity, Cpu, ShieldCheck, ChevronDown, 
  Award, Zap, HelpCircle, Sparkles, CheckCircle2,
  Trophy, Star, Play, ArrowRight, Github, Twitter, Mail
} from 'lucide-react';
import FadeIn, { StaggerContainer, StaggerItem } from '../components/animations/FadeIn';
import AnimatedCounter from '../components/animations/AnimatedCounter';
import FloatingParticles from '../components/animations/FloatingParticles';

const Landing = ({ onGetStarted }) => {
  const [activeFaq, setActiveFaq] = useState(null);

  const heroWords = ['IPL', 'Match', 'Predictions'];
  const tickerItems = [
    '🏆 IPL 2024 Champion: KKR',
    '🏏 Most Runs: Virat Kohli — 8004',
    '🎳 Most Wickets: Yuzvendra Chahal — 187',
    '💥 Most Sixes: Chris Gayle — 357',
    '⚡ 87.4% Prediction Accuracy',
    '🔥 50,000+ Predictions Generated'
  ];

  const stats = [
    { value: '87.4', suffix: '%', label: 'Predictive Accuracy', icon: Award },
    { value: '50000', suffix: '+', label: 'Predictions Generated', icon: Activity },
    { value: '200', prefix: '<', suffix: 'ms', label: 'Inference Latency', icon: Zap }
  ];

  const features = [
    { title: 'Ensemble Predictive Model', description: 'Leverages XGBoost, Random Forest, and Form Index analysis to compute pre-match winning outcomes with backtested accuracy.', icon: Cpu, badge: 'ML Native' },
    { title: 'Real-Time Live Simulator', description: 'Stream live match projections ball-by-ball. Win probability updates instantly as the chase develops via WebSockets.', icon: TrendingUp, badge: 'WebSockets' },
    { title: 'Explainable AI Insights', description: 'Understand the "Why" behind every prediction. Get SHAP-powered explanations for form, toss, and venue impacts.', icon: ShieldCheck, badge: 'SHAP' }
  ];

  const moments = [
    { emoji: '🏆', title: "CSK's 5th Title", desc: "Dhoni's last dance — age 41, lifting the trophy in Ahmedabad", color: 'from-yellow-500 to-amber-600', youtubeId: '57W27Z4i554' },
    { emoji: '💥', title: "Gayle 175*", desc: "The highest individual T20 score ever — 13 sixes, 17 fours", color: 'from-red-500 to-orange-600', youtubeId: 'v2T7y1V3n8s' },
    { emoji: '👑', title: "Kohli's 973 Runs", desc: "4 centuries in a single IPL season. An average of 81.08", color: 'from-red-600 to-red-800', youtubeId: 'oHh5X2wO2jY' },
    { emoji: '💜', title: "KKR 2024 Champions", desc: "Dismantled SRH by 8 wickets in a dominant final display", color: 'from-purple-600 to-purple-900', youtubeId: '57W27Z4i554' },
    { emoji: '🎯', title: "ABD Fastest 50", desc: "16-ball half-century — Mr. 360° at his absolute finest", color: 'from-red-500 to-amber-500', youtubeId: 'v2T7y1V3n8s' },
    { emoji: '🔥', title: "Super Over Madness", desc: "DC vs KXIP double super over — the craziest IPL game ever", color: 'from-emerald-500 to-cyan-600', youtubeId: 'rK2j4h6sCsc' }
  ];

  const pricing = [
    { name: 'Free Trial', price: '₹0', period: 'forever', features: ['5 predictions on registration', 'Pre-match model predictions', 'Basic statistics & historical logs', 'Community support access'], cta: 'Start Analyzing Free', highlighted: false },
    { name: 'Pro Member', price: '₹99', period: 'month', features: ['Unlimited match predictions', 'Ball-by-ball live simulation', 'Advanced SHAP model explanations', 'All team H2H venue analytics', '24/7 Priority support'], cta: 'Upgrade to Pro', highlighted: true }
  ];

  const faqs = [
    { q: 'How does the model calculate win probabilities?', a: 'The platform uses an ensemble of gradient-boosted decision trees (XGBoost) and random forest classifiers. It evaluates current team form (past 5 matches), historical head-to-head ratios, venue characteristics, toss outcomes, and live chase game states.' },
    { q: 'What is the backtested accuracy?', a: 'Across the last three IPL seasons, our pre-match models maintained an average ROC-AUC of 0.87, achieving over 87% accuracy in identifying the eventual match winner.' },
    { q: 'How do the simulation credits work?', a: 'New registrations receive 5 free credits. Each prediction or simulator launch consumes 1 credit. Pro tier grants unlimited runs and unlocks explainability.' },
    { q: 'Is the payment secure?', a: 'Yes. All UPI payments are verified by our admin team before credits are activated, ensuring authentic transactions with valid reference IDs.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0b0f19] dark:text-gray-100 transition-colors duration-300 relative overflow-hidden">

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-20 pb-16 px-4 max-w-7xl mx-auto text-center sm:px-6 lg:px-8 min-h-[85vh] flex flex-col items-center justify-center">
        <FloatingParticles count={40} />

        {/* Ambient glows */}
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-indigo-200/60 dark:border-emerald-800/40 bg-indigo-50/80 dark:bg-emerald-950/30 mb-8 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 text-indigo-500 dark:text-emerald-400" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-700 dark:text-emerald-400">Next-Gen Predictive Sports Engine</span>
        </motion.div>

        {/* Animated title */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05]">
          {heroWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="inline-block mr-3 sm:mr-5 text-slate-900 dark:text-white"
            >
              {word}
            </motion.span>
          ))}
          <br />
          <motion.span
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-cyan-500 dark:from-emerald-400 dark:via-cyan-400 dark:to-blue-400 animate-gradient"
          >
            Powered by AI
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="max-w-2xl mx-auto mt-6 text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed"
        >
          Analyze historical IPL matchups, run ball-by-ball chase simulations, and understand feature impacts with explainable AI visualizations.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onGetStarted}
            className="group w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-emerald-500 dark:to-cyan-500 text-white dark:text-slate-950 font-black py-4 px-8 rounded-2xl flex items-center justify-center space-x-2 shadow-xl shadow-indigo-500/20 dark:shadow-emerald-500/20 active:scale-[0.98] transition-all hover:scale-[1.02] cursor-pointer animate-glow-pulse"
          >
            <span>Start Free Predictions</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#pricing"
            className="w-full sm:w-auto border border-slate-200 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-emerald-500/40 bg-white/60 dark:bg-gray-900/30 py-4 px-8 rounded-2xl font-bold flex items-center justify-center hover:bg-white dark:hover:bg-gray-900/60 transition-all backdrop-blur-sm"
          >
            View Pricing Plans
          </a>
        </motion.div>

        {/* Live Ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-16 w-full max-w-4xl mx-auto overflow-hidden rounded-2xl border border-slate-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm"
        >
          <div className="flex items-center">
            <div className="px-4 py-3 bg-indigo-600 dark:bg-emerald-500 text-white dark:text-slate-950 text-[10px] font-black uppercase tracking-widest shrink-0">
              LIVE
            </div>
            <div className="overflow-hidden flex-1">
              <div className="animate-ticker flex whitespace-nowrap">
                {[...tickerItems, ...tickerItems].map((item, i) => (
                  <span key={i} className="inline-block px-6 py-3 text-xs font-bold text-gray-600 dark:text-gray-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-16 border-y border-slate-200/60 dark:border-gray-900 bg-white/40 dark:bg-[#0e1322]/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 sm:px-6 lg:px-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="flex flex-col items-center text-center p-6">
                  <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-emerald-400 mb-4 border border-indigo-100/50 dark:border-indigo-950/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <AnimatedCounter value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix} className="text-5xl font-black text-slate-900 dark:text-white" />
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-2">{stat.label}</span>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Engineered for Accuracy</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm max-w-xl mx-auto">A multi-layered statistical platform built on historical records from 2008–2026.</p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8" staggerDelay={0.15}>
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <StaggerItem key={i}>
                <div className="glass-card p-8 rounded-3xl relative overflow-hidden group hover:border-indigo-500 dark:hover:border-emerald-500 transition-all hover:scale-[1.02] hover:-translate-y-1 cursor-default">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-emerald-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-emerald-400">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{feat.description}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* ===== IPL MOMENTS TEASER ===== */}
      <section className="py-24 border-t border-slate-200/60 dark:border-gray-900 bg-gradient-to-b from-transparent to-white/40 dark:to-[#0e1322]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-3">
                <Trophy className="w-8 h-8 text-amber-500" />
                Greatest IPL Moments
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">Relive the iconic moments that defined IPL history</p>
            </div>
          </FadeIn>

          <div className="flex overflow-x-auto gap-5 pb-4 scrollbar-hide snap-x snap-mandatory">
            {moments.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.04, y: -4 }}
                className={`snap-start shrink-0 w-72 sm:w-80 p-6 rounded-3xl bg-gradient-to-br ${m.color} text-white relative overflow-hidden cursor-default group h-[220px] flex flex-col justify-between`}
              >
                {/* YouTube Thumbnail Background */}
                {m.youtubeId && (
                  <div className="absolute inset-0 w-full h-full opacity-25 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500 pointer-events-none">
                    <img
                      src={`https://img.youtube.com/vi/${m.youtubeId}/hqdefault.jpg`}
                      alt={m.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                  </div>
                )}
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>
                
                <div>
                  <span className="text-4xl mb-2 block relative z-10">{m.emoji}</span>
                  <h3 className="text-lg font-black mb-1 relative z-10 leading-tight">{m.title}</h3>
                </div>
                <p className="text-xs text-white/80 leading-relaxed relative z-10">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section id="pricing" className="py-24 bg-white/40 dark:bg-[#0e1322]/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Flexible Pricing Plans</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">Choose the tier that matches your forecasting needs.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricing.map((tier, i) => (
              <FadeIn key={i} delay={i * 0.2}>
                <div className={`p-8 rounded-3xl border shadow-xl relative overflow-hidden flex flex-col justify-between transition-all hover:scale-[1.02] ${
                  tier.highlighted
                    ? 'border-indigo-500 bg-slate-900 text-white dark:bg-[#111827] dark:border-emerald-500 animate-glow-pulse'
                    : 'border-slate-200 bg-white text-slate-900 dark:bg-gray-950/50 dark:border-gray-900 dark:text-gray-100'
                }`}>
                  {tier.highlighted && (
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
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
                      <span className="text-5xl font-black">{tier.price}</span>
                      <span className="text-xs text-gray-400">/ {tier.period}</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                      {tier.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-xs">
                          <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${tier.highlighted ? 'text-indigo-400 dark:text-emerald-400' : 'text-indigo-600 dark:text-emerald-500'}`} />
                          <span className={tier.highlighted ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={onGetStarted}
                    className={`w-full font-black py-3.5 px-4 rounded-xl text-center active:scale-[0.98] transition-all cursor-pointer text-xs ${
                      tier.highlighted
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-400 text-white dark:text-slate-950 shadow-lg'
                        : 'bg-slate-100 dark:bg-gray-900 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-gray-800 hover:bg-slate-200'
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section className="py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
              <HelpCircle className="w-7 h-7 text-indigo-500 dark:text-emerald-400" />
              Frequently Asked Questions
            </h2>
          </div>
        </FadeIn>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <FadeIn key={idx} delay={idx * 0.1}>
              <div className="border border-slate-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#111827]/40 overflow-hidden transition-all">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-slate-800 dark:text-gray-200 focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-slate-100 dark:border-gray-900/50 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ===== PREMIUM FOOTER ===== */}
      <footer className="border-t border-slate-200/60 dark:border-gray-900 bg-white/60 dark:bg-[#0b0f19] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">🏏</span>
                <div>
                  <span className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-emerald-400 dark:to-cyan-500">
                    IPL CRIC-AI
                  </span>
                  <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest">Predictive Analytics Platform</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
                India's first AI-powered IPL match prediction platform. Built with XGBoost, SHAP explainability, and real-time WebSocket simulations.
              </p>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white mb-4">Platform</h4>
              <ul className="space-y-2.5 text-xs text-gray-500 dark:text-gray-400">
                <li className="hover:text-indigo-600 dark:hover:text-emerald-400 cursor-pointer transition-colors">Match Predictions</li>
                <li className="hover:text-indigo-600 dark:hover:text-emerald-400 cursor-pointer transition-colors">Live Simulator</li>
                <li className="hover:text-indigo-600 dark:hover:text-emerald-400 cursor-pointer transition-colors">Team Analytics</li>
                <li className="hover:text-indigo-600 dark:hover:text-emerald-400 cursor-pointer transition-colors">IPL Legends</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white mb-4">Connect</h4>
              <div className="flex items-center space-x-3">
                <a href="#" className="p-2.5 rounded-xl bg-slate-100 dark:bg-gray-900 text-gray-500 hover:text-indigo-600 dark:hover:text-emerald-400 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="p-2.5 rounded-xl bg-slate-100 dark:bg-gray-900 text-gray-500 hover:text-indigo-600 dark:hover:text-emerald-400 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="p-2.5 rounded-xl bg-slate-100 dark:bg-gray-900 text-gray-500 hover:text-indigo-600 dark:hover:text-emerald-400 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-all">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-gray-800 pt-6 text-center text-xs text-gray-400">
            IPL Cric-AI © {new Date().getFullYear()} — Built with FastAPI, Scikit-learn, XGBoost & React. Made with ❤️ in India.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
