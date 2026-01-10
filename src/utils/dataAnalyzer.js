import Papa from 'papaparse';

// Helper function to create a summary table from a DataFrame description
const createSummaryTable = (description) => {
    try {
        if (!description || !description.values) return null;

        // In Danfo.js v1+, description can be complex. We extract numeric summaries.
        const headers = ["Statistic", ...description.columns];
        const rows = description.values.map((row, i) => {
            const statName = description.index[i];
            const formattedRow = row.map(val => {
                if (typeof val === 'number' && !isNaN(val)) {
                    return parseFloat(val.toFixed(2));
                }
                return (val === null || val === undefined) ? '-' : val;
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
                        return reject(new Error("Danfo.js not loaded. Check your internet connection or script tag."));
                    }

                    const df = new danfo.DataFrame(results.data);

                    // DEBUG: Log available methods if something fails
                    console.log("DataFrame initialized. Shape:", df.shape);

                    let insights = {};

                    // 1. Data Shape
                    const [rows, cols] = df.shape;
                    insights['Data Shape'] = { rows, cols };

                    // 2. Data Types
                    // In v1.1.2 it's .ctypes, but let's be safe
                    const colNames = df.columns;
                    const colTypes = df.ctypes ? df.ctypes.values : (df.dtypes ? df.dtypes.values : []);

                    const typeRows = [];
                    const typeCounts = {};

                    colNames.forEach((name, i) => {
                        const type = colTypes[i] || 'unknown';
                        typeRows.push([name, type]);
                        typeCounts[type] = (typeCounts[type] || 0) + 1;
                    });

                    insights['Data Types'] = { headers: ['Column', 'Data Type'], rows: typeRows };
                    insights.dataTypeChartData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

                    // 3. Missing Values
                    // Try different variants for Danfo.js 1.x
                    let missingValues = [];
                    let missingValuesChart = [];

                    try {
                        // Try is_na (Danfo 1.x) then isna then isnull
                        const missingMethod = df.is_na ? df.is_na.bind(df) : (df.isna ? df.isna.bind(df) : (df.isnull ? df.isnull.bind(df) : null));

                        if (missingMethod) {
                            const missingSeries = missingMethod().sum();
                            missingSeries.index.forEach((col, i) => {
                                const count = missingSeries.values[i];
                                if (count > 0) {
                                    missingValues.push([col, count]);
                                    missingValuesChart.push({ name: col, count });
                                }
                            });
                        } else {
                            // Fallback to manual check if all else fails
                            colNames.forEach(col => {
                                const colData = df[col].values;
                                const count = colData.filter(v => v === null || v === undefined || v === "").length;
                                if (count > 0) {
                                    missingValues.push([col, count]);
                                    missingValuesChart.push({ name: col, count });
                                }
                            });
                        }
                    } catch (e) {
                        console.warn("Missing value detection fallback initiated", e);
                    }

                    insights.missingValuesChartData = missingValuesChart;
                    if (missingValues.length > 0) {
                        insights['Missing Values'] = { headers: ['Column', 'Missing Count'], rows: missingValues };
                    }

                    // 4. Numeric Summary
                    try {
                        const numericDf = df.select_dtypes(['int32', 'int64', 'float32', 'float64']);
                        if (numericDf && numericDf.columns.length > 0) {
                            const desc = numericDf.describe();
                            const summary = createSummaryTable(desc);
                            if (summary) insights['Numeric Summary'] = summary;
                        }
                    } catch (e) {
                        console.warn("Numeric summary processing skipped", e);
                    }

                    // 5. Categorical Summary
                    try {
                        const categoricalCols = colNames.filter((c, i) => colTypes[i] === 'string');
                        if (categoricalCols.length > 0) {
                            const catDf = df.loc({ columns: categoricalCols });
                            const desc = catDf.describe();
                            const summary = createSummaryTable(desc);
                            if (summary) insights['Categorical Summary'] = summary;
                        }
                    } catch (e) {
                        console.warn("Categorical summary processing skipped", e);
                    }

                    // 6. Data Preview
                    insights['Data Preview'] = {
                        headers: df.columns,
                        rows: df.head(5).values
                    };

                    resolve(insights);
                } catch (error) {
                    console.error("Critical analysis error:", error);
                    reject(new Error("Data analysis failed due to library version mismatch. Please try a different CSV or check for updates."));
                }
            },
            error: (error) => reject(new Error("File parsing error: " + error.message))
        });
    });
};
