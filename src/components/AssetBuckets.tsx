import React from 'react';

interface AssetBucketsProps {
    preTax?: number;
    postTax?: number;
    taxFree?: number;
    className?: string;
}

const Bucket = ({ label, value, color, max }: { label: string, value: number, color: string, max: number }) => {
    // Calculate height percentage, maxed at 100%
    const height = Math.min((value / max) * 100, 100);

    return (
        <div className="flex flex-col items-center gap-2 group cursor-help relative">
            {/* Tooltip */}
            <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-10">
                ${value.toLocaleString()}
            </div>

            {/* Bucket Container */}
            <div className="relative w-16 h-48 bg-slate-100 rounded-b-xl rounded-t-sm border-x border-b border-white shadow-inner overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                {/* Liquid Fill */}
                <div
                    className={`absolute bottom-0 w-full transition-all duration-1000 ease-out ${color} opacity-80 group-hover:opacity-100`}
                    style={{ height: `${height}%` }}
                >
                    {/* Liquid Surface Effect */}
                    <div className="absolute top-0 w-full h-1 bg-white/30"></div>
                </div>

                {/* Measurement Lines */}
                <div className="absolute inset-0 flex flex-col justify-evenly opacity-10 pointer-events-none">
                    <div className="border-t border-slate-900 w-full"></div>
                    <div className="border-t border-slate-900 w-full"></div>
                    <div className="border-t border-slate-900 w-full"></div>
                </div>
            </div>

            {/* Label */}
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
        </div>
    );
};

export const AssetBuckets: React.FC<AssetBucketsProps> = ({
    preTax = 0,
    postTax = 0,
    taxFree = 0,
    className = ""
}) => {
    // Dynamic max calculation to scale buckets properly
    const total = preTax + postTax + taxFree;
    const max = total > 0 ? total * 0.8 : 100000; // Visual scaling logic

    return (
        <div className={`p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl dark:bg-slate-900/60 dark:border-white/10 ${className}`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">savings</span>
                Asset Allocation
            </h3>

            <div className="flex items-end justify-center gap-6">
                <Bucket label="Pre-Tax" value={preTax} color="bg-orange-400" max={max} />
                <Bucket label="Post-Tax" value={postTax} color="bg-blue-400" max={max} />
                <Bucket label="Tax-Free" value={taxFree} color="bg-emerald-400" max={max} />
            </div>

            {total === 0 && (
                <div className="mt-4 text-center text-xs text-slate-400 italic">
                    Tell myRA about your savings to see them fill up.
                </div>
            )}
        </div>
    );
};
