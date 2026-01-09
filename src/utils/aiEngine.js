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
        throw new Error("OpenAI is not initialized. Please provide an API key.");
    }

    const prompt = `
        You are an expert data analyst. You are provided with a summary of a dataset and a user query.
        Dataset Summary:
        ${JSON.stringify(dataSummary, null, 2)}

        User Query: ${userQuery}

        Provide a concise, professional, and highly insightful response. 
        Focus on trends, anomalies, or specific answers based on the statistics provided.
        Format your response using markdown.
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant that analyzes data insights." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI Error:", error);
        throw new Error(error.message || "Failed to get AI insights.");
    }
};
