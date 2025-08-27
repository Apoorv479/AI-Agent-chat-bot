class AstroBot {
    constructor() {
        this.apiKey = "xxxxxxxxxxxxxxxx"; // Replace with your actual Gemini API key
        this.apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

        // DOM elements
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');

        // Astrology data storage
        this.astroData = {
            zodiacSigns: null,
            dailyHoroscope: null,
            festivals: null,
            remedies: null,
            astroTerms: null,
            planetaryTransits: null
        };

        // Conversation context
        this.context = [];

        this.initializeEventListeners();
        this.loadAstroData();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    async loadAstroData() {
        try {
            const [
                zodiacSigns,
                dailyHoroscope,
                festivals,
                remedies,
                astroTerms,
                planetaryTransits
            ] = await Promise.all([
                this.fetchData('data/zodiac_signs.json'),
                this.fetchData('data/daily_horoscope.json'),
                this.fetchData('data/festivals.json'),
                this.fetchData('data/remedies.json'),
                this.fetchData('data/astro_terms.json'),
                this.fetchData('data/planetary_transits.json')
            ]);

            this.astroData = { zodiacSigns, dailyHoroscope, festivals, remedies, astroTerms, planetaryTransits };
            console.log('Astrology data loaded successfully');
        } catch (error) {
            console.error('Error loading astrology data:', error);
            this.addMessage("⚠️ Warning: Some astrology data failed to load. Basic functions may be limited.", 'bot');
        }
    }

    async fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        return await response.json();
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Clear input and disable send button
        this.chatInput.value = '';
        this.sendButton.disabled = true;
        this.chatInput.disabled = true;

        // Add user message
        this.addMessage(message, 'user');
        this.context.push({ role: 'user', content: message });

        // Show typing
        this.showTypingIndicator();

        try {
            let response;
            if (this.isAstroQuery(message)) {
                response = this.handleAstroQuery(message);
            } else {
                response = await this.callGeminiAPI(message);
            }

            // Add bot response
            this.context.push({ role: 'assistant', content: response });
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            console.error('Error:', error);
            this.hideTypingIndicator();
            this.addMessage('❌ Sorry, I encountered an error. Please try again.', 'bot');
        } finally {
            this.sendButton.disabled = false;
            this.chatInput.disabled = false;
            this.chatInput.focus();
        }
    }

    isAstroQuery(message) {
        const astroKeywords = [
            'zodiac', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra',
            'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
            'horoscope', 'daily horoscope', 'festival', 'remedy',
            'mantra', 'gemstone', 'astrology', 'astro term', 'planetary', 'transit'
        ];
        return astroKeywords.some(keyword =>
            message.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    handleAstroQuery(message) {
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('horoscope') || lowerMsg.includes('today')) {
            return this.getDailyHoroscope(message);
        } else if (lowerMsg.includes('festival')) {
            return this.getFestivalInfo(message);
        } else if (lowerMsg.includes('remedy') || lowerMsg.includes('solution')) {
            return this.getRemedyInfo(message);
        } else if (lowerMsg.includes('term') || lowerMsg.includes('definition')) {
            return this.getAstroTerms(message);
        } else if (lowerMsg.includes('transit') || lowerMsg.includes('planet')) {
            return this.getPlanetaryTransits(message);
        } else {
            return this.getZodiacInfo(message);
        }
    }

    getZodiacInfo(query) {
        const data = this.astroData.zodiacSigns;
        if (!data) return "⚠️ I couldn't access zodiac sign data.";

        for (const sign of data.zodiac_signs) {
            if (query.toLowerCase().includes(sign.name.toLowerCase())) {
                return `♈ ${sign.name} (${sign.period})\n\n` +
                       `**Element:** ${sign.element}\n` +
                       `**Ruling Planet:** ${sign.ruling_planet}\n\n` +
                       `✨ Characteristics: ${sign.characteristics}`;
            }
        }
        return "Please specify a zodiac sign (e.g., Aries, Leo, Pisces).";
    }

    getDailyHoroscope(query) {
        const data = this.astroData.dailyHoroscope;
        if (!data) return "⚠️ Horoscope data unavailable.";

        for (const sign in data) {
            if (query.toLowerCase().includes(sign.toLowerCase())) {
                const h = data[sign];
                return `🔮 ${sign} Horoscope (${data.date}):\n\n❤️ Love: ${h.love}\n💼 Career: ${h.career}\n💪 Health: ${h.health}\n💡 Advice: ${h.advice}`;
            }
        }
        return "Please mention your zodiac sign to get your horoscope.";
    }

    getFestivalInfo(query) {
        const data = this.astroData.festivals;
        if (!data) return "⚠️ Festival data unavailable.";

        let response = "🎉 Upcoming Festivals:\n";
        data.festivals.slice(0, 5).forEach(festival => {
            response += `- ${festival.name} on ${festival.date}: ${festival.description}\n`;
        });
        return response;
    }

    getRemedyInfo(query) {
        const data = this.astroData.remedies;
        if (!data) return "⚠️ Remedies data unavailable.";

        for (const sign in data) {
            if (query.toLowerCase().includes(sign.toLowerCase())) {
                return `💫 Remedies for ${sign}:\n` +
                       `- Gemstone: ${data[sign].gemstone}\n` +
                       `- Mantra: ${data[sign].mantra}\n` +
                       `- Lifestyle: ${data[sign].lifestyle}`;
            }
        }
        return "Please mention a zodiac sign to get remedies.";
    }

    getAstroTerms(query) {
        const data = this.astroData.astroTerms;
        if (!data) return "⚠️ Astro terms data unavailable.";

        let results = [];
        for (const term of data.terms) {
            if (query.toLowerCase().includes(term.term.toLowerCase())) {
                results.push(`📖 ${term.term}: ${term.definition}`);
            }
        }
        return results.length > 0 ? results.join("\n") : "No matching astro term found.";
    }

    getPlanetaryTransits(query) {
        const data = this.astroData.planetaryTransits;
        if (!data) return "⚠️ Planetary transit data unavailable.";

        let response = "🌌 Current Planetary Transits:\n";
        data.transits.forEach(t => {
            response += `- ${t.planet} in ${t.sign} until ${t.end_date}: ${t.effect}\n`;
        });
        return response;
    }

    async callGeminiAPI(message) {
        const contents = [
            {
                role: "user",
                parts: [{
                    text: "You are AstroBot, a friendly astrology assistant. " +
                          "If asked about zodiac signs, horoscopes, remedies, terms, or planetary transits, refer to the local JSON data. " +
                          "Conversation context:\n" +
                          this.context.map(c => `${c.role}: ${c.content}`).join('\n') +
                          "\n\nNow respond to this:\n" + message
                }]
            }
        ];

        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('No response from API');
        }
    }

    // UI helpers
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const formattedText = text.replace(/\n/g, '<br>');
        contentDiv.innerHTML = formattedText;

        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new AstroBot();
});