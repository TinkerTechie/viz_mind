import Papa from 'papaparse';

// Helper function to create a summary table from a DataFrame description
const createSummaryTable = (description) => {
    if (!description || description.empty) return null;
    // Reset index to make the statistic (e.g., 'mean', 'std') a column
    const formatted = description.reset_index();
    const headers = formatted.columns.tolist().toJs();
    const rows = formatted.values.toJs().map(row => 
        row.map(val => (typeof val === 'number' ? parseFloat(val.toFixed(2)) : val))
    );
    return { headers, rows };
};

// Main analysis function
export const analyzeData = (file) => {
    // FIX: Add validation to ensure the input is a valid file object.
    // This prevents the FileReader error and subsequent crashes.
    if (!(file instanceof Blob)) {
        return Promise.reject(new Error("Invalid input: A file object is required for analysis."));
    }

    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    // Add check for empty or malformed CSV data
                    if (!results || !results.data || results.data.length === 0) {
                        return reject(new Error("Parsing failed: The CSV file might be empty or improperly formatted."));
                    }
                    
                    const df = new dfd.DataFrame(results.data);
                    let insights = {};

                    // 1. Data Shape
                    const [rows, cols] = df.shape;
                    insights['Data Shape'] = { rows, cols };

                    // 2. Data Types & Chart Data
                    const dtypes = df.dtypes.toJs();
                    const typeCounts = {};
                    const typeRows = [];
                    Object.entries(dtypes).forEach(([col, type]) => {
                        typeRows.push([col, type]);
                        typeCounts[type] = (typeCounts[type] || 0) + 1;
                    });
                    insights['Data Types'] = { headers: ['Column', 'Data Type'], rows: typeRows };
                    insights.dataTypeChartData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
                    
                    // 3. Missing Values & Chart Data
                    const missing = df.isnull().sum();
                    const missingValues = missing.toJs().filter(val => val[1] > 0);
                    if (missingValues.length > 0) {
                        insights['Missing Values'] = { headers: ['Column', 'Missing Count'], rows: missingValues };
                        insights.missingValuesChartData = missingValues.map(([name, count]) => ({ name, count }));
                    } else {
                        insights.missingValuesChartData = [];
                    }

                    // 4. Numeric Summary
                    const numericSummary = createSummaryTable(df.describe());
                    if (numericSummary) insights['Numeric Summary'] = numericSummary;
                    
                    // 5. Categorical Summary
                    const categoricalCols = df.columns.toJs().filter(c => df.col(c).dtype === 'string');
                    if (categoricalCols.length > 0) {
                        const categoricalSummary = createSummaryTable(df.select(categoricalCols).describe());
                        if (categoricalSummary) insights['Categorical Summary'] = categoricalSummary;
                    }
                    
                    // 6. Data Preview
                    const head = df.head(5);
                    insights['Data Preview'] = {
                        headers: head.columns.toJs(),
                        rows: head.values.toJs()
                    };

                    resolve(insights);
                } catch (error) {
                    console.error("Error during data analysis:", error);
                    reject(error);
                }
            },
            error: (error) => {
                console.error("PapaParse error:", error);
                reject(error);
            }
        });
    });
};

