class AstroDragon {
    constructor() {
        this.apiKey = "xxxxxxxxxxxxxxxx"; // Replace with your Gemini API key
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
            console.log("Astrology data loaded successfully");
        } catch (error) {
            console.error("Error loading astrology data:", error);
            this.addMessage("⚠️ Some astrology data failed to load. Limited responses may be available.", 'bot');
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
            if (this.isAstrologyQuery(message)) {
                response = this.handleAstrologyQuery(message);
            } else {
                response = await this.callGeminiAPI(message);
            }

            this.context.push({ role: 'assistant', content: response });

            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            console.error("Error:", error);
            this.hideTypingIndicator();
            this.addMessage("Sorry, something went wrong. Please try again.", 'bot');
            this.showError("Error processing your request.");
        } finally {
            this.sendButton.disabled = false;
            this.chatInput.disabled = false;
            this.chatInput.focus();
        }
    }

    isAstrologyQuery(message) {
        const astroKeywords = [
            "zodiac", "aries", "taurus", "gemini", "cancer", "leo", "virgo",
            "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
            "horoscope", "festival", "remedy", "puja", "astrology", "term"
        ];
        return astroKeywords.some(keyword =>
            message.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    handleAstrologyQuery(message) {
        const lowerMsg = message.toLowerCase();

        if (this.containsAny(lowerMsg, ["zodiac", "sign", "aries", "taurus", "gemini", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"])) {
            return this.getZodiacInfo(message);
        } else if (this.containsAny(lowerMsg, ["horoscope", "today", "tomorrow", "daily"])) {
            return this.getDailyHoroscope(message);
        } else if (this.containsAny(lowerMsg, ["festival", "celebration", "puja"])) {
            return this.getFestivalInfo(message);
        } else if (this.containsAny(lowerMsg, ["remedy", "dosha", "solution", "upay"])) {
            return this.getRemedyInfo(message);
        } else if (this.containsAny(lowerMsg, ["meaning", "term", "astrology word"])) {
            return this.getAstroTermInfo(message);
        }

        return "🔮 Please ask about zodiac signs, daily horoscopes, remedies, festivals, or astrology terms!";
    }

    getZodiacInfo(query) {
        const signs = this.astroData.zodiacSigns?.signs || [];
        for (const sign of signs) {
            if (query.toLowerCase().includes(sign.name.toLowerCase())) {
                return `♈ ${sign.name} (${sign.period})\n\nCharacteristics:\n${sign.characteristics.join(", ")}`;
            }
        }
        return "I couldn’t find that zodiac sign. Try asking about Aries, Taurus, Gemini, etc.";
    }

    getDailyHoroscope(query) {
        const horoscopes = this.astroData.dailyHoroscope?.horoscopes || {};
        for (const sign in horoscopes) {
            if (query.toLowerCase().includes(sign.toLowerCase())) {
                const today = horoscopes[sign].today;
                return `📝 Daily Horoscope for ${sign}:\n\nLove: ${today.love}\nCareer: ${today.career}\nHealth: ${today.health}`;
            }
        }
        return "Please mention a zodiac sign for the daily horoscope.";
    }

    getFestivalInfo(query) {
        const festivals = this.astroData.festivals?.festivals || [];
        for (const fest of festivals) {
            if (query.toLowerCase().includes(fest.name.toLowerCase())) {
                return `🎉 ${fest.name} (${fest.date})\nSignificance: ${fest.significance}\nTraditions: ${fest.traditions.join(", ")}`;
            }
        }
        return "I couldn’t find that festival. Try asking about Diwali, Holi, or Navratri.";
    }

    getRemedyInfo(query) {
        const remedies = this.astroData.remedies?.remedies || {};
        for (const sign in remedies) {
            if (query.toLowerCase().includes(sign.toLowerCase())) {
                return `🪔 Remedies for ${sign}:\n${remedies[sign].join("\n- ")}`;
            }
        }
        return "Please mention a zodiac sign to get specific remedies.";
    }

    getAstroTermInfo(query) {
        const terms = this.astroData.astroTerms?.terms || [];
        for (const term of terms) {
            if (query.toLowerCase().includes(term.term.toLowerCase())) {
                return `📘 ${term.term}: ${term.definition}`;
            }
        }
        return "I couldn’t find that astrology term. Try asking about Ascendant, Retrograde, or Nakshatra.";
    }

    async callGeminiAPI(message) {
        const contents = [
            {
                role: "user",
                parts: [{
                    text: "You are AstroDragon, a helpful astrology assistant. " +
                        "Answer in a mystical yet clear tone. " +
                        "Use zodiac, horoscope, remedies, festivals, or astrology terms if relevant. " +
                        "Conversation so far:\n" +
                        this.context.map(c => `${c.role}: ${c.content}`).join("\n") +
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
            throw new Error("No response from Gemini API");
        }
    }

    // Helper utilities
    containsAny(text, keywords) {
        return keywords.some(kw => text.includes(kw.toLowerCase()));
    }

    capitalize(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

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
    new AstroDragon();
});