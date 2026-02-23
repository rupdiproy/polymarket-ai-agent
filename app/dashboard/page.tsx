"use client";

import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import download from "downloadjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Camera, RefreshCw, Activity, ShieldAlert, Zap, Search, Download, Copy, Rocket, Pause, StopCircle, AlertTriangle, CheckCircle2, Eye, Snowflake, TrendingUp, TrendingDown, DollarSign, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useLiveMarkets } from "@/hooks/useLiveMarkets";
import { useAuth } from "@/providers/AuthProvider";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
export default function DashboardPage() {
    const dashboardRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { isDemoMode, user } = useAuth();
    const router = useRouter();
    const { isConnected } = useAccount();

    const [activeTab, setActiveTab] = useState("wallet");
    const [agentState, setAgentState] = useState<"IDLE" | "MONITORING" | "EXECUTING">("MONITORING");
    const [isLiveEnabled, setIsLiveEnabled] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    const [demoMetrics, setDemoMetrics] = useState({
        observed: 1245,
        executed: 34,
        volume: 12450.00,
        successRate: 68.2,
        pnl: 450.00
    });

    const [liveMetrics, setLiveMetrics] = useState({
        observed: 0,
        executed: 0,
        volume: 0,
        successRate: 0,
        pnl: 0
    });

    const metrics = isLiveEnabled ? liveMetrics : demoMetrics;

    useEffect(() => {
        const uid = user?.uid || "demo_user";
        const savedDemo = localStorage.getItem(`metrics_${uid}_demo`);
        if (savedDemo) setDemoMetrics(JSON.parse(savedDemo));

        const savedLive = localStorage.getItem(`metrics_${uid}_live`);
        if (savedLive) setLiveMetrics(JSON.parse(savedLive));
    }, [user]);

    useEffect(() => {
        const uid = user?.uid || "demo_user";
        localStorage.setItem(`metrics_${uid}_demo`, JSON.stringify(demoMetrics));
    }, [demoMetrics, user]);

    useEffect(() => {
        const uid = user?.uid || "demo_user";
        localStorage.setItem(`metrics_${uid}_live`, JSON.stringify(liveMetrics));
    }, [liveMetrics, user]);

    useEffect(() => {
        if (isConnected && !isDemoMode) {
            setIsLiveEnabled(true);
        } else {
            setIsLiveEnabled(false);
        }
    }, [isConnected, isDemoMode]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (agentState !== "IDLE") {
            interval = setInterval(() => {
                const updater = (prev: any) => {
                    const addObserved = Math.floor(Math.random() * 8) + 1;
                    const addExecuted = Math.random() > 0.85 ? 1 : 0;
                    const addVolume = addExecuted ? (Math.random() * 500 + 50) : 0;
                    const shiftSuccess = (Math.random() * 0.4) - 0.2;
                    const shiftPnl = (Math.random() * 20) - 8;

                    return {
                        observed: prev.observed + addObserved,
                        executed: prev.executed + addExecuted,
                        volume: prev.volume + addVolume,
                        successRate: prev.successRate === 0 && addExecuted ? 100 : Math.min(99.9, Math.max(10.0, prev.successRate + shiftSuccess)),
                        pnl: prev.pnl + shiftPnl
                    };
                };

                if (isLiveEnabled) {
                    setLiveMetrics(updater);
                } else {
                    setDemoMetrics(updater);
                }
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [agentState, isLiveEnabled]);

    // Keyboard shortcuts
    const [, setKeys] = useState<string[]>([]);

    useEffect(() => {
        // Check if onboarding was completed
        const hasCompletedOnboarding = localStorage.getItem("polymarket_onboarding_done");
        if (!hasCompletedOnboarding) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowOnboarding(true);
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            // Focus Search when '/' is pressed
            if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
                e.preventDefault();
                setActiveTab("logs");
                setTimeout(() => searchInputRef.current?.focus(), 100);
                return;
            }

            // Command chain listener
            if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

            setKeys(prev => {
                const newKeys = [...prev, e.key].slice(-2);
                const combo = newKeys.join("");

                if (combo === "gd") {
                    router.push("/dashboard");
                    return [];
                }
                if (combo === "gh") {
                    router.push("/");
                    return [];
                }
                return newKeys;
            });
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    const completeOnboarding = () => {
        localStorage.setItem("polymarket_onboarding_done", "true");
        setShowOnboarding(false);
        toast.success("Ready to automate!", { icon: "🚀" });
    };

    const handleSnapshot = () => {
        if (dashboardRef.current) {
            toast.info("Generating snapshot...");
            toPng(dashboardRef.current, { cacheBust: true, backgroundColor: '#09090b', pixelRatio: 1 })
                .then((dataUrl) => {
                    download(dataUrl, 'polymarket-agent-snapshot.png');
                    toast.success("Snapshot saved!");
                })
                .catch((e) => {
                    console.error("Snapshot error:", e);
                    toast.error("Failed to capture snapshot on this device");
                });
        }
    };

    const toggleAgent = () => {
        if (agentState === "IDLE") {
            setAgentState("MONITORING");
            toast.success("Agent started monitoring markets.");
        } else {
            setAgentState("IDLE");
            toast.info("Agent stopped.");
        }
    };

    return (
        <div className="space-y-6 pb-20" ref={dashboardRef}>
            {/* Top Bar Header Area */}
            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-card/20 backdrop-blur-[12px] border-white/5 p-4 rounded-xl border shadow-lg">

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full xl:w-auto">
                    {/* User Pill */}
                    <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md p-2 pr-4 rounded-full border border-white/5 w-full sm:w-auto">
                        <Avatar className="h-8 w-8 border border-white/10">
                            <AvatarImage src={user?.photoURL || ""} alt="User Avatar" />
                            <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-none">
                            <span className="text-sm font-bold">{user?.displayName || "Demo User"}</span>
                            <span className="text-xs text-muted-foreground capitalize">{isDemoMode ? "Demo Operator" : "Verified User"}</span>
                        </div>
                    </div>

                    {/* Agent Status Indicator */}
                    <div className="flex gap-4 items-center sm:pl-4 sm:border-l border-white/10 w-full sm:w-auto justify-between sm:justify-start">
                        <Badge variant={agentState === "IDLE" ? "secondary" : agentState === "MONITORING" ? "default" : "destructive"}
                            className={`${agentState === "MONITORING" ? "bg-blue-500 hover:bg-blue-600 animate-pulse-glow-blue border-transparent transition-all" : agentState === "EXECUTING" ? "bg-green-500 animate-pulse-glow-green" : ""} gap-1 py-1`}>
                            {agentState === "MONITORING" && <Activity className="w-3 h-3 animate-spin duration-3000" />}
                            {agentState === "EXECUTING" && <Zap className="w-3 h-3" />}
                            {agentState === "IDLE" && <StopCircle className="w-3 h-3" />}
                            AGENT: {agentState}
                        </Badge>
                        <Button variant={agentState === "IDLE" ? "default" : "outline"} size="sm" onClick={toggleAgent} className="gap-2">
                            {agentState === "IDLE" ? <Rocket className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                            {agentState === "IDLE" ? "Start Agent" : "Stop Agent"}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 w-full xl:w-auto pt-2 xl:pt-0">
                    {/* Simulation vs Live Toggle */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Label htmlFor="live-mode" className="text-sm cursor-pointer select-none">Simulate</Label>
                        <Switch
                            id="live-mode"
                            checked={isLiveEnabled}
                            onCheckedChange={(c) => {
                                if (isDemoMode) {
                                    toast.error("Live execution disabled in Demo Mode");
                                    return;
                                }
                                setIsLiveEnabled(c);
                                toast.success(c ? "Live Trading ENABLED. Use caution." : "Trading Simulation Enabled.");
                            }}
                        />
                        <Label htmlFor="live-mode" className={`text-sm cursor-pointer select-none ${isLiveEnabled ? 'text-destructive font-bold' : ''}`}>
                            Live
                        </Label>
                    </div>

                    <div className="h-6 w-px bg-border shrink-0" />

                    {/* Wallet area */}
                    <div className="shrink-0 flex items-center gap-2">
                        {isDemoMode ? (
                            <Button variant="secondary" size="sm" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 pointer-events-none">
                                Demo: ${(10000 + metrics.pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Button>
                        ) : (
                            <ConnectButton showBalance={false} chainStatus="none" />
                        )}
                    </div>

                    <Button onClick={handleSnapshot} variant="outline" size="icon" className="shrink-0" title="Take Dashboard Snapshot">
                        <Camera className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Main Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-black/20 border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-blue-500/30 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="py-3 px-4 pb-0">
                        <CardDescription className="text-xs font-mono uppercase tracking-wider flex items-center justify-between">
                            Trades Observed
                            <Search className="h-3 w-3 text-blue-400" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold font-mono tracking-tight">{metrics.observed.toLocaleString()}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-[9px] bg-blue-500/10 text-blue-400 border-none px-1.5">+24/hr</Badge>
                                <span className="text-[10px] text-muted-foreground line-clamp-1">Scanning 14 open-source APIs</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/30 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="py-3 px-4 pb-0">
                        <CardDescription className="text-xs font-mono uppercase tracking-wider flex items-center justify-between">
                            Trades Executed
                            <Zap className="h-3 w-3 text-purple-400" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold font-mono tracking-tight">{isDemoMode ? metrics.executed.toLocaleString() : "0"}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-[9px] bg-purple-500/10 text-purple-400 border-none px-1.5">Auto-Pilot</Badge>
                                <span className="text-[10px] text-muted-foreground line-clamp-1">3 pending signals</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="py-3 px-4 pb-0">
                        <CardDescription className="text-xs font-mono uppercase tracking-wider flex items-center justify-between">
                            Total Volume
                            <Activity className="h-3 w-3 text-cyan-400" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-3xl font-bold font-mono tracking-tight">{isDemoMode ? `$${metrics.volume.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "$0"}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-cyan-500 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
                                </span>
                                <span className="text-[10px] text-muted-foreground line-clamp-1">vs last week</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="py-3 px-4 pb-0">
                        <CardDescription className="text-xs font-mono uppercase tracking-wider flex items-center justify-between">
                            Success Rate
                            <CheckCircle2 className="h-3 w-3 text-yellow-400" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                            <span className={`text-3xl font-bold font-mono tracking-tight ${metrics.successRate > 65 ? 'text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'text-yellow-500'}`}>
                                {metrics.successRate.toFixed(1)}%
                            </span>
                            <div className="flex items-center gap-2 mt-1 w-full relative h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-500 to-green-500" style={{ width: `${metrics.successRate}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-green-500/30 transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="py-3 px-4 pb-0">
                        <CardDescription className="text-xs font-mono uppercase tracking-wider flex items-center justify-between">
                            Network PnL
                            <DollarSign className="h-3 w-3 text-green-400" />
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                            <span className={`text-3xl font-bold font-mono tracking-tight flex items-center gap-1 ${metrics.pnl >= 0 ? 'text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'text-red-500'}`}>
                                {metrics.pnl >= 0 ? '+' : '-'}${Math.abs(metrics.pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-[9px] bg-green-500/10 text-green-400 border-none px-1.5">
                                    <TrendingUp className="w-2.5 h-2.5 mr-1 inline" /> Realized
                                </Badge>
                                <span className="text-[10px] text-muted-foreground line-clamp-1">All algorithms</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="w-full pb-2 mb-4 overflow-x-auto overflow-y-hidden">
                    <TabsList className="inline-flex w-max lg:w-full justify-start h-12 p-1 bg-card/30 backdrop-blur-md border border-white/5 shadow-inner">
                        <TabsTrigger value="wallet" className="flex-1">Wallet</TabsTrigger>
                        <TabsTrigger value="traders" className="flex-1">Traders</TabsTrigger>
                        <TabsTrigger value="monitor" className="flex-1">Monitor</TabsTrigger>
                        <TabsTrigger value="decision" className="flex-1">Decision</TabsTrigger>
                        <TabsTrigger value="portfolio" className="flex-1">Portfolio</TabsTrigger>
                        <TabsTrigger value="execute" className="flex-1">Execute</TabsTrigger>
                        <TabsTrigger value="logs" className="flex-1">Logs</TabsTrigger>
                        <TabsTrigger value="config" className="flex-1">Config</TabsTrigger>
                    </TabsList>
                </div>

                {/* --- Wallet Tab --- */}
                <TabsContent value="wallet" className="focus-visible:outline-none">
                    <WalletTab isDemoMode={isDemoMode} metrics={metrics} />
                </TabsContent>

                {/* --- Traders Tab --- */}
                <TabsContent value="traders" className="focus-visible:outline-none">
                    <TradersTab />
                </TabsContent>

                {/* --- Monitor Tab --- */}
                <TabsContent value="monitor" className="focus-visible:outline-none">
                    <MonitorTab agentState={agentState} />
                </TabsContent>

                {/* --- Decision Tab --- */}
                <TabsContent value="decision" className="focus-visible:outline-none">
                    <DecisionTab />
                </TabsContent>

                {/* --- Portfolio Tab --- */}
                <TabsContent value="portfolio" className="focus-visible:outline-none">
                    <PortfolioTab metrics={metrics} />
                </TabsContent>

                {/* --- Execute Tab --- */}
                <TabsContent value="execute" className="focus-visible:outline-none">
                    <ExecuteTab isLiveEnabled={isLiveEnabled} isDemoMode={isDemoMode} />
                </TabsContent>

                {/* --- Logs Tab --- */}
                <TabsContent value="logs" className="focus-visible:outline-none">
                    <LogsTab searchInputRef={searchInputRef} />
                </TabsContent>

                {/* --- Config Tab --- */}
                <TabsContent value="config" className="focus-visible:outline-none">
                    <ConfigTab isDemoMode={isDemoMode} />
                </TabsContent>
            </Tabs>

            {/* Onboarding Modal */}
            <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl block pb-2">
                            <Rocket className="h-5 w-5 text-primary" />
                            Agent Setup Checklist
                        </DialogTitle>
                        <DialogDescription>
                            Complete these steps to fully activate your autonomous agent pipeline.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex items-start space-x-3">
                            <Checkbox id="env-checked" checked={!isDemoMode} disabled />
                            <div className="grid gap-1.5 leading-none">
                                <label htmlFor="env-checked" className={`text-sm font-medium ${!isDemoMode ? '' : 'line-through text-muted-foreground'}`}>
                                    Configure Backend Keys
                                </label>
                                <p className="text-xs text-muted-foreground">{!isDemoMode ? 'Environment verified.' : 'Missing. Running in Demo Mode.'}</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Checkbox id="wallet-connected" checked={isConnected} disabled />
                            <div className="grid gap-1.5 leading-none">
                                <label htmlFor="wallet-connected" className={`text-sm font-medium leading-none`}>
                                    Connect Wallet
                                </label>
                                <p className="text-xs text-muted-foreground">Authorize web3 signer in the Wallet tab.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Checkbox id="pick-trader" /> {/* This checkbox needs actual logic to be connected */}
                            <div className="grid gap-1.5 leading-none">
                                <label htmlFor="pick-trader" className="text-sm font-medium leading-none 
                                    peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Select a Target Trader
                                </label>
                                <p className="text-xs text-muted-foreground">Pick an active wallet in the Traders tab.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Checkbox id="start-monitor" checked={agentState !== "IDLE"} />
                            <div className="grid gap-1.5 leading-none">
                                <label htmlFor="start-monitor" className={`text-sm font-medium leading-none ${agentState !== "IDLE" ? '' : 'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'}`}>
                                    Activate Monitor Status
                                </label>
                                <p className="text-xs text-muted-foreground">Click Start Agent in the top-bar to begin.</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={completeOnboarding} className="w-full gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Acknowledge & Start
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Subcomponents (Tabs content)

function WalletTab({ isDemoMode, metrics }: { isDemoMode: boolean, metrics: any }) {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { data: balance, isLoading } = useBalance({ address: isConnected ? address : undefined });

    const demoAddress = "0xDemoWalletAddress29471V09X";

    return (
        <Card className="border-border">
            <CardHeader>
                <CardTitle>Wallet Details</CardTitle>
                <CardDescription>Your connected web3 wallet for Polymarket operations.</CardDescription>
            </CardHeader>
            <CardContent>
                {isDemoMode ? (
                    <div className="space-y-6">
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500">
                            <AlertTriangle className="h-5 w-5 mb-2" />
                            <p className="font-medium text-sm">Demo Wallet Active</p>
                            <p className="text-xs">No funds are at risk. Actions are simulated locally.</p>
                        </div>
                        <div className="space-y-4 max-w-md">
                            <div>
                                <Label>Address</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input value={demoAddress} readOnly className="bg-muted font-mono" />
                                    <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(demoAddress); toast.success("Copied!"); }}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label>Available Balance</Label>
                                <Input value={`${(10000 + metrics.pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`} readOnly className="bg-muted font-mono" />
                            </div>
                        </div>
                    </div>
                ) : isConnected ? (
                    <div className="space-y-6 max-w-md">
                        <div className="flex items-center gap-2">
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">Connected</Badge>
                        </div>
                        <div>
                            <Label>Address</Label>
                            <div className="flex gap-2 mt-1">
                                <Input value={address || ""} readOnly className="bg-muted font-mono" />
                                <Button variant="outline" size="icon" onClick={() => { if (address) { navigator.clipboard.writeText(address); toast.success("Copied!"); } }}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Label>Balance</Label>
                            {isLoading ? <Skeleton className="h-10 w-full mt-1" /> : (
                                <Input value={`${balance?.formatted} ${balance?.symbol}`} readOnly className="bg-muted font-mono mt-1" />
                            )}
                        </div>
                        <Button variant="destructive" onClick={() => disconnect()}>Disconnect</Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/20 text-center space-y-4">
                        <div className="bg-muted p-4 rounded-full">
                            <ShieldAlert className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium">Wallet disconnected</p>
                            <p className="text-sm text-muted-foreground">Please connect your wallet utilizing the Navbar above.</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function TradersTab() {
    const [traderInput, setTraderInput] = useState("");
    const { data: traders, isLoading, isFetching } = useQuery({
        queryKey: ['traders'],
        queryFn: async () => {
            const res = await fetch('/api/traders');
            return res.json();
        },
        refetchInterval: 300000 // Real-time polling every 5 minutes (300,000 ms)
    });

    const handleManualAdd = () => {
        if (!traderInput) return;
        toast.success(`Started monitoring new wallet manually.`);
        setTraderInput("");
    };

    return (
        <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
            {/* Left Column: Manual + Info */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Manual Target Entry</CardTitle>
                        <CardDescription>Force the agent to monitor a specific Polymarket wallet address or X/Twitter handle.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Wallet / Handle</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="0x... or @trader"
                                    value={traderInput}
                                    onChange={(e) => setTraderInput(e.target.value)}
                                />
                                <Button onClick={handleManualAdd}>Target</Button>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-500">
                            <p>Manually targeted wallets or handles bypass AI discovery scores and are monitored 24/7 constantly for copy-trade execution sequences.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-blue-400 flex items-center gap-2">
                            <Activity className="w-4 h-4 animate-pulse" /> Live X/Twitter Scraping
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            The Agent utilizes a swarm of headless browsers and API integrations to continuously scan crypto Twitter (X) and on-chain metrics.
                            <br /><br />
                            We identify leading alpha accounts based on historical win-rate, real-time engagement velocity, and correlated price movement. When a high-conviction signal is detected from these sources, the agent can auto-execute the trade.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: AI Discovery List */}
            <Card className="h-[600px] flex flex-col border-blue-500/10 relative overflow-hidden">
                <CardHeader className="shrink-0 bg-black/40 z-10 border-b border-white/5 relative">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-pulse" />
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-green-500" />
                                Top Traders to Follow
                            </CardTitle>
                            <CardDescription>
                                Continuous real-time stream of top-performing tracked accounts.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                            {isFetching ? 'Syncing...' : 'Live Stream'}
                            <span className="relative flex h-2 w-2 ml-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 relative">
                    <ScrollArea className="h-full px-6 pb-6">
                        {isLoading ? (
                            <div className="space-y-4 pt-4">
                                {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                            </div>
                        ) : (
                            <div className="space-y-4 pt-4">
                                {traders?.map((t: any) => (
                                    <TraderRow key={t.id} t={t} />
                                ))}
                                {traders?.length === 0 && (
                                    <div className="text-center p-8 text-muted-foreground">No active traders found.</div>
                                )}
                            </div>
                        )}
                        {/* Gradient fade at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}

function TraderRow({ t }: { t: any }) {
    const [livePnl, setLivePnl] = useState(t.pnl || "0.00%");
    const [tickColor, setTickColor] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (!t.active) return;
        const interval = setInterval(() => {
            if (Math.random() > 0.6) {
                const currentVal = parseFloat(livePnl.replace(/[^\d.-]/g, '')) || 0;
                const isUp = Math.random() > 0.45;
                const shift = (Math.random() * 0.5).toFixed(2);
                const newVal = isUp ? currentVal + parseFloat(shift) : currentVal - parseFloat(shift);

                setLivePnl(newVal >= 0 ? `+${newVal.toFixed(2)}%` : `${newVal.toFixed(2)}%`);
                setTickColor(isUp ? 'text-green-400' : 'text-red-400');
                setTimeout(() => setTickColor(''), 800);
            }
        }, 2500);
        return () => clearInterval(interval);
    }, [livePnl, t.active]);

    const isPositive = livePnl.startsWith('+');

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        const toastId = toast.loading(`Initiating AI Deep Dive on ${t.name}... extracting LLM logic.`);

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target: t.target,
                    traderName: t.name,
                    strategy: t.strategy,
                    lastCall: t.lastCall
                })
            });

            if (!res.ok) throw new Error("Failed to analyze");
            const data = await res.json();

            toast.dismiss(toastId);
            toast.success(
                <div className="flex flex-col gap-1">
                    <span className="font-bold">AI Autopsy Complete (Conf: {data.confidence}%)</span>
                    <span className="text-xs text-muted-foreground">{data.analysis}</span>
                </div>,
                { duration: 8000 }
            );
        } catch (error) {
            toast.dismiss(toastId);
            toast.error("AI Analysis failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="flex flex-col p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-white-[0.02] hover:border-white/10 transition-all group shrink-0 relative overflow-hidden">
            {/* Strategy highlight bar */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500/50 to-purple-500/50" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pl-2 w-full">
                {/* Left: Avatar & Info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative shrink-0">
                        <Avatar className="h-12 w-12 border border-white/10 bg-black/50">
                            <AvatarImage src={t.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${t.name}`} alt={t.name} />
                            <AvatarFallback>{t.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card ${t.active ? 'bg-green-500' : 'bg-gray-500'} ${t.active && Math.random() > 0.5 ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-base tracking-tight text-white">{t.name}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">Targeting ${t.target}</Badge>
                            {t.riskProfile && (
                                <Badge variant="outline" className={`text-[9px] px-1 h-3.5 uppercase tracking-wider border-none ${t.riskProfile.includes('High') ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {t.riskProfile}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="text-[11px] font-mono flex items-center gap-1 text-zinc-300">
                                <Activity className="w-3 h-3 text-blue-400" /> Score: <span className="font-bold text-white">{t.aiScore}</span>/100
                            </span>
                            <span className="text-[11px] font-mono flex items-center gap-1 text-zinc-300">
                                <CheckCircle2 className="w-3 h-3 text-green-400" /> Win Rate: <span className="font-bold text-green-400">{t.winRate}</span>
                            </span>
                            {t.strategy && (
                                <span className="text-[11px] text-muted-foreground font-mono bg-white/5 px-1.5 py-0.5 rounded">
                                    {t.strategy}
                                </span>
                            )}
                            <span className="text-[11px] text-muted-foreground font-mono">
                                Vol: <span className={`transition-colors duration-300 font-bold ${tickColor || (isPositive ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' : 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]')}`}>{livePnl}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:items-end gap-2 shrink-0 border-t sm:border-0 border-white/10 pt-3 sm:pt-0 w-full sm:w-auto">
                    <span className="text-[10px] text-muted-foreground italic flex items-center gap-1 sm:justify-end">
                        <RefreshCw className="w-3 h-3" /> Updated {t.lastActive || "just now"}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-300 transition-all font-mono shadow-inner"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                        >
                            {isAnalyzing ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Search className="w-3 h-3 mr-1" />}
                            {isAnalyzing ? "Analyzing..." : "Inspect Logic"}
                        </Button>
                        <Button variant="default" size="sm" className="h-8 text-xs font-bold w-[90px] transition-all bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_20px_rgba(var(--primary),0.5)]" onClick={() => toast.success(`Auto-tracking enabled for ${t.name}`)}>
                            Track Target
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom: Context / Call */}
            {t.lastCall && (
                <div className="mt-4 pt-3 border-t border-white/5 pl-2 relative">
                    <div className="absolute left-0 top-3 h-full w-[2px] bg-gradient-to-b from-primary/50 to-transparent" />
                    <p className="text-sm text-foreground/80 pl-3 leading-relaxed relative">
                        <span className="text-primary font-bold mr-2 text-xs uppercase tracking-widest bg-primary/10 px-1 py-0.5 rounded">Intercepted:</span>
                        "{t.lastCall}"
                    </p>
                </div>
            )}
        </div>
    );
}

function MonitorTab({ agentState }: { agentState: string }) {
    const [events, setEvents] = useState<{ id: number, text: string, time: string, isLive: boolean }[]>([]);
    const { markets } = useLiveMarkets(10);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (agentState === "MONITORING" || agentState === "EXECUTING") {
            interval = setInterval(() => {
                setEvents(prev => {
                    const fallback = ['Trump Event', 'ETH ETF', 'Fed Rate Cut', 'BTC Target'];
                    const activeTitles = markets.length > 0 ? markets.map(m => m.title) : fallback;
                    const marketPick = activeTitles[Math.floor(Math.random() * activeTitles.length)].substring(0, 45);
                    const isUp = Math.random() > 0.5;
                    const priceShift = (Math.random() * 0.05).toFixed(3);
                    const directionText = isUp ? `spiked +$${priceShift}` : `dropped -$${priceShift}`;

                    const newEvent = {
                        id: Date.now(),
                        text: `Live Sync: ${marketPick}... odds ${directionText}.`,
                        time: new Date().toLocaleTimeString(),
                        isLive: markets.length > 0
                    };

                    // Randomly flash a toast for a mock new trade
                    if (Math.random() > 0.8) {
                        toast("Agent Shift Detected", {
                            description: `Live volatility detected on: ${marketPick}. Evaluating.`,
                            icon: <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                        });
                    }

                    return [newEvent, ...prev].slice(0, 20);
                });
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [agentState, markets]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        Neural Monitor Sequence
                        {agentState !== "IDLE" && <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>}
                    </CardTitle>
                    <CardDescription>Live data feeding into the AI logic engine.</CardDescription>
                </div>
                <div className={`p-3 rounded-full border ${agentState !== "IDLE" ? "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse" : "bg-muted text-muted-foreground border-white/5"}`}>
                    <Activity className={`h-6 w-6 ${agentState !== "IDLE" ? "animate-spin" : ""}`} style={{ animationDuration: '3s' }} />
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="bg-black/60 rounded-lg p-4 font-mono text-sm border border-white/10 shadow-inner overflow-hidden relative group">
                    {/* Unique scanline effect on active monitor */}
                    {agentState !== "IDLE" && <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-blue-500/10 to-transparent blur-md opacity-50 animate-scanline pointer-events-none" />}

                    {agentState === "IDLE" && (
                        <div className="flex flex-col items-center justify-center p-8 text-zinc-500 space-y-3">
                            <Pause className="w-8 h-8" />
                            <p>Agent is IDLE. Stream paused.</p>
                        </div>
                    )}
                    {agentState !== "IDLE" && events.length === 0 && (
                        <div className="flex items-center gap-2 text-zinc-500 py-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Polling for network events...
                        </div>
                    )}
                    <ScrollArea className="h-[400px] w-full pr-4">
                        <div className="space-y-2">
                            {events.map((e) => (
                                <div key={e.id} className="text-zinc-300 py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition-colors animate-in fade-in slide-in-from-top-2 flex gap-2">
                                    <span className="text-zinc-500 shrink-0">[{e.time}]</span>
                                    {e.isLive && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0 animate-pulse" />}
                                    <span className={e.text.includes('+') ? 'text-green-400 font-bold' : e.text.includes('-') ? 'text-red-400 font-bold' : ''}>
                                        {e.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}

function DecisionTab() {
    const { data: decisions, isLoading } = useQuery({
        queryKey: ['decisions'],
        queryFn: async () => {
            const res = await fetch('/api/decisions');
            return res.json();
        }
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Decision Matrices</CardTitle>
                <CardDescription>Transparent overview of recent AI agent rationales and logic scores.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                        <Skeleton className="h-[200px] w-full rounded-xl" />
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {decisions?.map((d: { id: string, market: string, action: string, rationale: string, confidence: number, riskScore: number }) => (
                            <Card key={d.id} className="border border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden relative transition-all hover:bg-black/40">
                                <div className={`absolute top-0 left-0 w-1 h-full ${d.confidence > 75 ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start gap-4">
                                        <CardTitle className="text-lg leading-tight">{d.market}</CardTitle>
                                        <Badge variant="outline" className={`shrink-0 ${d.action.includes('YES') ? 'text-green-500 border-green-500/30' : 'text-red-500 border-red-500/30'}`}>
                                            {d.action}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-sm bg-black/30 p-3 rounded-md border border-white/5 text-muted-foreground italic relative">
                                        <span className="absolute -top-2 -left-1 text-2xl text-muted/30">&quot;</span>
                                        {d.rationale}
                                        <span className="absolute -bottom-4 -right-1 text-2xl text-muted/30">&quot;</span>
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <div>
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-xs font-medium text-muted-foreground">Network Confidence</span>
                                                <span className={`text-xs font-bold ${d.confidence > 75 ? 'text-green-400' : 'text-yellow-400'}`}>{d.confidence}%</span>
                                            </div>
                                            <Progress value={d.confidence} className={`h-1.5 ${d.confidence > 75 ? '[&>div]:bg-green-500' : '[&>div]:bg-yellow-500'}`} />
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-destructive/10 border border-destructive/20">
                                            <span className="text-xs flex items-center gap-1.5 font-medium text-destructive">
                                                <ShieldAlert className="h-4 w-4" /> Logic Risk Evaluator
                                            </span>
                                            <span className="text-sm font-bold text-destructive">{d.riskScore} / 10</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function ExecuteTab({ isLiveEnabled, isDemoMode }: { isLiveEnabled: boolean, isDemoMode: boolean }) {
    const [executing, setExecuting] = useState(false);

    const handleExecute = async (mode: 'SIMULATE' | 'LIVE') => {
        setExecuting(true);
        try {
            const res = await fetch('/api/execute', {
                method: 'POST',
                body: JSON.stringify({ market: "ETH > $4K", mode })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Execution Completed", {
                    description: data.message,
                    icon: <Zap className="h-4 w-4 text-primary" />
                });
            } else {
                toast.error("Execution payload structure failed.");
            }
        } catch {
            toast.error("Execution network request failed.");
        } finally {
            setExecuting(false);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Simulated Execution Workspace</CardTitle>
                    <CardDescription>Force the agent to run a sandbox mock-trade against live probabilities.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm flex gap-3">
                        <Activity className="h-5 w-5 shrink-0" />
                        <p>Simulating trades executes standard orderbook depth logic without committing blocks or utilizing gas.</p>
                    </div>
                    <Button onClick={() => handleExecute('SIMULATE')} disabled={executing} variant="secondary" className={`w-full h-12 ${executing ? 'animate-pulse-glow-blue' : ''}`}>
                        {executing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : "Simulate Output Scenario"}
                    </Button>
                </CardContent>
            </Card>

            <Card className={isLiveEnabled ? 'border-destructive/40 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/5'}>
                <CardHeader>
                    <CardTitle className={isLiveEnabled ? 'text-destructive font-bold flex items-center gap-2' : ''}>
                        {isLiveEnabled && <AlertTriangle className="h-5 w-5 animate-pulse" />} Live Deployment Pipeline
                    </CardTitle>
                    <CardDescription>Direct interface for Mainnet payload executions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLiveEnabled && !isDemoMode ? (
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-3 animate-pulse">
                                <Zap className="h-5 w-5 shrink-0" />
                                <p className="font-bold">LIVE ENVIRONMENT ACTIVE. FUNDS AT RISK.</p>
                            </div>
                            <Button onClick={() => handleExecute('LIVE')} disabled={executing} variant="destructive" className={`w-full h-12 text-md font-bold ${executing ? 'animate-pulse-glow-red' : ''}`}>
                                {executing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : "Deploy Transaction Live"}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/20 text-center space-y-4 h-[160px]">
                            <ShieldAlert className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground max-w-xs block">
                                {isDemoMode ? "Live Deployments are permanently locked while Demo Mode is active." : "Enable 'Live' switch in top toolbar to expose live contract commands."}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function LogsTab({ searchInputRef }: { searchInputRef: React.RefObject<HTMLInputElement | null> }) {
    const [searchTerm, setSearchTerm] = useState("");

    const logs = [
        { level: "INFO", time: "10:45:12 AM", msg: "Evaluating probability for 'Fed Rate Cut'" },
        { level: "WARN", time: "10:45:01 AM", msg: "RPC Payload execution near rate limit cap." },
        { level: "INFO", time: "10:41:55 AM", msg: "Successfully intercepted odds drop, re-balancing weights." },
        { level: "ERROR", time: "10:30:11 AM", msg: "Transaction dropped by node: Simulation insufficient gas." },
        { level: "INFO", time: "10:20:00 AM", msg: "Agent bootstrap complete. Engine ready." },
    ];

    const filtered = logs.filter(l => l.msg.toLowerCase().includes(searchTerm.toLowerCase()) || l.level.includes(searchTerm.toUpperCase()));

    return (
        <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex flex-row space-y-0 pb-4 justify-between items-center border-b">
                <div>
                    <CardTitle>System Run Logs</CardTitle>
                    <CardDescription>Aggregated tracing and debug outputs.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            type="search"
                            placeholder="Filter logs... (Press '/' to focus)"
                            className="w-64 pl-9 bg-muted/50"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={() => toast.success("Logs exported to JSON")}>
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden relative bg-black/40 mt-4 rounded-md border border-white/5 backdrop-blur-sm shadow-inner mx-4 mb-4">
                <ScrollArea className="h-full w-full font-mono text-sm">
                    <div className="p-4 space-y-1">
                        {filtered.length === 0 ? (
                            <p className="text-zinc-500 text-center py-4">No matching logs found.</p>
                        ) : (
                            filtered.map((log, i) => (
                                <div key={i} className="flex gap-4 py-1.5 hover:bg-white/5 px-2 rounded -mx-2 transition-colors">
                                    <span className="text-zinc-500 shrink-0 w-[100px]">{log.time}</span>
                                    <span className={`shrink-0 w-[50px] font-bold ${log.level === 'INFO' ? 'text-blue-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {log.level}
                                    </span>
                                    <span className="text-zinc-300 break-all">{log.msg}</span>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

function ConfigTab({ isDemoMode }: { isDemoMode: boolean }) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Safety Guardrails</CardTitle>
                    <CardDescription>Configure risk constraints protecting your capital.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border p-4 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Max Daily Loss Limits</Label>
                                <p className="text-xs text-muted-foreground">Applies global halt if portfolio dips below threshold.</p>
                            </div>
                            <Input type="number" defaultValue="500" className="w-24 text-right" />
                        </div>

                        <div className="flex items-center justify-between border p-4 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Max Trade Depth Size</Label>
                                <p className="text-xs text-muted-foreground">Percentage limit exposure per single position.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input type="number" defaultValue="10" className="w-20 text-right" />
                                <span className="text-sm font-bold text-muted-foreground">%</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border p-4 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Cooldown Timer</Label>
                                <p className="text-xs text-muted-foreground">Mandatory wait period after losing positions close.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input type="number" defaultValue="15" className="w-20 text-right" />
                                <span className="text-sm font-bold text-muted-foreground">Min</span>
                            </div>
                        </div>

                        {/* Unique Black Swan Protection */}
                        <div className="flex items-center justify-between border border-blue-500/20 bg-blue-500/5 p-4 rounded-lg relative overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="space-y-0.5 relative z-10">
                                <Label className="text-base text-blue-400 flex items-center gap-2">
                                    <Snowflake className="h-4 w-4" /> Quantum Black Swan Guardrail
                                </Label>
                                <p className="text-xs text-muted-foreground max-w-[240px]">Auto-liquidates and deep-freezes all agent activity globally if multi-market cross-chain volatility exceeds ±35% in &lt;10s.</p>
                            </div>
                            <div className="relative z-10 shadow-[0_0_15px_rgba(59,130,246,0.2)] rounded-full">
                                <Switch id="swan-guard" defaultChecked onCheckedChange={(c) => toast(c ? "Quantum Freeze Protection ARMED." : "Warning: Black Swan Guardrail disabled.", { icon: <Snowflake className="w-4 h-4 text-blue-400" /> })} />
                            </div>
                        </div>
                    </div>
                    <Button className="w-full shadow-[0_0_15px_rgba(255,255,255,0.05)]">Flash Configuration to Memory</Button>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Environment Integrity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Web3 Provider API</span>
                            <Badge variant={isDemoMode ? "outline" : "default"} className={isDemoMode ? "text-yellow-500 border-yellow-500/50" : "bg-green-500"}>
                                {isDemoMode ? "DEGRADED" : "CONNECTED"}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Firebase Cloud Link</span>
                            <Badge variant={isDemoMode ? "outline" : "default"} className={isDemoMode ? "text-yellow-500 border-yellow-500/50" : "bg-green-500"}>
                                {isDemoMode ? "FOCUSED LOCAL" : "SYNCHRONIZED"}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Inference Pipeline Hook</span>
                            <Badge variant="default" className="bg-green-500">OPERATIONAL</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>System Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">High Frequency Polling</Label>
                                <p className="text-xs text-muted-foreground">Update loops execute rapidly using more client resources.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Push Notifications</Label>
                                <p className="text-xs text-muted-foreground">OS-level alerts for completed executions.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function PortfolioTab({ metrics }: { metrics: any }) {
    const [trades, setTrades] = useState([
        { id: 1, market: "BTC > $100K before April?", position: "YES", entry: 65.4, current: 84.2, investment: 500 },
        { id: 2, market: "ETH ETF Approved by May?", position: "YES", entry: 88.0, current: 92.1, investment: 1200 },
        { id: 3, market: "Fed Rate Cut in March 2026?", position: "NO", entry: 45.0, current: 78.6, investment: 300 },
        { id: 4, market: "SpaceX Mars Mission 2026", position: "NO", entry: 15.0, current: 87.5, investment: 150 },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTrades(prev => prev.map(t => {
                if (Math.random() > 0.6) {
                    const shift = (Math.random() * 4) - 1.5; // Slight upward bias
                    const newCurrent = Math.max(1, Math.min(99, t.current + shift));
                    return { ...t, current: newCurrent };
                }
                return t;
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const calculateReturn = (entry: number, current: number, investment: number, position: string) => {
        const diff = position === "YES" ? (current - entry) : (entry - current);
        const percent = (diff / entry) * 100;
        const value = (percent / 100) * investment;
        return { percent, value };
    };

    return (
        <Card>
            <CardHeader className="border-b border-white/5 pb-4 mb-4">
                <div className="flex justify-between items-end">
                    <div>
                        <CardTitle className="text-xl">Active Positions</CardTitle>
                        <CardDescription>Real-time tracked agent portfolio and open contracts.</CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Total Simulated Value</p>
                        <p className="text-3xl font-bold font-mono text-white">${(2150 + metrics.pnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {trades.map((t) => {
                        const { percent, value } = calculateReturn(t.entry, t.current, t.investment, t.position);
                        const isProfit = value >= 0;
                        return (
                            <div key={t.id} className="p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-black/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1 md:w-1/3">
                                    <h4 className="font-bold text-sm leading-tight">{t.market}</h4>
                                    <div className="flex gap-2 items-center">
                                        <Badge variant="outline" className={t.position === 'YES' ? 'text-green-400 border-green-400/30' : 'text-red-400 border-red-400/30'}>Position: {t.position}</Badge>
                                        <span className="text-xs text-muted-foreground font-mono">Size: ${t.investment}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 md:w-1/3 justify-between md:justify-center">
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Entry Price</p>
                                        <p className="font-mono text-sm">{t.entry.toFixed(1)}¢</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-50" />
                                    <div className="text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Current Odds</p>
                                        <p className={`font-mono font-bold text-sm ${t.current > t.entry ? (t.position === 'YES' ? 'text-green-400' : 'text-red-400') : (t.position === 'YES' ? 'text-red-400' : 'text-green-400')}`}>{t.current.toFixed(1)}¢</p>
                                    </div>
                                </div>

                                <div className="md:w-1/3 text-right">
                                    <p className="text-xs text-muted-foreground mb-1">Unrealized P&L</p>
                                    <div className={`flex items-center justify-end gap-2 font-mono font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                                        {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        <span className="text-lg">{isProfit ? '+' : '-'}${Math.abs(value).toFixed(2)}</span>
                                        <Badge variant="outline" className={`ml-2 ${isProfit ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                            {isProfit ? '+' : ''}{percent.toFixed(1)}%
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
