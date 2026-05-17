export default async function handler(req, res) {
    // Only allow POST requests (security measure)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, system } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Check if you added the key to Vercel correctly
    if (!apiKey) {
        return res.status(500).json({ error: 'Backend setup incomplete. Missing GEMINI_API_KEY.' });
    }

    try {
        // Calling the official Google Gemini API using a secure fetch request
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: system }] },
                generationConfig: {
                    temperature: 0.3, // Keeps the AI focused on writing correct code syntax
                }
            })
        });

        const data = await response.json();
        
        // Extract the text reply from Gemini's response
        let aiReply = data.candidates[0].content.parts[0].text;

        // Clean up any markdown code blocks (like ```gpc ... ```) if Gemini wraps the code in them
        aiReply = aiReply.replace(/```[a-zA-Z]*\n/g, '').replace(/```/g, '').trim();

        // Send the clean script back to your website frontend
        return res.status(200).json({ script: aiReply });

    } catch (error) {
        return res.status(500).json({ error: 'Failed to connect to Gemini API.' });
    }
}
