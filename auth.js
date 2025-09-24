/**
 * Authentication Module
 * Handles user authentication, session management, and security
 */

class AuthenticationManager {
    constructor() {
        this.currentUser = null;
        this.currentSession = null;
        this.isAuthenticated = false;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.refreshTokenInterval = null;
        this.autoLogoutTimer = null;
        
        // Security settings
        this.securityConfig = {
            maxLoginAttempts: 5,
            lockoutDuration: 15 * 60 * 1000, // 15 minutes
            passwordMinLength: 8,
            requireSpecialChars: true,
            sessionTimeout: this.sessionTimeout
        };
        
        // Demo users for testing
        this.demoUsers = [
            {
                id: 'demo-athlete-1',
                email: 'athlete@demo.com',
                password: 'password123',
                name: 'Demo Athlete',
                role: 'athlete',
                profile: {
                    age: 25,
                    weight: 75,
                    height: 180,
                    sport: 'Weightlifting',
                    experience: 'Intermediate'
                },
                preferences: {
                    units: 'metric',
                    notifications: true,
                    privacy: 'standard'
                },
                createdAt: new Date().toISOString(),
                lastLogin: null,
                loginAttempts: 0,
                lockedUntil: null
            },
            {
                id: 'demo-coach-1',
                email: 'coach@demo.com',
                password: 'password123',
                name: 'Demo Coach',
                role: 'coach',
                profile: {
                    specialization: 'Strength Training',
                    experience: '10 years',
                    certifications: ['NSCA-CSCS', 'USAW Level 2']
                },
                preferences: {
                    units: 'imperial',
                    notifications: true,
                    privacy: 'standard'
                },
                createdAt: new Date().toISOString(),
                lastLogin: null,
                loginAttempts: 0,
                lockedUntil: null
            },
            {
                id: 'demo-admin-1',
                email: 'admin@demo.com',
                password: 'password123',
                name: 'Demo Admin',
                role: 'admin',
                profile: {
                    department: 'IT',
                    clearance: 'full'
                },
                preferences: {
                    units: 'metric',
                    notifications: true,
                    privacy: 'minimal'
                },
                createdAt: new Date().toISOString(),
                lastLogin: null,
                loginAttempts: 0,
                lockedUntil: null
            }
        ];
        
        this.init();
    }

    init() {
        this.loadStoredSession();
        this.setupSessionMonitoring();
        console.log('Authentication Manager initialized');
    }

    // ===== LOGIN METHODS =====
    async login(email, password, rememberMe = false) {
        try {
            // Validate input
            if (!email || !password) {
                throw new Error('Email and password are required');
            }
            
            if (!this.isValidEmail(email)) {
                throw new Error('Invalid email format');
            }
            
            // Find user
            const user = this.findUserByEmail(email);
            if (!user) {
                throw new Error('Invalid credentials');
            }
            
            // Check if account is locked
            if (this.isAccountLocked(user)) {
                const lockoutTime = this.getRemainingLockoutTime(user);
                throw new Error(`Account locked. Try again in ${Math.ceil(lockoutTime / 60000)} minutes.`);
            }
            
            // Verify password
            if (!this.verifyPassword(password, user.password)) {
                this.incrementLoginAttempts(user);
                throw new Error('Invalid credentials');
            }
            
            // Reset login attempts on successful login
            user.loginAttempts = 0;
            user.lockedUntil = null;
            user.lastLogin = new Date().toISOString();
            
            // Create session
            const session = this.createSession(user, rememberMe);
            
            // Store session
            this.currentUser = user;
            this.currentSession = session;
            this.isAuthenticated = true;
            
            this.saveSession();
            this.startSessionMonitoring();
            
            console.log(`User logged in: ${user.email}`);
            return {
                success: true,
                user: this.sanitizeUser(user),
                session: session
            };
            
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async register(userData) {
        try {
            // Validate input
            this.validateRegistrationData(userData);
            
            // Check if user already exists
            if (this.findUserByEmail(userData.email)) {
                throw new Error('User with this email already exists');
            }
            
            // Create new user
            const user = this.createUser(userData);
            
            // Store user
            this.saveUser(user);
            
            console.log(`User registered: ${user.email}`);
            return {
                success: true,
                user: this.sanitizeUser(user)
            };
            
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    logout() {
        try {
            if (this.currentSession) {
                this.invalidateSession(this.currentSession.id);
            }
            
            this.currentUser = null;
            this.currentSession = null;
            this.isAuthenticated = false;
            
            this.clearStoredSession();
            this.stopSessionMonitoring();
            
            console.log('User logged out');
            return { success: true };
            
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== SESSION MANAGEMENT =====
    createSession(user, rememberMe = false) {
        const sessionId = this.generateSessionId();
        const expiresAt = new Date();
        expiresAt.setTime(expiresAt.getTime() + this.sessionTimeout);
        
        const session = {
            id: sessionId,
            userId: user.id,
            email: user.email,
            role: user.role,
            createdAt: new Date().toISOString(),
            expiresAt: expiresAt.toISOString(),
            lastActivity: new Date().toISOString(),
            rememberMe: rememberMe,
            ipAddress: this.getClientIP(),
            userAgent: navigator.userAgent
        };
        
        return session;
    }

    validateSession(sessionId) {
        const session = this.getStoredData('currentSession');
        
        if (!session || session.id !== sessionId) {
            return false;
        }
        
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        
        if (now > expiresAt) {
            this.clearStoredSession();
            return false;
        }
        
        // Update last activity
        session.lastActivity = new Date().toISOString();
        this.setStoredData('currentSession', session);
        
        return true;
    }

    invalidateSession(sessionId) {
        // In a real app, this would invalidate the session on the server
        console.log(`Session invalidated: ${sessionId}`);
    }

    refreshSession() {
        if (!this.currentSession) return false;
        
        const now = new Date();
        const expiresAt = new Date(this.currentSession.expiresAt);
        
        // Refresh if session expires within 5 minutes
        if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
            this.currentSession.expiresAt = new Date(now.getTime() + this.sessionTimeout).toISOString();
            this.currentSession.lastActivity = new Date().toISOString();
            this.saveSession();
            return true;
        }
        
        return false;
    }

    // ===== USER MANAGEMENT =====
    findUserByEmail(email) {
        const users = this.getStoredData('users') || this.demoUsers;
        return users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }

    createUser(userData) {
        const userId = this.generateUserId();
        
        return {
            id: userId,
            email: userData.email.toLowerCase(),
            password: this.hashPassword(userData.password),
            name: userData.name,
            role: userData.role || 'athlete',
            profile: userData.profile || {},
            preferences: userData.preferences || {
                units: 'metric',
                notifications: true,
                privacy: 'standard'
            },
            createdAt: new Date().toISOString(),
            lastLogin: null,
            loginAttempts: 0,
            lockedUntil: null,
            isActive: true
        };
    }

    saveUser(user) {
        const users = this.getStoredData('users') || [];
        const existingIndex = users.findIndex(u => u.id === user.id);
        
        if (existingIndex >= 0) {
            users[existingIndex] = user;
        } else {
            users.push(user);
        }
        
        this.setStoredData('users', users);
    }

    updateUser(userId, updates) {
        const users = this.getStoredData('users') || this.demoUsers;
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex >= 0) {
            users[userIndex] = { ...users[userIndex], ...updates };
            this.setStoredData('users', users);
            
            // Update current user if it's the same user
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = users[userIndex];
            }
            
            return users[userIndex];
        }
        
        return null;
    }

    // ===== SECURITY METHODS =====
    isAccountLocked(user) {
        if (!user.lockedUntil) return false;
        
        const now = new Date();
        const lockedUntil = new Date(user.lockedUntil);
        
        if (now < lockedUntil) {
            return true;
        } else {
            // Unlock account if lockout period has expired
            user.lockedUntil = null;
            user.loginAttempts = 0;
            this.saveUser(user);
            return false;
        }
    }

    incrementLoginAttempts(user) {
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        
        if (user.loginAttempts >= this.securityConfig.maxLoginAttempts) {
            user.lockedUntil = new Date(Date.now() + this.securityConfig.lockoutDuration).toISOString();
        }
        
        this.saveUser(user);
    }

    getRemainingLockoutTime(user) {
        if (!user.lockedUntil) return 0;
        
        const now = new Date();
        const lockedUntil = new Date(user.lockedUntil);
        
        return Math.max(0, lockedUntil.getTime() - now.getTime());
    }

    validatePassword(password) {
        const errors = [];
        
        if (password.length < this.securityConfig.passwordMinLength) {
            errors.push(`Password must be at least ${this.securityConfig.passwordMinLength} characters long`);
        }
        
        if (this.securityConfig.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // ===== UTILITY METHODS =====
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    hashPassword(password) {
        // In a real app, use proper password hashing (bcrypt, scrypt, etc.)
        // This is just a simple hash for demo purposes
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    sanitizeUser(user) {
        // Remove sensitive data before sending to client
        const { password, loginAttempts, lockedUntil, ...sanitized } = user;
        return sanitized;
    }

    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getClientIP() {
        // In a real app, this would be provided by the server
        return '127.0.0.1';
    }

    // ===== SESSION MONITORING =====
    setupSessionMonitoring() {
        // Monitor user activity
        document.addEventListener('click', () => this.updateActivity());
        document.addEventListener('keypress', () => this.updateActivity());
        document.addEventListener('scroll', () => this.updateActivity());
        
        // Check session validity periodically
        this.refreshTokenInterval = setInterval(() => {
            this.checkSessionValidity();
        }, 60000); // Check every minute
    }

    stopSessionMonitoring() {
        if (this.refreshTokenInterval) {
            clearInterval(this.refreshTokenInterval);
            this.refreshTokenInterval = null;
        }
        
        if (this.autoLogoutTimer) {
            clearTimeout(this.autoLogoutTimer);
            this.autoLogoutTimer = null;
        }
    }

    updateActivity() {
        if (this.currentSession) {
            this.currentSession.lastActivity = new Date().toISOString();
            this.saveSession();
        }
    }

    checkSessionValidity() {
        if (!this.currentSession) return;
        
        const now = new Date();
        const expiresAt = new Date(this.currentSession.expiresAt);
        
        if (now > expiresAt) {
            console.log('Session expired');
            this.logout();
            
            if (window.athleteAI) {
                window.athleteAI.showNotification('Session expired. Please log in again.', 'warning');
                window.athleteAI.showAuthScreen();
            }
        } else {
            // Refresh session if needed
            this.refreshSession();
        }
    }

    startSessionMonitoring() {
        this.stopSessionMonitoring();
        this.setupSessionMonitoring();
    }

    // ===== DATA PERSISTENCE =====
    saveSession() {
        if (this.currentSession) {
            this.setStoredData('currentSession', this.currentSession);
        }
    }

    loadStoredSession() {
        const session = this.getStoredData('currentSession');
        
        if (session && this.validateSession(session.id)) {
            const user = this.findUserByEmail(session.email);
            
            if (user) {
                this.currentUser = user;
                this.currentSession = session;
                this.isAuthenticated = true;
                this.startSessionMonitoring();
                
                console.log('Session restored from storage');
                return true;
            }
        }
        
        this.clearStoredSession();
        return false;
    }

    clearStoredSession() {
        this.removeStoredData('currentSession');
    }

    getStoredData(key) {
        try {
            const data = localStorage.getItem(`auth_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading auth data:', error);
            return null;
        }
    }

    setStoredData(key, data) {
        try {
            localStorage.setItem(`auth_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving auth data:', error);
        }
    }

    removeStoredData(key) {
        try {
            localStorage.removeItem(`auth_${key}`);
        } catch (error) {
            console.error('Error removing auth data:', error);
        }
    }

    // ===== VALIDATION METHODS =====
    validateRegistrationData(userData) {
        const errors = [];
        
        if (!userData.name || userData.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }
        
        if (!userData.email || !this.isValidEmail(userData.email)) {
            errors.push('Valid email address is required');
        }
        
        if (!userData.password) {
            errors.push('Password is required');
        } else {
            const passwordValidation = this.validatePassword(userData.password);
            if (!passwordValidation.isValid) {
                errors.push(...passwordValidation.errors);
            }
        }
        
        if (!userData.role || !['athlete', 'coach', 'admin'].includes(userData.role)) {
            errors.push('Valid role is required (athlete, coach, or admin)');
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join('. '));
        }
    }

    // ===== PUBLIC API =====
    getCurrentUser() {
        return this.currentUser ? this.sanitizeUser(this.currentUser) : null;
    }

    getCurrentSession() {
        return this.currentSession;
    }

    isLoggedIn() {
        return this.isAuthenticated && this.currentUser && this.currentSession;
    }

    hasRole(role) {
        return this.isLoggedIn() && this.currentUser.role === role;
    }

    hasAnyRole(roles) {
        return this.isLoggedIn() && roles.includes(this.currentUser.role);
    }

    getSecurityConfig() {
        return { ...this.securityConfig };
    }

    updateSecurityConfig(config) {
        this.securityConfig = { ...this.securityConfig, ...config };
    }

    // ===== CLEANUP =====
    destroy() {
        this.stopSessionMonitoring();
        this.currentUser = null;
        this.currentSession = null;
        this.isAuthenticated = false;
        console.log('Authentication Manager destroyed');
    }
}

// Initialize Authentication Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make class globally available
    window.AuthenticationManager = AuthenticationManager;
});
