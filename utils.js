/**
 * Utility Functions for AthleteAI
 * Common helper functions and utilities
 */

// ===== DOM UTILITIES =====
const DOM = {
    // Get element by ID
    get(id) {
        return document.getElementById(id);
    },
    
    // Get elements by class
    getByClass(className) {
        return document.getElementsByClassName(className);
    },
    
    // Get elements by selector
    query(selector) {
        return document.querySelector(selector);
    },
    
    // Get all elements by selector
    queryAll(selector) {
        return document.querySelectorAll(selector);
    },
    
    // Create element
    create(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.textContent = content;
        return element;
    },
    
    // Add event listener
    on(element, event, handler) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.addEventListener(event, handler);
        }
    },
    
    // Remove event listener
    off(element, event, handler) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.removeEventListener(event, handler);
        }
    },
    
    // Show element
    show(element) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.remove('hidden');
        }
    },
    
    // Hide element
    hide(element) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.add('hidden');
        }
    },
    
    // Toggle element visibility
    toggle(element) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.toggle('hidden');
        }
    },
    
    // Add class
    addClass(element, className) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.add(className);
        }
    },
    
    // Remove class
    removeClass(element, className) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.remove(className);
        }
    },
    
    // Toggle class
    toggleClass(element, className) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.classList.toggle(className);
        }
    },
    
    // Set text content
    setText(element, text) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.textContent = text;
        }
    },
    
    // Set HTML content
    setHTML(element, html) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.innerHTML = html;
        }
    },
    
    // Set attribute
    setAttr(element, attr, value) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            element.setAttribute(attr, value);
        }
    },
    
    // Get attribute
    getAttr(element, attr) {
        if (typeof element === 'string') {
            element = this.get(element);
        }
        if (element) {
            return element.getAttribute(attr);
        }
        return null;
    }
};

// ===== STRING UTILITIES =====
const StringUtils = {
    // Capitalize first letter
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    // Convert to title case
    titleCase(str) {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    },
    
    // Convert camelCase to kebab-case
    kebabCase(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    },
    
    // Convert kebab-case to camelCase
    camelCase(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    },
    
    // Generate random string
    randomString(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    // Truncate string
    truncate(str, length = 50, suffix = '...') {
        if (str.length <= length) return str;
        return str.substring(0, length) + suffix;
    },
    
    // Remove HTML tags
    stripHTML(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    },
    
    // Escape HTML
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// ===== NUMBER UTILITIES =====
const NumberUtils = {
    // Format number with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    // Format currency
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    // Format percentage
    formatPercentage(value, decimals = 1) {
        return `${(value * 100).toFixed(decimals)}%`;
    },
    
    // Clamp number between min and max
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    // Generate random number between min and max
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Round to specified decimal places
    round(value, decimals = 2) {
        return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },
    
    // Convert bytes to human readable format
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
};

// ===== DATE UTILITIES =====
const DateUtils = {
    // Format date
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },
    
    // Get relative time (e.g., "2 hours ago")
    getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        
        if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
        if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
        if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'Just now';
    },
    
    // Check if date is today
    isToday(date) {
        const today = new Date();
        const d = new Date(date);
        return d.toDateString() === today.toDateString();
    },
    
    // Check if date is yesterday
    isYesterday(date) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const d = new Date(date);
        return d.toDateString() === yesterday.toDateString();
    },
    
    // Add days to date
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    
    // Get start of day
    startOfDay(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    },
    
    // Get end of day
    endOfDay(date) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    }
};

// ===== VALIDATION UTILITIES =====
const Validation = {
    // Email validation
    isEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Phone number validation
    isPhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/\s/g, ''));
    },
    
    // URL validation
    isURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    // Password strength validation
    validatePassword(password) {
        const result = {
            isValid: false,
            score: 0,
            feedback: []
        };
        
        if (password.length >= 8) {
            result.score += 25;
        } else {
            result.feedback.push('Password must be at least 8 characters long');
        }
        
        if (/[A-Z]/.test(password)) {
            result.score += 25;
        } else {
            result.feedback.push('Password must contain at least one uppercase letter');
        }
        
        if (/[0-9]/.test(password)) {
            result.score += 25;
        } else {
            result.feedback.push('Password must contain at least one number');
        }
        
        if (/[^A-Za-z0-9]/.test(password)) {
            result.score += 25;
        } else {
            result.feedback.push('Password must contain at least one special character');
        }
        
        result.isValid = result.score >= 75;
        return result;
    },
    
    // Required field validation
    isRequired(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },
    
    // Number validation
    isNumber(value) {
        return !isNaN(value) && isFinite(value);
    },
    
    // Integer validation
    isInteger(value) {
        return Number.isInteger(Number(value));
    },
    
    // Positive number validation
    isPositive(value) {
        return this.isNumber(value) && Number(value) > 0;
    }
};

// ===== STORAGE UTILITIES =====
const Storage = {
    // Set item in localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },
    
    // Get item from localStorage
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },
    
    // Remove item from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },
    
    // Clear all localStorage
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    },
    
    // Check if key exists
    has(key) {
        return localStorage.getItem(key) !== null;
    },
    
    // Get all keys
    keys() {
        return Object.keys(localStorage);
    },
    
    // Get storage size
    size() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }
};

// ===== ANIMATION UTILITIES =====
const Animation = {
    // Fade in element
    fadeIn(element, duration = 300) {
        if (typeof element === 'string') {
            element = DOM.get(element);
        }
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = performance.now();
        
        function animate(time) {
            let progress = (time - start) / duration;
            if (progress > 1) progress = 1;
            
            element.style.opacity = progress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    // Fade out element
    fadeOut(element, duration = 300) {
        if (typeof element === 'string') {
            element = DOM.get(element);
        }
        if (!element) return;
        
        let start = performance.now();
        let startOpacity = parseFloat(getComputedStyle(element).opacity);
        
        function animate(time) {
            let progress = (time - start) / duration;
            if (progress > 1) progress = 1;
            
            element.style.opacity = startOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    // Slide down element
    slideDown(element, duration = 300) {
        if (typeof element === 'string') {
            element = DOM.get(element);
        }
        if (!element) return;
        
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        let targetHeight = element.scrollHeight;
        let start = performance.now();
        
        function animate(time) {
            let progress = (time - start) / duration;
            if (progress > 1) progress = 1;
            
            element.style.height = (targetHeight * progress) + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.height = 'auto';
                element.style.overflow = 'visible';
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    // Slide up element
    slideUp(element, duration = 300) {
        if (typeof element === 'string') {
            element = DOM.get(element);
        }
        if (!element) return;
        
        let startHeight = element.offsetHeight;
        let start = performance.now();
        
        element.style.height = startHeight + 'px';
        element.style.overflow = 'hidden';
        
        function animate(time) {
            let progress = (time - start) / duration;
            if (progress > 1) progress = 1;
            
            element.style.height = (startHeight * (1 - progress)) + 'px';
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.height = 'auto';
                element.style.overflow = 'visible';
            }
        }
        
        requestAnimationFrame(animate);
    }
};

// ===== DEBOUNCE AND THROTTLE =====
const Timing = {
    // Debounce function
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },
    
    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// ===== ERROR HANDLING =====
const ErrorHandler = {
    // Log error
    log(error, context = '') {
        console.error(`[${new Date().toISOString()}] ${context}:`, error);
        
        // In production, you might want to send this to an error tracking service
        if (window.athleteAI && window.athleteAI.showNotification) {
            window.athleteAI.showNotification('An error occurred. Please try again.', 'error');
        }
    },
    
    // Handle async errors
    async handleAsync(func, context = '') {
        try {
            return await func();
        } catch (error) {
            this.log(error, context);
            throw error;
        }
    },
    
    // Handle promise errors
    handlePromise(promise, context = '') {
        return promise.catch(error => {
            this.log(error, context);
            throw error;
        });
    }
};

// ===== EXPORT UTILITIES =====
window.Utils = {
    DOM,
    StringUtils,
    NumberUtils,
    DateUtils,
    Validation,
    Storage,
    Animation,
    Timing,
    ErrorHandler
};
