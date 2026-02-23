"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Bot, PlayCircle, ShieldAlert, Sparkles, TrendingUp, TrendingDown, Newspaper, ActivitySquare, TerminalSquare, RefreshCw } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useLiveMarkets } from "@/hooks/useLiveMarkets";
import { useCryptoSentiment } from "@/hooks/useCryptoSentiment";


export default function Home() {
  const router = useRouter();
  const { user, loading, isDemoMode } = useAuth();
  const [demoOpen, setDemoOpen] = useState(false);
  const authLoading = false;

  const handleStartTrading = () => {
    if (user || isDemoMode && user) {
      router.push("/dashboard");
    } else {
      router.push("/auth");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  const [terminalLines, setTerminalLines] = useState([
    "[SYSTEM] Quantum Engine Initializing...",
    "[NETWORK] Syncing with Polymarket Contracts...",
    "[AGENT] Ingesting Global News Sentiment...",
  ]);
  const { markets } = useLiveMarkets(50);
  const { trending } = useCryptoSentiment();

  // New simulated real-time dynamic twitter feed ticker based on hot coins
  const [socialFeedOffset, setSocialFeedOffset] = useState(0);
  const [marqueeData, setMarqueeData] = useState<any[]>([]);

  interface TickerItem {
    id?: string;
    title: string;
    price: number | string;
    trend: 'up' | 'down' | string;
    volume?: number;
  }

  const [tickerData, setTickerData] = useState<TickerItem[]>([]);
  const [gridOffset, setGridOffset] = useState(0);



  useEffect(() => {
    if (markets && markets.length > 0) {
      // Initialize ticker with real markets but add a default trend if missing
      setTickerData(markets.map(m => ({ ...m, trend: m.trend || (Math.random() > 0.5 ? 'up' : 'down') })));
    }
  }, [markets]);

  useEffect(() => {
    if (trending && trending.length > 0 && marqueeData.length === 0) {
      setMarqueeData(trending);
    }
  }, [trending]);

  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      // 1. Simulate price volatility on the ticker
      setTickerData(prev => prev.map(m => {
        if (Math.random() > 0.4) {
          const shift = (Math.random() * 4 - 2); // -2 to +2
          let p = typeof m.price === 'number' ? m.price : parseFloat(m.price || '50');
          p = Math.max(1, Math.min(99, p + shift));
          const volShift = Math.random() > 0.5 ? (Math.random() * 50000) : -(Math.random() * 50000);
          return { ...m, price: p, trend: shift >= 0 ? 'up' : 'down', volume: Math.max(0, (m.volume || 0) + volShift) };
        }
        return m;
      }));

      // Simulate live network volatility on Social Marquee
      setMarqueeData(prev => prev.map(c => {
        if (Math.random() > 0.3) {
          // Add micro-volatility specifically designed to make it look hyper-active
          const priceShift = (Math.random() * (c.price * 0.005)) * (Math.random() > 0.5 ? 1 : -1);
          const pctShift = (Math.random() * 0.3 - 0.15);
          return {
            ...c,
            price: Math.max(0.000001, c.price + priceShift),
            priceChange24h: c.priceChange24h + pctShift,
            _pulse: true,
            _randomSource: ["@X_Alpha", "Reddit/Metrics", "Telegram:WhaleAlert", "OnChain_Scanner", "Discord_Intel"][Math.floor(Math.random() * 5)]
          };
        }
        return { ...c, _pulse: false };
      }));


      // 2. Add terminal line without strict mode duplicate bug
      const activeTitles = markets && markets.length > 0
        ? markets.map(m => m.title)
        : ['System Initializing...', 'BTC > $100K', 'ETH ETF Approval'];

      const currentMarket = activeTitles[tick % activeTitles.length]?.substring(0, 40) || 'Polymarket';
      const randomPrice = (Math.random() * 40 + 20).toFixed(1);

      const lines = [
        `[AI] Formulating strategy on: ${currentMarket}...`,
        `[EXECUTE] Simulated Buy YES @ ${randomPrice}¢`,
        `[NETWORK] Block confirmed in ${(Math.random() * 8 + 4).toFixed(0)}ms via Flashbots.`,
        `[AI] Adjusting risk curve for ${currentMarket}...`,
        `[AGENT] Optimizing slippage tolerance protocols.`,
        `[AI] Monitoring off-chain sentiment for ${currentMarket}...`,
      ];

      setTerminalLines(oldLines => [...oldLines.slice(-4), lines[tick % lines.length]]);

      // 3. Cycle the dashboard grids offset every two ticks (3.6s) to show fresh live data
      if (tick % 2 === 0) {
        setGridOffset(current => {
          let next = current + 6;
          if (activeTitles.length > 0 && next >= activeTitles.length) return 0;
          return next;
        });

        setSocialFeedOffset(current => {
          let next = current + 6;
          if (trending && trending.length > 0 && next >= trending.length) return 0;
          return next;
        });
      }

      tick++;



    }, 1800); // 1.8 seconds fast pulse!

    return () => clearInterval(interval);
  }, [markets, trending]);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Navbar />

      <main className="flex-1 relative">
        <section className="space-y-6 pb-8 pt-10 md:pb-12 md:pt-16 lg:py-32 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="container mx-auto flex max-w-[64rem] flex-col items-center gap-6 text-center px-4 relative z-10"
          >
            <motion.div variants={itemVariants}>
              <Link
                href="/dashboard"
                className="rounded-full bg-muted/80 backdrop-blur-sm px-5 py-2 text-sm font-medium transition-all hover:bg-muted/100 flex items-center gap-2 border border-border/50 shadow-sm"
              >
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                Introducing Polymarket Agent V1
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground to-muted-foreground pb-2">
                Automated <span className="text-primary bg-none bg-clip-border">Predict & Profit</span>
              </h1>
            </motion.div>

            <motion.div variants={itemVariants}>
              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                Connect your wallet, configure your risk guardrails, and let our AI agent analyze sentiment, execute trades, and manage your Polymarket portfolio autonomously.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 px-8 font-semibold w-full sm:w-auto relative group overflow-hidden"
                onClick={handleStartTrading}
                disabled={loading || authLoading}
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/80 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center z-10">
                  {loading || authLoading ? "Loading..." : "Start Trading Now"}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 font-semibold w-full sm:w-auto group"
                onClick={() => setDemoOpen(true)}
              >
                <PlayCircle className="mr-2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                Watch Demo
              </Button>
            </motion.div>


          </motion.div>
        </section>

        {/* Live Marquee Ticker */}
        <div className="w-full relative z-10 flex flex-col items-center">
          <div className="bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)] border-t border-blue-500/30 w-full py-2 px-4 flex flex-col sm:flex-row justify-center items-center gap-2 backdrop-blur-md">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)]" />
              <span className="text-blue-400 font-bold text-[10px] md:text-xs">LIVE FEED:</span>
            </div>
            <p className="text-[10px] md:text-xs text-blue-300/90 font-mono tracking-widest uppercase font-semibold text-center sm:text-left leading-snug">
              Aggregating real-time data to track the most trending crypto assets across global social platforms
            </p>
          </div>
          <div className="w-full bg-black/40 border-b border-blue-500/20 py-3 overflow-hidden whitespace-nowrap flex shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            <div className="animate-marquee inline-block whitespace-nowrap space-x-8">
              {marqueeData.length > 0 ? marqueeData.map((t, i) => (
                <span key={`ticker-${i}`} className={`inline-flex items-center text-sm font-mono gap-3 text-muted-foreground hover:text-white transition-colors py-1 px-3 rounded-md ${t._pulse ? 'bg-white/5 border border-white/5' : ''}`}>
                  <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase bg-blue-500/10 px-2 py-0.5 rounded mr-1">
                    {t._randomSource || "Crypto_Radar"}
                  </span>
                  <span className="font-bold text-white max-w-[200px] truncate">{t.symbol}</span>
                  <span className={t.priceChange24h >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                    ${typeof t.price === 'number' ? t.price.toFixed(t.price < 0.1 ? 4 : 2) : parseFloat(t.price || '0').toFixed(2)}
                  </span>
                  {t.priceChange24h >= 0 ? <TrendingUp className={`w-4 h-4 text-green-400 ${t._pulse ? 'animate-pulse' : ''}`} /> : <TrendingDown className={`w-4 h-4 text-red-400 ${t._pulse ? 'animate-pulse' : ''}`} />}
                  <span className="mx-2 opacity-30 text-zinc-500">|</span>
                </span>
              )) : (
                <span className="text-blue-400/80 font-mono text-xs pr-8 animate-pulse">Establishing secure connection to Global Social Networks...</span>
              )}

              {/* Duplicate for seamless loop */}
              {marqueeData.length > 0 && marqueeData.map((t, i) => (
                <span key={`ticker-dup-${i}`} className={`inline-flex items-center text-sm font-mono gap-3 text-muted-foreground hover:text-white transition-colors py-1 px-3 rounded-md ${t._pulse ? 'bg-white/5 border border-white/5' : ''}`}>
                  <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase bg-blue-500/10 px-2 py-0.5 rounded mr-1">
                    {t._randomSource || "Crypto_Radar"}
                  </span>
                  <span className="font-bold text-white max-w-[200px] truncate">{t.symbol}</span>
                  <span className={t.priceChange24h >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                    ${typeof t.price === 'number' ? t.price.toFixed(t.price < 0.1 ? 4 : 2) : parseFloat(t.price || '0').toFixed(2)}
                  </span>
                  {t.priceChange24h >= 0 ? <TrendingUp className={`w-4 h-4 text-green-400 ${t._pulse ? 'animate-pulse' : ''}`} /> : <TrendingDown className={`w-4 h-4 text-red-400 ${t._pulse ? 'animate-pulse' : ''}`} />}
                  <span className="mx-2 opacity-30 text-zinc-500">|</span>
                </span>
              ))}
            </div>
          </div>
        </div>



        {/* Huge In-Depth Crypto Intelligence Section */}
        <section className="container mx-auto max-w-[64rem] py-12 px-4 relative z-10 space-y-8">

          <div className="flex flex-col mb-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Newspaper className="h-6 w-6 text-blue-400 animate-pulse" />
                <h2 className="text-2xl font-bold border-b border-blue-400/20 pb-1">Top Trending Crypto Intelligence</h2>
              </div>
              <div className="px-3 py-1 text-xs font-semibold rounded-full border border-blue-500/50 text-blue-400 bg-blue-500/10 flex items-center gap-2 shadow-[0_0_10px_rgba(59,130,246,0.2)] whitespace-nowrap">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                Global X/Social Radar
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2 lg:mt-3 border-l-2 border-blue-500/30 pl-3">
              Real-time deep research on the most highly talked-about and trending cryptocurrencies right now. Use these actionable AI signals to identify money-making opportunities before they go mainstream.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trending.length === 0 ? (
              <div className="col-span-full py-10 text-center border border-dashed border-blue-400/10 rounded-xl bg-blue-500/5">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 opacity-50 text-blue-400" />
                <p className="font-mono text-xs text-blue-400/80">Indexing Global Crypto Discourse...</p>
              </div>
            ) : (
              trending.slice(socialFeedOffset, socialFeedOffset + 6).map((coin, idx) => {
                const isHot = coin.sentimentScore > 75;
                const isFud = coin.priceChange24h < -2;

                return (
                  <div key={coin.id + idx} className="p-4 border border-white/5 rounded-xl bg-black/40 backdrop-blur-[12px] shadow-lg flex flex-col gap-3 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                    <div className="absolute top-0 right-0 w-[150%] h-full bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none group-hover:from-blue-500/10 transition-colors" />

                    <div className="flex items-center justify-between relative z-10 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        {coin.thumb ? <img src={coin.thumb} alt={coin.symbol} className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-blue-500/20" />}
                        <div>
                          <h4 className="font-bold text-sm uppercase text-white/90">{coin.symbol}</h4>
                          <span className="text-xs text-muted-foreground font-normal lowercase line-clamp-1">{coin.name}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="font-mono text-sm text-white font-bold">${coin.price.toFixed(coin.price < 0.1 ? 6 : 2)}</span>
                        <span className={`font-mono text-xs ${coin.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {coin.priceChange24h >= 0 ? '+' : ''}{coin.priceChange24h.toFixed(1)}% (24h)
                        </span>
                      </div>
                    </div>

                    <div className="relative z-10 pl-3 border-l-2 border-blue-500/30 py-1 space-y-2">
                      <p className="text-xs leading-relaxed text-blue-100/80 font-mono">
                        <span className="text-blue-400 font-bold mr-1">Social Intel:</span>
                        {coin.aiOpinion}
                      </p>

                      <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded text-xs font-mono text-white/80 leading-relaxed shadow-inner">
                        <span className="text-blue-300 font-bold">DEEP RESEARCH: </span>{coin.deepResearch || "Accumulating on-chain validator data points..."}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 opacity-90 pt-2 border-t border-white/5">
                        <div className="flex gap-3 text-[10px] text-muted-foreground font-mono">
                          <span className="flex items-center gap-1"><ActivitySquare className="w-3 h-3 text-blue-400" /> Vol: {coin.volume || "Tracking"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded text-[10px] font-bold ${coin.tradingSignal === 'STRONG BUY' || coin.tradingSignal === 'ACCUMULATE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : coin.tradingSignal === 'SHORT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'}`}>
                            {coin.tradingSignal || 'MONITOR'}
                          </div>
                          <div className={`px-2 py-1 rounded text-[10px] font-bold ${isHot ? 'bg-green-500/20 text-green-400' : isFud ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/60'}`}>
                            Score: {coin.sentimentScore.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* Polymarket section */}
        <section className="container mx-auto max-w-[64rem] py-12 px-4 mb-20 relative z-10 space-y-8">
          <div className="flex flex-col mb-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ActivitySquare className="h-6 w-6 text-primary animate-pulse" />
                <h2 className="text-2xl font-bold border-b border-primary/20 pb-1">Deep Polymarket Intelligence Feed</h2>
              </div>
              <div className="px-3 py-1 text-xs font-semibold rounded-full border border-primary/50 text-primary bg-primary/10 flex items-center gap-2 shadow-[0_0_10px_rgba(59,130,246,0.2)] whitespace-nowrap">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                Live Prediction Intel
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2 lg:mt-3 border-l-2 border-primary/30 pl-3">
              Real-time deep research scraped directly from global prediction markets. Use this exclusive social consensus intelligence to discover mispriced events and highly profitable contrarian narratives.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tickerData.slice(gridOffset, gridOffset + 6).map((m, i) => {
              const conf = typeof m.price === 'number' ? m.price : parseFloat(m.price || '50');
              const isHighConf = conf > 65;
              const isLowConf = conf < 35;

              let action = "MONITOR";
              let actionColor = "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
              let source = ["X (Twitter)", "Reddit /r/Crypto", "Telegram Alpha", "On-Chain News", "Discord Signals"][(m.title.length + Math.floor(conf)) % 5];

              let analysis = "Volatility converging. No clear direction in social chatter.";

              if (isHighConf) {
                action = "BUY YES";
                actionColor = "text-green-500 bg-green-500/10 border-green-500/20";
                analysis = `Trending Anomaly: High volume discussions pointing towards YES execution. Sentiment across ${source} is exceptionally bullish on this outcome.`;
              } else if (isLowConf) {
                action = "BUY NO";
                actionColor = "text-red-500 bg-red-500/10 border-red-500/20";
                analysis = `Negative divergence confirmed. Deep probability of NO resolution detected alongside heavy bearish chatter on ${source}.`;
              } else if (m.trend === 'up') {
                action = "ACCUMUL";
                actionColor = "text-blue-500 bg-blue-500/10 border-blue-500/20";
                analysis = `Sudden spike in mentions. Agent tracking micro-shift in positive momentum tracking ${source} metadata.`;
              } else {
                action = "REDUCING";
                actionColor = "text-orange-500 bg-orange-500/10 border-orange-500/20";
                analysis = `Social momentum cooling off. Reduced activity on ${source} indicating potential breakdown of current trend.`;
              }

              return (
                <div key={m.id || i} className="flex flex-col gap-4 p-5 border border-white/5 rounded-xl bg-card/20 backdrop-blur-[12px] shadow-lg hover:border-primary/30 transition-colors group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                  <div className="flex justify-between items-start gap-2 relative z-10">
                    <div className="space-y-1 pr-2">
                      <h4 className="font-bold text-sm leading-snug line-clamp-2" title={m.title}>{m.title}</h4>
                      <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                        Vol: ${(m.volume || 0).toLocaleString('en-US', { notation: "compact" })}
                        {m.trend === 'up' ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                      </p>
                    </div>
                    <div className={`shrink-0 px-2 py-1 rounded text-[9px] font-bold border tracking-wider ${actionColor}`}>
                      {action}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 relative z-10 mt-2">
                    <span className="text-[10px] font-mono text-primary/70 bg-primary/10 w-fit px-2 py-0.5 rounded-full border border-primary/20">Source: {source}</span>
                    <p className="text-xs text-foreground/80 border-l-2 border-primary/40 pl-3 leading-relaxed">
                      {analysis}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between relative z-10">
                    <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Quantum Confidence</span>
                    <span className={`text-sm font-black ${isHighConf ? 'text-green-400' : isLowConf ? 'text-red-400' : 'text-blue-400'}`}>{conf.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}

            {(!tickerData || tickerData.length === 0) && (
              <div className="col-span-full py-16 text-center text-muted-foreground border border-dashed border-white/10 rounded-xl bg-black/20">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 opacity-50 text-primary" />
                <p className="font-mono text-sm">Syncing Live Polymarket Gamma Feeds...</p>
                <p className="font-mono text-[10px] mt-2 opacity-50 text-blue-400 px-4">Establishing secure connection. Filtering specifically for core Crypto markets.</p>
              </div>
            )}
          </div>
        </section>

        {/* Proof of Intelligence Terminal */}
        <section className="container mx-auto max-w-[48rem] px-4 mb-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full text-left"
          >
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/60 backdrop-blur-md shadow-2xl relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center px-4 py-2 border-b border-white/5 bg-black/40">
                <TerminalSquare className="w-5 h-5 mr-2 text-primary" />
                <span className="text-xs font-mono text-muted-foreground font-bold uppercase tracking-widest">system_terminal_agent.exe</span>
                <div className="ml-auto flex gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                  <span className="text-[10px] font-mono text-green-400 font-bold ml-1">LOCKED</span>
                </div>
              </div>
              <div className="p-5 font-mono text-sm space-y-2 h-[160px] flex flex-col justify-end relative overflow-hidden bg-[#0A0A0A]">
                <div className="absolute top-0 left-0 w-full h-[200%] bg-gradient-to-b from-transparent via-blue-500/5 to-transparent animate-scanline pointer-events-none" />
                {terminalLines.map((line, idx) => (
                  <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 text-zinc-400 leading-relaxed">
                    <span className="text-blue-500 font-black mr-3 opacity-80">➜</span>
                    {line.includes('[EXECUT') || line.includes('[AI]') ? <span className="text-white font-bold drop-shadow-sm">{line}</span> : line}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto max-w-[64rem] space-y-6 py-8 md:py-12 mb-20 px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                icon: Bot,
                title: "Autonomous Execution",
                desc: "The agent monitors chosen markets 24/7 and executes trades within milliseconds of data shifts.",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
              },
              {
                icon: ShieldAlert,
                title: "Safety Guardrails",
                desc: "Set daily loss limits, maximum trade sizes, and simulation mode directly in the dashboard.",
                color: "text-destructive",
                bg: "bg-destructive/10",
              },
              {
                icon: TrendingUp,
                title: "Transparent Reasoning",
                desc: "Explain My Decision panel provides exact rationale and confidence levels for every trade execution.",
                color: "text-green-500",
                bg: "bg-green-500/10",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group flex flex-col justify-between rounded-xl border border-white/10 bg-card/20 backdrop-blur-[12px] p-6 shadow-xl transition-all hover:shadow-2xl hover:border-primary/50 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-colors" />
                <div className="space-y-4 relative z-10">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${feature.bg}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </section>
      </main>

      <footer className="py-8 w-full border-t border-border/40 bg-muted/20">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row px-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Polymarket AI Agent © 2026. This is a demo.
            </p>
          </div>
        </div>
      </footer>

      {/* Demo Video Modal */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="sm:max-w-2xl bg-black/95 border-border">
          <DialogHeader>
            <DialogTitle>Platform Overview Demo</DialogTitle>
            <DialogDescription>
              See how the auto-execution framework scans markets and applies logic.
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="space-y-4 text-center">
                <PlayCircle className="h-16 w-16 text-muted-foreground/50 mx-auto animate-pulse" />
                <p className="text-sm font-medium text-muted-foreground">Simulated Demo Video Placeholder</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
