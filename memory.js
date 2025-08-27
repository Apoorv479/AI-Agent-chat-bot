class AstrologyDataHandler {
    static capitalize(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    static containsRelevantData(data, query) {
        if (typeof data === 'string') {
            return data.toLowerCase().includes(query.toLowerCase());
        } else if (Array.isArray(data)) {
            return data.some(item =>
                this.containsRelevantData(item, query)
            );
        } else if (typeof data === 'object') {
            return Object.values(data).some(value =>
                this.containsRelevantData(value, query)
            );
        }
        return false;
    }

    static formatDataForCategory(category, data) {
        switch(category) {
            case 'zodiacsigns':
                return this.formatZodiacData(data);
            case 'planetarytransits':
                return this.formatTransitData(data);
            case 'dailyhoroscope':
                return this.formatHoroscopeData(data);
            case 'compatibility':
                return this.formatCompatibilityData(data);
            case 'remedies':
                return this.formatRemediesData(data);
            case 'astro_terms':
                return this.formatAstroTermsData(data);
            case 'festivals':
                return this.formatFestivalData(data);
            default:
                return JSON.stringify(data, null, 2);
        }
    }

    // 🌟 Zodiac Signs
    static formatZodiacData(data) {
        let formatted = `♈ Zodiac Signs:\n`;
        for (let sign in data) {
            formatted += `\n${this.capitalize(sign)} (${data[sign].period})\n`;
            formatted += `Traits: ${data[sign].characteristics.join(", ")}\n`;
        }
        return formatted;
    }

    // 🪐 Planetary Transits
    static formatTransitData(data) {
        let formatted = "🪐 Planetary Transits:\n";
        data.transits.forEach(t => {
            formatted += `- ${t.planet} in ${t.sign} (${t.date}): ${t.effect}\n`;
        });
        return formatted;
    }

    // 🔮 Daily Horoscope
    static formatHoroscopeData(data) {
        let formatted = "🔮 Daily Horoscope:\n";
        for (let sign in data) {
            formatted += `\n${this.capitalize(sign)}:\n`;
            formatted += `- Love: ${data[sign].love}\n`;
            formatted += `- Career: ${data[sign].career}\n`;
            formatted += `- Health: ${data[sign].health}\n`;
            formatted += `- Advice: ${data[sign].advice}\n`;
        }
        return formatted;
    }

    // ❤️ Compatibility
    static formatCompatibilityData(data) {
        let formatted = "❤️ Compatibility:\n";
        data.compatibility.forEach(pair => {
            formatted += `\n${pair.sign1} ♡ ${pair.sign2}\n`;
            formatted += `- Strength: ${pair.strength}\n`;
            formatted += `- Weakness: ${pair.weakness}\n`;
            formatted += `- Score: ${pair.score}/100\n`;
        });
        return formatted;
    }

    // 🕉️ Remedies
    static formatRemediesData(data) {
        let formatted = "🕉️ Remedies:\n";
        for (let issue in data) {
            formatted += `\nIssue: ${this.capitalize(issue)}\n`;
            formatted += `- Remedies: ${data[issue].remedies.join(", ")}\n`;
            formatted += `- Mantra: ${data[issue].mantra}\n`;
        }
        return formatted;
    }

    // 📖 Astro Terms
    static formatAstroTermsData(data) {
        let formatted = "📖 Astrology Glossary:\n";
        data.terms.forEach(term => {
            formatted += `- ${term.word}: ${term.meaning}\n`;
        });
        return formatted;
    }

    // 🎉 Festivals
    static formatFestivalData(data) {
        let formatted = "🎉 Festivals:\n";
        data.festivals.forEach(f => {
            formatted += `- ${f.date}: ${f.name} (${f.significance})\n`;
        });
        return formatted;
    }
}

module.exports = AstrologyDataHandler;