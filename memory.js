class AstrologyDataHandler {
    static capitalize(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    static containsRelevantData(data, query) {
        if (typeof data === 'string') {
            return data.toLowerCase().includes(query.toLowerCase());
        } else if (Array.isArray(data)) {
            return data.some(item => this.containsRelevantData(item, query));
        } else if (typeof data === 'object') {
            return Object.values(data).some(value => this.containsRelevantData(value, query));
        }
        return false;
    }

    static formatDataForCategory(category, data) {
        switch (category) {
            case 'zodiac_signs':
                return this.formatZodiacData(data);
            case 'daily_horoscope':
                return this.formatDailyHoroscopeData(data);
            case 'festivals':
                return this.formatFestivalData(data);
            case 'remedies':
                return this.formatRemediesData(data);
            case 'astro_terms':
                return this.formatAstroTermsData(data);
            case 'planetary_transits':
                return this.formatTransitData(data);
            default:
                return JSON.stringify(data, null, 2);
        }
    }

    static formatZodiacData(data) {
        let formatted = "♈ Zodiac Signs:\n";
        data.forEach(sign => {
            formatted += `\n${sign.name} (${sign.period})\n- Element: ${sign.element}\n- Characteristics: ${sign.characteristics.join(", ")}\n`;
        });
        return formatted;
    }

    static formatDailyHoroscopeData(data) {
        let formatted = `🔮 Daily Horoscope (${data.date}):\n`;
        data.horoscopes.forEach(h => {
            formatted += `\n${h.sign}:\n- Love: ${h.love}\n- Career: ${h.career}\n- Health: ${h.health}\n- Lucky Number: ${h.lucky_number}\n- Lucky Color: ${h.lucky_color}\n`;
        });
        return formatted;
    }

    static formatFestivalData(data) {
        let formatted = "🎉 Festivals:\n";
        data.festivals.forEach(f => {
            formatted += `\n${f.date} - ${f.name}: ${f.significance}\n`;
        });
        return formatted;
    }

    static formatRemediesData(data) {
        let formatted = "🪔 Remedies:\n";
        data.remedies.forEach(r => {
            formatted += `\n${r.issue} → Remedy: ${r.remedy}\n`;
        });
        return formatted;
    }

    static formatAstroTermsData(data) {
        let formatted = "📖 Astrology Terms:\n";
        data.terms.forEach(t => {
            formatted += `\n${t.term}: ${t.definition}\n`;
        });
        return formatted;
    }

    static formatTransitData(data) {
        let formatted = "🌌 Planetary Transits:\n";
        data.transits.forEach(t => {
            formatted += `\n${t.planet} → ${t.sign} (${t.start_date} to ${t.end_date})\nEffect: ${t.effect}\n`;
        });
        return formatted;
    }
}

module.exports = AstrologyDataHandler;