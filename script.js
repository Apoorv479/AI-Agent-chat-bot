class AstroBot {
    constructor() {
        this.apiKey = "xxxxxxxxxxxxxxxx"; // Replace with your actual API key
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
            astroTerms: null
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
            const [zodiacSigns, dailyHoroscope, festivals, remedies, astroTerms] = await Promise.all([
                this.fetchData('data/zodiac_signs.json'),
                this.fetchData('data/daily_horoscope.json'),
                this.fetchData('data/festivals.json'),
                this.fetchData('data/remedies.json'),
                this.fetchData('data/astro_terms.json')
            ]);

            this.astroData = { zodiacSigns, dailyHoroscope, festivals, remedies, astroTerms };
            console.log('Astrology data loaded successfully');
        } catch (error) {
            console.error('Error loading astrology data:', error);
            this.addMessage("⚠️ Some astrology data failed to load. Predictions may be limited.", 'bot');
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

        this.chatInput.value = '';
        this.sendButton.disabled = true;
        this.chatInput.disabled = true;

        this.addMessage(message, 'user');
        this.context.push({ role: 'user', content: message });

        this.showTypingIndicator();

        try {
            let response;
            if (this.isAstroQuery(message)) {
                response = this.handleAstroQuery(message);
            } else {
                response = await this.callGeminiAPI(message);
            }

            this.context.push({ role: 'assistant', content: response });

            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            console.error('Error:', error);
            this.hideTypingIndicator();
            this.addMessage('⚠️ Sorry, I encountered an error. Please try again.', 'bot');
            this.showError('Failed to process your request. Please check your connection and try again.');
        } finally {
            this.sendButton.disabled = false;
            this.chatInput.disabled = false;
            this.chatInput.focus();
        }
    }

    isAstroQuery(message) {
        const astroKeywords = [
            'zodiac', 'horoscope', 'festival', 'remedy', 'mantra',
            'astrology', 'astro', 'planet', 'prediction', 'sign',
            'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
        ];
        return astroKeywords.some(keyword =>
            message.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    handleAstroQuery(message) {
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('zodiac') || lowerMsg.includes('sign')) {
            return this.getZodiacInfo(message);
        } else if (lowerMsg.includes('horoscope') || lowerMsg.includes('today')) {
            return this.getHoroscopeInfo(message);
        } else if (lowerMsg.includes('festival')) {
            return this.getFestivalInfo(message);
        } else if (lowerMsg.includes('remedy') || lowerMsg.includes('dosha')) {
            return this.getRemedyInfo(message);
        } else if (lowerMsg.includes('term') || lowerMsg.includes('meaning')) {
            return this.getAstroTermInfo(message);
        } else {
            return this.searchAllAstroData(message);
        }
    }

    getZodiacInfo(query) {
        const data = this.astroData.zodiacSigns;
        if (!data) return "♈ Zodiac data not available.";

        for (const sign of data.signs) {
            if (query.toLowerCase().includes(sign.name.toLowerCase())) {
                return `♑ ${sign.name} (${sign.period})\n` +
                       `Traits: ${sign.traits.join(', ')}\n` +
                       `Element: ${sign.element}, Ruling Planet: ${sign.planet}`;
            }
        }

        return "Please specify a zodiac sign (e.g., Aries, Leo, Pisces).";
    }

    getHoroscopeInfo(query) {
        const data = this.astroData.dailyHoroscope;
        if (!data) return "🔮 Horoscope data not available.";

        for (const sign in data) {
            if (query.toLowerCase().includes(sign.toLowerCase())) {
                return `🔮 ${sign} Horoscope for Today:\n` + data[sign].prediction;
            }
        }

        return "Please specify your zodiac sign for today's horoscope.";
    }

    getFestivalInfo(query) {
        const data = this.astroData.festivals;
        if (!data) return "🎉 Festival data not available.";

        let response = "🌙 Upcoming Festivals:\n";
        data.festivals.slice(0, 5).forEach(f => {
            response += `- ${f.name} on ${f.date} (${f.significance})\n`;
        });
        return response;
    }

    getRemedyInfo(query) {
        const data = this.astroData.remedies;
        if (!data) return "🕉 Remedies data not available.";

        let response = "🕉 Suggested Remedies:\n";
        for (const [dosha, remedyList] of Object.entries(data)) {
            if (query.toLowerCase().includes(dosha.toLowerCase())) {
                remedyList.forEach(r => response += `- ${r}\n`);
                return response;
            }
        }

        return "Please mention the dosha or issue (e.g., Shani dosha, career remedy).";
    }

    getAstroTermInfo(query) {
        const data = this.astroData.astroTerms;
        if (!data) return "📖 Astrology terms not available.";

        for (const term of data.terms) {
            if (query.toLowerCase().includes(term.term.toLowerCase())) {
                return `📖 ${term.term}: ${term.definition}`;
            }
        }

        return "Please specify an astrology term you want explained.";
    }

    searchAllAstroData(query) {
        return "I couldn't find exact info on that. Try asking about zodiac signs, horoscopes, remedies, or festivals.";
    }

    async callGeminiAPI(message) {
        const contents = [
            {
                role: "user",
                parts: [{
                    text: "You are AstroBot, a helpful astrology assistant. " +
                          "Provide zodiac insights, horoscope predictions, remedies, and festival information. " +
                          "Current conversation context:\n" +
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

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('No response from API');
        }
    }

    // Helpers
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

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.chatMessages.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Initialize chatbot
document.addEventListener('DOMContentLoaded', () => {
    new AstroBot();
});