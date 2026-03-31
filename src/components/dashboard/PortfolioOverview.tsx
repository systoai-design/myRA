import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { Target, TrendingUp, Wallet, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

interface ChartData {
    type: 'pie' | 'bar' | 'area';
    title: string;
    data: any[];
}

interface PortfolioOverviewProps {
    buckets: { preTax: number; postTax: number; taxFree: number };
    activeChart: ChartData | null;
}

const COLORS = ['#0ea5e9', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

export default function PortfolioOverview({ buckets, activeChart }: PortfolioOverviewProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const totalAssets = buckets.preTax + buckets.postTax + buckets.taxFree;
    
    // Theme-aware colors for charts
    const axisColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
    const tooltipBg = isDark ? '#000' : '#fff';
    const tooltipBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const tooltipText = isDark ? '#fff' : '#000';
    const legendColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
    
    // Default chart if no active chart from AI
    const defaultData = totalAssets > 0 ? [
        { name: 'Pre-Tax', value: buckets.preTax },
        { name: 'Post-Tax', value: buckets.postTax },
        { name: 'Tax-Free', value: buckets.taxFree },
    ] : [
        { name: 'No Data Yet', value: 1 }
    ];

    const currentChart = activeChart || {
        type: 'pie',
        title: totalAssets > 0 ? 'Current Asset Allocation' : 'Awaiting Details...',
        data: defaultData
    };

    const renderChart = () => {
        if (currentChart.data.length === 1 && currentChart.data[0].name === 'No Data Yet') {
            return (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                    <Wallet className="w-12 h-12 opacity-50" />
                    <p className="font-mono text-sm">Tell myra about your assets to visualize them here.</p>
                </div>
            );
        }

        switch (currentChart.type) {
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={currentChart.data}
                                cx="50%"
                                cy="45%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {currentChart.data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip 
                                formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText }}
                                itemStyle={{ color: tooltipText }}
                            />
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: legendColor }} />
                        </PieChart>
                    </ResponsiveContainer>
                );
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={currentChart.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="name" stroke={axisColor} style={{ fontSize: '12px' }} />
                            <YAxis stroke={axisColor} style={{ fontSize: '12px' }} tickFormatter={(value) => `$${value/1000}k`} />
                            <RechartsTooltip 
                                formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                                cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText }}
                            />
                            <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                                {currentChart.data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'area':
            default:
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={currentChart.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: axisColor, fontSize: 10, fontWeight: 'bold'}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: axisColor, fontSize: 10, fontWeight: 'bold'}} tickFormatter={(value) => `$${value/1000}k`} />
                            <RechartsTooltip 
                                formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                                contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', color: tooltipText }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold font-serif text-foreground tracking-tight">Your Portfolio</h2>
                    <p className="text-muted-foreground text-sm mt-1">Holistic view of your retirement architecture.</p>
                </div>
                <div className="flex gap-3">
                     <span className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Protected Hub
                     </span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-premium border border-black/5 dark:border-white/5 rounded-[32px] p-6 flex flex-col justify-center relative shadow-lg group">
                    <div className="absolute -right-4 -bottom-4 bg-primary/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
                    <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Wallet className="w-3.5 h-3.5 text-primary" /> Total Assets
                    </div>
                    <div className="text-3xl font-bold font-serif text-foreground">
                        {totalAssets > 0 
                            ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalAssets)
                            : '$0'}
                    </div>
                </div>
                
                <div className="glass-premium border border-black/5 dark:border-white/5 rounded-[32px] p-6 flex flex-col justify-center relative shadow-lg group">
                    <div className="absolute -right-4 -bottom-4 bg-green-500/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
                    <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Target Income
                    </div>
                    <div className="text-3xl font-bold font-serif text-foreground">
                        $0<span className="text-lg text-muted-foreground font-sans">/mo</span>
                    </div>
                </div>

                <div className="glass-premium border border-black/5 dark:border-white/5 rounded-[32px] p-6 flex flex-col justify-center relative shadow-lg group">
                    <div className="absolute -right-4 -bottom-4 bg-amber-500/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
                    <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-amber-400" /> Income Gap
                    </div>
                    <div className="text-3xl font-bold font-serif text-foreground">
                        $0<span className="text-lg text-muted-foreground font-sans">/mo</span>
                    </div>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="flex-1 glass-premium border border-black/5 dark:border-white/5 rounded-[32px] p-8 relative flex flex-col min-h-[450px]">
                
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold font-serif text-foreground">{currentChart.title}</h3>
                </div>
                
                <div className="h-[calc(100%-40px)] w-full">
                    {renderChart()}
                </div>
            </div>
        </div>
    );
}
