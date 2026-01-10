import OpenAI from 'openai';

let openai = null;

export const initOpenAI = (apiKey) => {
    if (!apiKey) return false;
    openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Required for client-side usage
    });
    return true;
};

export const getAIInsights = async (dataSummary, userQuery) => {
    if (!openai) {
        throw new Error("OpenAI is not initialized. Please provide an API key in the settings.");
    }

    // Prepare a more structured data summary for the AI
    const statsJSON = JSON.stringify({
        rows: dataSummary['Data Shape']?.rows,
        columns: dataSummary['Data Shape']?.cols,
        dataTypes: dataSummary['Data Types']?.rows,
        missingValues: dataSummary['Missing Values']?.rows || "None",
        numericSummary: dataSummary['Numeric Summary']?.rows,
        categoricalSummary: dataSummary['Categorical Summary']?.rows,
        sampleData: dataSummary['Data Preview']?.rows
    }, null, 2);

    const systemMessage = `
        You are VizMind AI, a premium data science consultant. 
        Your goal is to provide deep, actionable insights based on the provided dataset statistics.
        
        Guidelines:
        1. Accuracy First: Only state findings supported by the data provided.
        2. Insightful: Look for correlations, skewness, or anomalies in the numeric summaries.
        3. Professional: Use clear, technical but accessible language.
        4. Structured: Use Markdown (headers, bold text, lists) for readability.
        5. Concise: Get to the point quickly.
        
        If asked something not related to the data, politely redirect the user back to the data analysis.
    `;

    const prompt = `
        DATABASE CONTEXT:
        ${statsJSON}

        USER QUESTION: 
        "${userQuery}"

        Please provide your analysis:
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Defaulting to 3.5 for speed, but instructions allow for power
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: prompt }
            ],
            temperature: 0.5, // Lower temperature for more factual analysis
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI Execution Error:", error);
        if (error.status === 401) throw new Error("Invalid API Key. Please update it in the settings.");
        throw new Error(error.message || "The AI encountered an error while processing your request.");
    }
};
