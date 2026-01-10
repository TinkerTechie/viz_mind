import Papa from 'papaparse';

// Helper function to create a summary table from a DataFrame description
const createSummaryTable = (description) => {
    try {
        if (!description || !description.values || !description.columns) return null;

        const headers = ["Statistic", ...description.columns];
        const rows = description.values.map((row, i) => {
            const statName = (description.index && description.index[i]) ? description.index[i] : `Stat ${i}`;
            const formattedRow = row.map(val => {
                if (typeof val === 'number') {
                    return Number.isInteger(val) ? val : parseFloat(val.toFixed(2));
                }
                return (val === null || val === undefined || val === "") ? '-' : val;
            });
            return [statName, ...formattedRow];
        });
        return { headers, rows };
    } catch (e) {
        console.error("Summary table creation failed:", e);
        return null;
    }
};

export const analyzeData = (file) => {
    if (!(file instanceof Blob)) {
        return Promise.reject(new Error("Invalid input: A file object is required for analysis."));
    }

    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    if (!results || !results.data || results.data.length === 0) {
                        return reject(new Error("Parsing failed: The CSV file is empty."));
                    }

                    const danfo = window.dfd;
                    if (!danfo) {
                        return reject(new Error("Analysis engine (Danfo.js) not found. Please refresh the page."));
                    }

                    // Create DataFrame safely
                    let df;
                    try {
                        df = new danfo.DataFrame(results.data);
                    } catch (e) {
                        return reject(new Error("Failed to process data structure: " + e.message));
                    }

                    let insights = {};

                    // 1. Data Shape
                    const shape = df.shape || [results.data.length, Object.keys(results.data[0]).length];
                    insights['Data Shape'] = { rows: shape[0], cols: shape[1] };

                    // 2. Data Types
                    const colNames = df.columns || Object.keys(results.data[0]);
                    const colTypesSeries = df.ctypes || df.dtypes;
                    const colTypes = colTypesSeries ? colTypesSeries.values : colNames.map(() => 'unknown');

                    const typeRows = [];
                    const typeCounts = {};

                    colNames.forEach((name, i) => {
                        const type = String(colTypes[i] || 'unknown').toLowerCase();
                        typeRows.push([name, type]);
                        typeCounts[type] = (typeCounts[type] || 0) + 1;
                    });

                    insights['Data Types'] = { headers: ['Column', 'Data Type'], rows: typeRows };
                    insights.dataTypeChartData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

                    // 3. Missing Values
                    let missingValuesChart = [];
                    try {
                        const isNaFunc = df.is_na || df.isna || df.isnull;
                        if (isNaFunc) {
                            const missingSeries = isNaFunc.call(df).sum();
                            missingSeries.index.forEach((col, i) => {
                                const count = missingSeries.values[i];
                                if (count > 0) {
                                    missingValuesChart.push({ name: col, count });
                                }
                            });
                        }
                    } catch (e) {
                        console.warn("Automated missing value check failed, skipping...");
                    }
                    insights.missingValuesChartData = missingValuesChart;

                    // 4. Numeric Summary
                    try {
                        const numericDf = df.select_dtypes(['int32', 'int64', 'float32', 'float64', 'number']);
                        if (numericDf && numericDf.columns && numericDf.columns.length > 0) {
                            const desc = numericDf.describe();
                            const summary = createSummaryTable(desc);
                            if (summary) insights['Numeric Summary'] = summary;
                        }
                    } catch (e) {
                        console.warn("Numeric analysis skipped", e);
                    }

                    // 5. Categorical Summary
                    try {
                        const stringCols = colNames.filter((c, i) => String(colTypes[i]).includes('string') || String(colTypes[i]).includes('object'));
                        if (stringCols.length > 0) {
                            const catDf = df.loc({ columns: stringCols });
                            const desc = catDf.describe();
                            const summary = createSummaryTable(desc);
                            if (summary) insights['Categorical Summary'] = summary;
                        }
                    } catch (e) {
                        console.warn("Frequency analysis skipped", e);
                    }

                    // 6. Data Preview
                    try {
                        const headDf = df.head(100);
                        insights['Data Preview'] = {
                            headers: colNames,
                            rows: headDf.values
                        };
                    } catch (e) {
                        insights['Data Preview'] = {
                            headers: colNames,
                            rows: results.data.slice(0, 100).map(obj => Object.values(obj))
                        };
                    }

                    resolve(insights);
                } catch (error) {
                    console.error("Critical analysis error:", error);
                    reject(new Error("Unable to complete analysis: " + error.message));
                }
            },
            error: (error) => reject(new Error("File parsing issue: " + error.message))
        });
    });
};
