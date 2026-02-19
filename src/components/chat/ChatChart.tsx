import { useMemo } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    AreaChart, Area
} from 'recharts';

interface ChartData {
    name: string;
    value: number;
    fill?: string;
    [key: string]: any;
}

interface ChatChartProps {
    type: 'pie' | 'bar' | 'area';
    data: ChartData[];
    title?: string;
}

const COLORS = ['#4A8DCA', '#1C2D46', '#10B981', '#F59E0B', '#EF4444'];

export const ChatChart = ({ type, data, title }: ChatChartProps) => {

    const formattedData = useMemo(() => {
        return data.map((item, index) => ({
            ...item,
            fill: item.fill || COLORS[index % COLORS.length]
        }));
    }, [data]);

    const renderChart = () => {
        switch (type) {
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={formattedData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {formattedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                itemStyle={{ color: '#1C2D46' }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                );
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={formattedData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {formattedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                );
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={formattedData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4A8DCA" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#4A8DCA" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stroke="#4A8DCA" fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )
            default:
                return null;
        }
    };

    return (
        <div className="w-full max-w-md mx-auto my-4 bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-white/20 shadow-sm backdrop-blur-sm">
            {title && <h4 className="text-sm font-semibold text-center mb-4 text-slate-700 dark:text-slate-200">{title}</h4>}
            {renderChart()}
        </div>
    );
};
