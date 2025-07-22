class CompanyDataHandler {
    static capitalize(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    static containsRelevantData(data, query) {
        // Implement search logic based on your data structure
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
            case 'holidays':
                return this.formatHolidayData(data);
            case 'benefits':
                return this.formatBenefitsData(data);
            // Add cases for other categories
            default:
                return JSON.stringify(data, null, 2);
        }
    }

    static formatHolidayData(data) {
        let formatted = "📅 Holidays:\n";
        data.fixed_holidays.forEach(h => {
            formatted += `- ${h.date}: ${h.name}\n`;
        });
        return formatted;
    }

    // Add more formatting methods as needed
}