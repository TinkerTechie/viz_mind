// --- Data Analysis Logic (JavaScript implementation) ---
export function generateInsights(data) {
    if (!data || data.length === 0) return null;
    
    const headers = Object.keys(data[0]);
    const rowCount = data.length;
    const colCount = headers.length;

    const insights = {};

    // 1. Data Shape
    insights['Data Shape'] = { rows: rowCount, cols: colCount };

    // 2. Data Types & Missing Values
    const typeCounts = {};
    const missingValues = {};
    headers.forEach(h => {
        missingValues[h] = 0;
        let isNumeric = true;
        for(const row of data) {
            if (row[h] === null || row[h] === undefined || row[h] === '') {
                missingValues[h]++;
            }
            if (isNumeric && row[h] !== '' && !/^-?\d*\.?\d+$/.test(row[h])) {
                isNumeric = false;
            }
        }
        typeCounts[h] = isNumeric ? 'Numeric' : 'Categorical';
    });
    insights['Data Types'] = Object.entries(typeCounts).map(([col, type]) => ({ Column: col, "Data Type": type }));
    
    // -- FIX was here --
    insights['Missing Values'] = Object.entries(missingValues)
        .filter(([, count]) => count > 0)
        .map(([col, count]) => ({ Column: col, "Missing Count": count }));

    // 3. Statistical Summaries
    const numericCols = headers.filter(h => typeCounts[h] === 'Numeric');
    if (numericCols.length > 0) {
        const numericSummary = {};
        numericCols.forEach(col => {
            const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));
             if (values.length === 0) {
                 numericSummary[col] = { count: 0, mean: 'N/A', std: 'N/A', min: 'N/A', max: 'N/A' };
                 return;
            }
            const sum = values.reduce((a, b) => a + b, 0);
            const mean = sum / values.length;
            const min = Math.min(...values);
            const max = Math.max(...values);
            const std = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / values.length);
            numericSummary[col] = {
                count: values.length, mean: mean.toFixed(2), std: std.toFixed(2),
                min: min.toFixed(2), max: max.toFixed(2)
            };
        });
        insights['Numeric Summary'] = Object.entries(numericSummary).map(([col, stats]) => ({ Column: col, ...stats }));
    }

    const categoricalCols = headers.filter(h => typeCounts[h] === 'Categorical');
    if (categoricalCols.length > 0) {
        const categoricalSummary = {};
        categoricalCols.forEach(col => {
            const values = data.map(row => row[col]).filter(v => v);
             if (values.length === 0) {
                 categoricalSummary[col] = { count: 0, unique: 0, top: 'N/A', freq: 'N/A' };
                 return;
            }
            const unique = [...new Set(values)];
            const top = values.reduce((acc, v) => ({ ...acc, [v]: (acc[v] || 0) + 1 }), {});
            const topValue = Object.keys(top).reduce((a, b) => top[a] > top[b] ? a : b, '');

            categoricalSummary[col] = {
                count: values.length,
                unique: unique.length,
                top: topValue,
                freq: top[topValue]
            };
        });
        insights['Categorical Summary'] = Object.entries(categoricalSummary).map(([col, stats]) => ({ Column: col, ...stats }));
    }

    // 4. Data Preview
    insights['Data Preview'] = data.slice(0, 5);

    return insights;
}

