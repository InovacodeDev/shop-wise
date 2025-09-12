import React from 'react';
import { t } from '@lingui/core/macro';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface MonthlyExpenseChartProps {
    monthlyData: Array<{
        month: string;
        totalAmount: number;
    }>;
    title?: string;
}

const MonthlyExpenseChart: React.FC<MonthlyExpenseChartProps> = ({
    monthlyData,
    title = "Monthly Expense Trend",
}) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Prepare data for the chart
    const sortedData = [...monthlyData].sort((a, b) => a.month.localeCompare(b.month));

    const chartData = sortedData.map(item => {
        let displayMonth = item.month;
        try {
            // Assuming month format is 'YYYY-MM'
            const date = new Date(item.month + '-01');
            displayMonth = format(date, 'MMM/yyyy', { locale: ptBR });
        } catch {
            // Keep original format if parsing fails
        }

        return {
            month: displayMonth,
            originalMonth: item.month,
            amount: item.totalAmount,
        };
    });

    const chartConfig = {
        amount: {
            label: t`Amount`,
            color: "hsl(var(--chart-1))",
        },
    };

    // Calculate statistics
    const amounts = monthlyData.map(item => item.totalAmount);
    const averageAmount = amounts.length > 0 ? amounts.reduce((sum, val) => sum + val, 0) / amounts.length : 0;
    const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
    const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;

    return (
        <div className="w-full space-y-4">
            <h3 className="text-lg font-semibold text-center">{title}</h3>

            <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                        />
                        <ChartTooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-md">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        {t`Month`}
                                                    </span>
                                                    <span className="font-bold text-muted-foreground">
                                                        {label}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        {t`Amount`}
                                                    </span>
                                                    <span className="font-bold">
                                                        {formatCurrency(data.amount)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="var(--color-amount)"
                            strokeWidth={3}
                            dot={{ fill: "var(--color-amount)", strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, stroke: "var(--color-amount)", strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground">Monthly Average</div>
                    <div className="text-lg font-semibold">{formatCurrency(averageAmount)}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground">Highest</div>
                    <div className="text-lg font-semibold">{formatCurrency(maxAmount)}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground">Lowest</div>
                    <div className="text-lg font-semibold">{formatCurrency(minAmount)}</div>
                </div>
            </div>

            {/* Trend Analysis */}
            {monthlyData.length >= 2 && (
                <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-2">Trend</div>
                    <div className="text-sm">
                        {(() => {
                            const firstHalf = amounts.slice(0, Math.floor(amounts.length / 2));
                            const secondHalf = amounts.slice(Math.floor(amounts.length / 2));

                            const firstHalfAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
                            const secondHalfAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

                            const trend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

                            if (trend > 5) {
                                return (
                                    <span className="text-red-600 font-medium">
                                        📈 Increase of {trend.toFixed(1)}% in recent months
                                    </span>
                                );
                            } else if (trend < -5) {
                                return (
                                    <span className="text-green-600 font-medium">
                                        📉 Decrease of {Math.abs(trend).toFixed(1)}% in recent months
                                    </span>
                                );
                            } else {
                                return (
                                    <span className="text-gray-600 font-medium">
                                        ➡️ Stable values in recent months
                                    </span>
                                );
                            }
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthlyExpenseChart;
