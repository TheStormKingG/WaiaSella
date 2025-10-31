import React, { useContext, useMemo, useState } from 'react';
import { SalesContext, InventoryContext } from '../App';

type ReportTab = 'sales' | 'inventory' | 'income' | 'balance' | 'cashflow';

const MetricCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
);

const ReportTable: React.FC<{
  headers: string[];
  rows: (string | number)[][];
  title: string;
  controls?: React.ReactNode;
}> = ({ headers, rows, title, controls }) => (
    <div className="bg-white p-4 rounded-lg shadow-md mt-6">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
            <div>{controls}</div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        {headers.map(header => (
                            <th key={header} scope="col" className="px-4 py-3">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length > 0 ? rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className={`px-4 py-3 ${cellIndex > 0 ? 'text-right' : 'font-medium text-gray-900 whitespace-nowrap'}`}>
                                    {typeof cell === 'number' ? (cell % 1 === 0 ? cell.toString() : cell.toFixed(2)) : cell}
                                </td>
                            ))}
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={headers.length} className="text-center py-4 text-gray-700">No data available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const FinancialStatementLine: React.FC<{
  label: string;
  value: number;
  isTotal?: boolean;
  isSub?: boolean;
  isNegative?: boolean;
}> = ({ label, value, isTotal = false, isSub = false, isNegative = false }) => {
  const valueColor = isNegative ? 'text-red-600' : 'text-gray-800';
  const labelStyle = isTotal ? 'font-bold' : (isSub ? 'font-medium' : '');
  const valueStyle = isTotal ? 'font-bold border-t border-b py-1' : '';
  
  return (
    <div className={`flex justify-between py-2 text-gray-800 ${isSub ? 'pl-4' : ''} ${!isTotal ? 'border-b border-gray-100' : ''}`}>
        <span className={labelStyle}>{label}</span>
        <span className={`${valueColor} ${valueStyle}`}>
            {isNegative ? `($${(-value).toFixed(2)})` : `$${value.toFixed(2)}`}
        </span>
    </div>
  );
};


const ReportsScreen: React.FC = () => {
    const { salesHistory } = useContext(SalesContext);
    const { inventory } = useContext(InventoryContext);
    const [activeTab, setActiveTab] = useState<ReportTab>('sales');
    const [salesBy, setSalesBy] = useState<'Category' | 'Day of the week' | 'Week' | 'Month' | 'Year'>('Category');
    const [itemPerformance, setItemPerformance] = useState<'Top' | 'Bottom'>('Top');
    const [velocityType, setVelocityType] = useState<'Fast' | 'Slow'>('Fast');
    
    // Sales Tab Calculations
    const salesByData = useMemo(() => {
        if (salesHistory.length === 0) return [];
        const flattenedItems = salesHistory.flatMap(s => s.items.map(i => ({...i, date: s.date})));
        
        const grouped = flattenedItems.reduce<Record<string, { itemsSold: number, revenue: number }>>((acc, item) => {
            let key: string;
            const itemDate = new Date(item.date);
            switch (salesBy) {
                case 'Category':
                    key = item.category;
                    break;
                case 'Day of the week':
                    key = itemDate.toLocaleDateString('en-US', { weekday: 'long' });
                    break;
                case 'Month':
                    key = itemDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                    break;
                case 'Year':
                    key = itemDate.getFullYear().toString();
                    break;
                case 'Week':
                    const firstDay = new Date(new Date(itemDate).setDate(itemDate.getDate() - itemDate.getDay()));
                    key = `Week of ${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                    break;
            }
            if (!acc[key]) acc[key] = { itemsSold: 0, revenue: 0 };
            acc[key].itemsSold += item.quantity;
            acc[key].revenue += item.price * item.quantity;
            return acc;
        }, {});
        
        return Object.entries(grouped)
            .map(([key, value]) => [key, (value as any).itemsSold, (value as any).revenue])
            .sort((a, b) => (b[2] as number) - (a[2] as number));
            
    }, [salesHistory, salesBy]);
    
    const itemPerformanceData = useMemo(() => {
        const itemData: { name: string; itemsSold: number; revenue: number; }[] = inventory.map(p => {
             const sales = salesHistory.flatMap(s => s.items).filter(i => i.id === p.id);
             const itemsSold = sales.reduce((sum, i) => sum + i.quantity, 0);
             const revenue = sales.reduce((sum, i) => sum + i.price * i.quantity, 0);
             return { name: p.name, itemsSold, revenue };
        });
        
        const sorted = itemData.sort((a, b) => a.itemsSold - b.itemsSold);
        
        if (itemPerformance === 'Top') {
            return sorted.reverse().slice(0, 10).map(i => [i.name, i.itemsSold, i.revenue]);
        }
        return sorted.slice(0, 10).map(i => [i.name, i.itemsSold, i.revenue]);

    }, [salesHistory, inventory, itemPerformance]);
    
    
    // Inventory Tab Calculations
    const inventoryValueData = useMemo(() => {
        const data = inventory.reduce((acc, product) => {
            if (!acc[product.category]) acc[product.category] = 0;
            acc[product.category] += product.cost * product.stock;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(data).sort(([, v1], [, v2]) => v2 - v1);
    }, [inventory]);

    const totalInventoryValue = useMemo(() => inventory.reduce((acc, p) => acc + (p.cost * p.stock), 0), [inventory]);

    const { consumptionRateByCategory, productVelocity } = useMemo(() => {
        if (salesHistory.length === 0) return { consumptionRateByCategory: [], productVelocity: [] };

        const allSalesItems = salesHistory.flatMap(s => s.items.map(i => ({ ...i, date: s.date })));
        // FIX: The accumulator in reduce (`oldest`) is a Date object, not a Sale object, so it does not have a `.date` property.
        const oldestSaleDate = salesHistory.reduce((oldest, current) => current.date < oldest ? current.date : oldest, salesHistory[0].date);
        const weeks = (new Date().getTime() - new Date(oldestSaleDate).getTime()) / (1000 * 60 * 60 * 24 * 7);
        const salesDurationWeeks = weeks < 1 ? 1 : weeks;

        const categoryConsumption = allSalesItems.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = 0;
            acc[item.category] += item.quantity;
            return acc;
        }, {} as Record<string, number>);
        
        const consumptionRateByCategory = Object.entries(categoryConsumption)
            .map(([category, totalSold]) => [category, (totalSold as number) / salesDurationWeeks])
            .sort((a, b) => (b[1] as number) - (a[1] as number));
            
        const productSales = allSalesItems.reduce((acc, item) => {
             const entry = acc[item.id] || { name: item.name, totalSold: 0 };
             entry.totalSold += item.quantity;
             acc[item.id] = entry;
             return acc;
        }, {} as Record<string, {name: string, totalSold: number}>);
        
        const velocity = Object.values(productSales).map(p => {
            const product = p as {name: string, totalSold: number};
            return {
                name: product.name,
                unitsPerWeek: product.totalSold / salesDurationWeeks,
            };
        });
        
        velocity.sort((a,b) => b.unitsPerWeek - a.unitsPerWeek);
        
        const productVelocity = (velocityType === 'Fast' ? velocity.slice(0, 10) : velocity.slice(-10).reverse())
            .map(p => [p.name, p.unitsPerWeek]);

        return { consumptionRateByCategory, productVelocity };
    }, [salesHistory, velocityType]);
    

    // Financial Statements Calculations
    const { totalRevenue, totalCogs, grossProfit, netIncome } = useMemo(() => {
        const totalRevenue = salesHistory.reduce((acc, sale) => acc + sale.subtotal, 0);
        const totalCogs = salesHistory.flatMap(s => s.items).reduce((acc, item) => acc + (item.cost * item.quantity), 0);
        const grossProfit = totalRevenue - totalCogs;
        // Assuming no other operating expenses for now
        const netIncome = grossProfit; 
        return { totalRevenue, totalCogs, grossProfit, netIncome };
    }, [salesHistory]);


    const renderContent = () => {
        switch (activeTab) {
            case 'sales': return (
                <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MetricCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} />
                        <MetricCard title="Net Profit" value={`$${netIncome.toFixed(2)}`} />
                        <MetricCard title="Items Sold" value={salesHistory.flatMap(s => s.items).reduce((acc, i) => acc + i.quantity, 0).toString()} />
                        <MetricCard title="Transactions" value={salesHistory.length.toString()} />
                    </div>
                    <ReportTable 
                        title="Sales By"
                        headers={[`${salesBy}`, 'Items Sold', 'Revenue']}
                        rows={salesByData}
                        controls={
                             <select value={salesBy} onChange={e => setSalesBy(e.target.value as any)} className="p-1 border rounded-md bg-white">
                                <option>Category</option>
                                <option>Day of the week</option>
                                <option>Week</option>
                                <option>Month</option>
                                <option>Year</option>
                            </select>
                        }
                    />
                     <ReportTable 
                        title="Item Performance"
                        headers={['Product', 'Items Sold', 'Revenue']}
                        rows={itemPerformanceData}
                        controls={
                             <select value={itemPerformance} onChange={e => setItemPerformance(e.target.value as any)} className="p-1 border rounded-md bg-white">
                                <option>Top</option>
                                <option>Bottom</option>
                            </select>
                        }
                    />
                </div>
            );
            case 'inventory': return (
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <MetricCard title="Total Inventory Value" value={`$${totalInventoryValue.toFixed(2)}`} />
                        <MetricCard title="Total Items in Stock" value={inventory.reduce((sum, p) => sum + p.stock, 0).toString()} />
                    </div>
                    <ReportTable 
                        title="Inventory Value by Category"
                        headers={['Category', 'Value']}
                        rows={inventoryValueData}
                    />
                    <ReportTable
                        title="Consumption Rate by Category"
                        headers={['Category', 'Units Sold / Week']}
                        rows={consumptionRateByCategory}
                    />
                    <ReportTable
                        title={`Product Velocity`}
                        headers={['Product', 'Units Sold / Week']}
                        rows={productVelocity}
                        controls={
                            <div className="flex gap-2">
                                <select value={velocityType} onChange={e => setVelocityType(e.target.value as any)} className="p-1 border rounded-md bg-white">
                                    <option value="Fast">Top 10 Fastest</option>
                                    <option value="Slow">Bottom 10 Slowest</option>
                                </select>
                            </div>
                        }
                    />
                </div>
            );
            case 'income': return (
                 <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Income Statement</h2>
                    <div className="space-y-1">
                        <FinancialStatementLine label="Total Revenue" value={totalRevenue} />
                        <FinancialStatementLine label="Cost of Goods Sold (COGS)" value={totalCogs} isNegative />
                        <FinancialStatementLine label="Gross Profit" value={grossProfit} isTotal />
                        <FinancialStatementLine label="Operating Expenses" value={0} />
                        <FinancialStatementLine label="Net Income" value={netIncome} isTotal />
                    </div>
                 </div>
            );
            case 'balance': return (
                <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Balance Sheet</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-lg mb-2 text-gray-800">Assets</h3>
                            <FinancialStatementLine label="Cash" value={netIncome} isSub />
                            <FinancialStatementLine label="Inventory" value={totalInventoryValue} isSub />
                            <FinancialStatementLine label="Total Assets" value={netIncome + totalInventoryValue} isTotal />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2 text-gray-800">Liabilities & Equity</h3>
                            <FinancialStatementLine label="Liabilities" value={0} isSub />
                            <FinancialStatementLine label="Retained Earnings (Equity)" value={netIncome} isSub />
                            <FinancialStatementLine label="Total Liabilities & Equity" value={netIncome} isTotal />
                        </div>
                    </div>
                </div>
            );
            case 'cashflow': return (
                 <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Cash Flow Statement</h2>
                     <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-gray-800">Cash Flow from Operations</h3>
                        <FinancialStatementLine label="Net Income" value={netIncome} isSub />
                        <p className="text-xs text-gray-600 pl-4">(Adjustments would normally go here)</p>
                        <FinancialStatementLine label="Net Cash from Operations" value={netIncome} isTotal />
                     </div>
                </div>
            );
            default: return null;
        }
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Reports</h1>
             <div className="mb-4 overflow-x-auto">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {(['sales', 'inventory', 'income', 'balance', 'cashflow'] as ReportTab[]).map(tab => (
                             <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`${
                                activeTab === tab
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize transition-colors`}
                            >
                                {tab.replace(/([A-Z])/g, ' $1').replace('cashflow', 'Cash Flow')}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
            {renderContent()}
        </div>
    );
};

export default ReportsScreen;
