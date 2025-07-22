class DocDragon {
    constructor() {
        this.apiKey = "AIzaSyDfKwR1dGsb6A9y0NHvynxfSSCjfNfjVeI"; // Replace with your actual API key
        this.apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
        
        // DOM elements
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        // Company data storage
        this.companyData = {
            holidays: null,
            benefits: null,
            conduct: null,
            terms: null,
            itPolicies: null,
            pto: null
        };
        
        // Conversation context
        this.context = [];
        
        this.initializeEventListeners();
        this.loadCompanyData();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    async loadCompanyData() {
        try {
            const [holidays, benefits, conduct, terms, itPolicies, pto] = await Promise.all([
                this.fetchData('data/holidays.json'),
                this.fetchData('data/benefits.json'),
                this.fetchData('data/code_of_conduct.json'),
                this.fetchData('data/terms.json'),
                this.fetchData('data/it_policies.json'),
                this.fetchData('data/pto_policy.json')
            ]);
            
            this.companyData = { holidays, benefits, conduct, terms, itPolicies, pto };
            console.log('Company data loaded successfully');
        } catch (error) {
            console.error('Error loading company data:', error);
            this.addMessage("Warning: Some company data failed to load. Basic functions may be limited.", 'bot');
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

        // Add user message to chat and context
        this.addMessage(message, 'user');
        this.context.push({ role: 'user', content: message });

        // Show typing indicator
        this.showTypingIndicator();

        try {
            let response;
            if (this.isCompanyQuery(message)) {
                response = this.handleCompanyQuery(message);
            } else {
                // For general queries, use Gemini API with context
                response = await this.callGeminiAPI(message);
            }
            
            // Add response to context
            this.context.push({ role: 'assistant', content: response });
            
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            console.error('Error:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
            this.showError('Failed to process your request. Please check your connection and try again.');
        } finally {
            this.sendButton.disabled = false;
            this.chatInput.disabled = false;
            this.chatInput.focus();
        }
    }

    isCompanyQuery(message) {
        const companyKeywords = [
            'holiday', 'benefit', 'policy', 'pto', 'leave', 
            'it policy', 'code of conduct', 'terms', 'novatech',
            'company', 'employee', 'hr', 'human resources'
        ];
        return companyKeywords.some(keyword => 
            message.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    handleCompanyQuery(message) {
        const lowerMsg = message.toLowerCase();
        
        // Check for specific question patterns
        if (lowerMsg.includes('holiday') || lowerMsg.includes('leave calendar')) {
            return this.getHolidayInfo(message);
        } else if (lowerMsg.includes('benefit') || lowerMsg.includes('perk')) {
            return this.getBenefitsInfo(message);
        } else if (lowerMsg.includes('pto') || lowerMsg.includes('time off')) {
            return this.getPTOInfo(message);
        } else if (lowerMsg.includes('it policy') || lowerMsg.includes('password')) {
            return this.getITPolicyInfo(message);
        } else if (lowerMsg.includes('code of conduct') || lowerMsg.includes('behavior')) {
            return this.getConductInfo(message);
        } else if (lowerMsg.includes('term') || lowerMsg.includes('condition')) {
            return this.getTermsInfo(message);
        } else {
            // General company information search
            return this.searchAllCompanyData(message);
        }
    }

    getHolidayInfo(query) {
        if (!this.companyData.holidays) {
            return "I couldn't access the holiday data. Please try again later.";
        }

        const data = this.companyData.holidays;
        let response = `📅 ${data.document_title} ${data.year}\n\n`;

        // Check if asking about specific holiday
        const fixedHolidayNames = data.fixed_holidays.map(h => h.name.toLowerCase());
        const optionalHolidayNames = data.optional_holidays.map(h => h.name.toLowerCase());
        const allHolidayNames = [...fixedHolidayNames, ...optionalHolidayNames];
        
        const askedAboutSpecificHoliday = allHolidayNames.some(name => 
            query.toLowerCase().includes(name.toLowerCase())
        );

        if (askedAboutSpecificHoliday) {
            // Return info about specific holiday
            for (const holiday of [...data.fixed_holidays, ...data.optional_holidays]) {
                if (query.toLowerCase().includes(holiday.name.toLowerCase())) {
                    return `🗓️ ${holiday.name}:\n` +
                           `Date: ${holiday.date} (${holiday.day})\n` +
                           `Type: ${holiday.type || 'Optional Holiday'}\n` +
                           `Observed: ${holiday.type ? 'Company-wide' : 'Select any 2'}`;
                }
            }
        }

        // Return full holiday list
        response += "🏢 Fixed Holidays:\n";
        data.fixed_holidays.forEach(holiday => {
            response += `- ${holiday.date} (${holiday.day}): ${holiday.name}\n`;
        });
        
        response += "\n🎉 Optional Holidays (choose 2):\n";
        data.optional_holidays.forEach(holiday => {
            response += `- ${holiday.date} (${holiday.day}): ${holiday.name}\n`;
        });
        
        return response;
    }

    getBenefitsInfo(query) {
        if (!this.companyData.benefits) {
            return "I couldn't access the benefits data. Please try again later.";
        }

        const data = this.companyData.benefits;
        let response = "🌟 NovaTech Employee Benefits\n\n";

        // Check if asking about specific benefit category
        const categories = Object.keys(data);
        const askedAboutCategory = categories.some(category => 
            query.toLowerCase().includes(category.toLowerCase())
        );

        if (askedAboutCategory) {
            for (const category of categories) {
                if (query.toLowerCase().includes(category.toLowerCase())) {
                    response += `📌 ${this.capitalize(category.replace(/_/g, ' '))}:\n`;
                    data[category].forEach(item => {
                        response += `- ${item}\n`;
                    });
                    return response;
                }
            }
        }

        // Return all benefits overview
        for (const category of categories) {
            response += `📌 ${this.capitalize(category.replace(/_/g, ' '))}:\n`;
            // Show just first 2 items per category for overview
            data[category].slice(0, 2).forEach(item => {
                response += `- ${item}\n`;
            });
            response += `... (${data[category].length - 2} more items)\n\n`;
        }
        response += "\nAsk about a specific category for more details!";
        return response;
    }

    getPTOInfo(query) {
        if (!this.companyData.pto) {
            return "I couldn't access the PTO policy. Please try again later.";
        }

        const data = this.companyData.pto;
        let response = "⛱️ Paid Time Off (PTO) Policy\n\n";

        // Check if asking about specific aspect
        if (query.toLowerCase().includes('accru') || query.toLowerCase().includes('earn')) {
            response += "PTO Accrual Rates:\n";
            for (const rate of data.accrual_rates) {
                response += `- ${rate.years}: ${rate.days_per_month} days/month (${rate.total_days} days annual)\n`;
            }
            return response;
        }

        if (query.toLowerCase().includes('carryover') || query.toLowerCase().includes('rollover')) {
            return `PTO Carryover: Up to ${data.carryover_days} days can be carried over to next year.`;
        }

        // Default PTO summary
        response += `Eligibility: ${data.eligibility}\n\n`;
        response += "Accrual Rates:\n";
        data.accrual_rates.slice(0, 2).forEach(rate => {
            response += `- ${rate.years}: ${rate.days_per_month} days/month\n`;
        });
        response += `\nCarryover: ${data.carryover_days} days maximum\n`;
        response += `Request Notice: ${data.request_notice} for planned time off`;
        
        return response;
    }

    getITPolicyInfo(query) {
        if (!this.companyData.itPolicies) {
            return "I couldn't access the IT policies. Please try again later.";
        }

        const data = this.companyData.itPolicies;
        let response = "💻 IT Policies\n\n";

        // Check for specific IT questions
        if (query.toLowerCase().includes('password')) {
            return `🔐 Password Requirements:\n` +
                   `- Length: ${data.password.min_length} characters minimum\n` +
                   `- Complexity: ${data.password.complexity_requirements.join(', ')}\n` +
                   `- Change every ${data.password.change_days} days`;
        }

        if (query.toLowerCase().includes('remote') || query.toLowerCase().includes('vpn')) {
            return `🏠 Remote Work Policies:\n` +
                   `- ${data.remote_work.vpn_requirement}\n` +
                   `- ${data.remote_work.device_policy}\n` +
                   `- Allowed for: ${data.remote_work.allowed_roles.join(', ')}`;
        }

        // Default IT policy summary
        response += `Acceptable Use: ${data.acceptable_use.summary}\n\n`;
        response += `Security: ${data.security.summary}\n\n`;
        response += `Contact IT: ${data.contact.methods.join(' or ')}`;
        
        return response;
    }

    searchAllCompanyData(query) {
        let results = [];
        const threshold = 0.7; // Similarity threshold
        
        // Search through all data categories
        for (const [category, data] of Object.entries(this.companyData)) {
            if (!data) continue;
            
            const categoryResults = this.searchData(data, query, category);
            if (categoryResults) {
                results.push(categoryResults);
            }
        }
        
        if (results.length > 0) {
            return "I found these relevant company policies:\n\n" + 
                   results.join("\n\n");
        }
        
        return "I couldn't find specific information about that topic. " +
               "Would you like me to check our general policies or search external resources?";
    }

    searchData(data, query, category) {
        // Simple keyword search implementation
        // In a real app, you might use more advanced search algorithms
        
        const queryTerms = query.toLowerCase().split(/\s+/);
        let matches = [];
        
        // Recursive search through data structure
        const search = (obj, path = []) => {
            if (typeof obj === 'string') {
                const score = queryTerms.filter(term => 
                    obj.toLowerCase().includes(term)
                ).length / queryTerms.length;
                
                if (score > 0.5) {
                    matches.push({
                        text: obj,
                        score,
                        path
                    });
                }
            } else if (Array.isArray(obj)) {
                obj.forEach((item, index) => 
                    search(item, [...path, `[${index}]`])
                );
            } else if (typeof obj === 'object' && obj !== null) {
                for (const key in obj) {
                    search(obj[key], [...path, key]);
                }
            }
        };
        
        search(data);
        
        if (matches.length > 0) {
            // Get top 3 matches
            matches.sort((a, b) => b.score - a.score);
            const topMatches = matches.slice(0, 3);
            
            let result = `🔍 ${this.capitalize(category.replace(/_/g, ' '))}:\n`;
            topMatches.forEach(match => {
                result += `- ${match.text}\n`;
            });
            return result;
        }
        
        return null;
    }

    async callGeminiAPI(message) {
        // Include conversation context
        const contents = [
            {
                role: "user",
                parts: [{
                    text: "You are DocDragon, NovaTech's helpful assistant. " +
                          "Keep responses professional but friendly. " +
                          "If asked about company policies, refer to the official documents. " +
                          "Current conversation context:\n" +
                          this.context.map(c => `${c.role}: ${c.content}`).join('\n') +
                          "\n\nNow respond to this:\n" + message
                }]
            }
        ];

        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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

    // Helper methods
    capitalize(str) {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Preserve newlines in the text
        const formattedText = text.replace(/\n/g, '<br>');
        contentDiv.innerHTML = formattedText;
        
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
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

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DocDragon();
});