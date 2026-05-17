exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    const { prompt, system } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Backend setup incomplete. Missing GEMINI_API_KEY.' }) };
    }

    try {
        // Fetch request to the Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: system }] },
                generationConfig: { temperature: 0.3 }
            })
        });

        const data = await response.json();
        let aiReply = data.candidates[0].content.parts[0].text;

        // Clean up markdown syntax
        aiReply = aiReply.replace(/```[a-zA-Z]*\n/g, '').replace(/```/g, '').trim();

        return {
            statusCode: 200,
            body: JSON.stringify({ script: aiReply })
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to connect to Gemini API.' }) };
    }
};
