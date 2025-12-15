// AI Service Module - Handles AI API integration for OpenAI and Gemini

class AIService {
    constructor() {
        this.provider = 'none'; // 'none', 'openai', 'gemini'
        this.apiKey = null;
        this.model = 'gpt-3.5-turbo';
        this.detailedAnalysis = true;
        this.extractDefinitions = true;
    }

    // Configure AI service
    configure(config) {
        this.provider = config.provider || 'none';
        this.apiKey = config.apiKey || null;
        this.model = config.model || 'gpt-3.5-turbo';
        this.detailedAnalysis = config.detailedAnalysis !== false;
        this.extractDefinitions = config.extractDefinitions !== false;

        // Store in session storage (cleared when browser closes)
        if (this.apiKey && this.provider !== 'none') {
            sessionStorage.setItem('ai_provider', this.provider);
            sessionStorage.setItem('ai_api_key', this.apiKey);
            sessionStorage.setItem('ai_model', this.model);
        } else {
            sessionStorage.removeItem('ai_provider');
            sessionStorage.removeItem('ai_api_key');
            sessionStorage.removeItem('ai_model');
        }
    }

    // Load config from session storage
    loadConfig() {
        const provider = sessionStorage.getItem('ai_provider');
        const apiKey = sessionStorage.getItem('ai_api_key');
        const model = sessionStorage.getItem('ai_model');

        if (provider && apiKey) {
            this.provider = provider;
            this.apiKey = apiKey;
            this.model = model || 'gpt-3.5-turbo';
            return true;
        }
        return false;
    }

    // Check if AI is enabled and configured
    isEnabled() {
        return this.provider !== 'none' && this.apiKey;
    }

    // Simplify legal text using AI
    async simplifyLegalText(text) {
        if (!this.isEnabled()) {
            throw new Error('AI service not configured');
        }

        const prompt = this.createSimplificationPrompt(text);

        if (this.provider === 'openai') {
            return await this.callOpenAI(prompt);
        } else if (this.provider === 'gemini') {
            return await this.callGemini(prompt);
        }

        throw new Error('Unknown AI provider');
    }

    // Create the prompt for simplification
    createSimplificationPrompt(text) {
        return `You are a legal document simplifier. Your task is to convert complex legal text into plain English for educational purposes.

STRICT RULES:
1. Do NOT provide legal advice or recommendations
2. Do NOT change the meaning or obligations in the original text
3. Preserve factual accuracy
4. Maintain neutrality

Input Legal Text:
${text}

Please provide your response in the following JSON format:
{
    "simplified": "Plain English explanation of the text",
    "keyPoints": [
        "Key point 1",
        "Key point 2",
        "Key point 3"
    ],
    "riskLevel": "Low|Medium|High",
    "riskReason": "Brief explanation of the risk level",
    ${this.extractDefinitions ? '"definitions": ["term1: definition", "term2: definition"],' : ''}
    "obligations": ["obligation 1", "obligation 2"],
    "parties": ["party 1", "party 2"],
    "timelines": ["timeline 1", "timeline 2"]
}

Respond with ONLY the JSON object, no additional text.`;
    }

    // Call OpenAI API
    async callOpenAI(prompt) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a legal document simplification assistant. Provide responses in JSON format only.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: this.detailedAnalysis ? 2000 : 1000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API error');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        // Parse JSON response
        try {
            return JSON.parse(content);
        } catch (e) {
            // If response is not JSON, extract text and create structured response
            return this.fallbackParse(content);
        }
    }

    // Call Google Gemini API
    async callGemini(prompt) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: this.detailedAnalysis ? 2000 : 1000
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Gemini API error');
        }

        const data = await response.json();
        const content = data.candidates[0].content.parts[0].text;

        // Parse JSON response
        try {
            // Remove markdown code blocks if present
            const jsonText = content.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(jsonText);
        } catch (e) {
            return this.fallbackParse(content);
        }
    }

    // Fallback parser if AI doesn't return JSON
    fallbackParse(content) {
        return {
            simplified: content,
            keyPoints: ['AI response received - see simplified explanation'],
            riskLevel: 'Medium',
            riskReason: 'Unable to automatically assess - please review carefully',
            obligations: [],
            parties: [],
            timelines: []
        };
    }

    // Estimate token count (rough approximation)
    estimateTokens(text) {
        // Rough estimate: 1 token ≈ 4 characters
        return Math.ceil(text.length / 4);
    }

    // Estimate cost
    estimateCost(text) {
        const tokens = this.estimateTokens(text);

        if (this.provider === 'openai') {
            if (this.model === 'gpt-4') {
                return {
                    tokens,
                    cost: (tokens / 1000) * 0.03,
                    model: 'GPT-4'
                };
            } else {
                return {
                    tokens,
                    cost: (tokens / 1000) * 0.002,
                    model: 'GPT-3.5-turbo'
                };
            }
        } else if (this.provider === 'gemini') {
            return {
                tokens,
                cost: 0, // Free tier
                model: 'Gemini Pro'
            };
        }

        return { tokens: 0, cost: 0, model: 'None' };
    }
}

// Initialize global AI service
window.aiService = new AIService();
