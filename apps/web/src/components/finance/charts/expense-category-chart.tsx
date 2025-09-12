import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ExpenseCategoryChartProps {
    categories: Array<{
        categoryId: string;
        categoryName: string;
        totalAmount: number;
        percentage: number;
    }>;
    totalExpenses: number;
    title?: string;
}

const COLORS = [
    '#0088FE', // Blue
    '#00C49F', // Green
    '#FFBB28', // Yellow
    '#FF8042', // Orange
    '#8884D8', // Purple
    '#82CA9D', // Light Green
    '#FFC658', // Light Yellow
    '#FF7300', // Dark Orange
    '#8DD1E1', // Light Blue
    '#D084D0', // Light Purple
];

const ExpenseCategoryChart: React.FC<ExpenseCategoryChartProps> = ({
    categories,
    totalExpenses,
    title = "Despesas por Categoria",
}) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const chartData = categories.map((category, index) => ({
        name: category.categoryName,
        value: category.totalAmount,
        percentage: category.percentage,
        color: COLORS[index % COLORS.length],
    }));

    const chartConfig = categories.reduce((config, category, index) => {
        config[category.categoryId] = {
            label: category.categoryName,
            color: COLORS[index % COLORS.length],
        };
        return config;
    }, {} as any);

    return (
        <div className="w-full space-y-4">
            <h3 className="text-lg font-semibold text-center">{title}</h3>

            <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <ChartTooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-md">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Categoria
                                                    </span>
                                                    <span className="font-bold text-muted-foreground">
                                                        {data.name}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Valor
                                                    </span>
                                                    <span className="font-bold">
                                                        {formatCurrency(data.value)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        Percentual
                                                    </span>
                                                    <span className="font-bold">
                                                        {data.percentage.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>

            {/* Legend */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {chartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-semibold">{formatCurrency(item.value)}</div>
                            <div className="text-xs text-muted-foreground">
                                {item.percentage.toFixed(1)}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold">{formatCurrency(totalExpenses)}</span>
                </div>
            </div>
        </div>
    );
};

export default ExpenseCategoryChart;
