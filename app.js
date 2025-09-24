/**
 * AthleteAI - Main Application Controller
 * Advanced AI-powered athlete strength testing platform
 */

class AthleteAI {
    constructor() {
        this.currentUser = null;
        this.currentUserType = null;
        this.isOffline = !navigator.onLine;
        this.isInitialized = false;
        this.aiAssistant = null;
        this.faceRecognition = null;
        this.audioAssistant = null;
        
        this.init();
    }

    async init() {
        try {
            this.setupEventListeners();
            this.setupOfflineDetection();
            this.loadUserData();
            this.showLoadingScreen();
            
            // Initialize AI components
            await this.initializeAIComponents();
            
            // Simulate loading time for better UX
            await this.simulateLoading();
            
            this.hideLoadingScreen();
            this.showAuthScreen();
            this.isInitialized = true;
            
            console.log('AthleteAI initialized successfully');
        } catch (error) {
            console.error('Failed to initialize AthleteAI:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    async initializeAIComponents() {
        // Initialize AI Assistant
        if (window.AIStrengthAssistant) {
            this.aiAssistant = new AIStrengthAssistant();
        }
        
        // Initialize Face Recognition
        if (window.FaceRecognition) {
            this.faceRecognition = new FaceRecognition();
        }
        
        // Initialize Audio Assistant
        if (window.AudioAssistant) {
            this.audioAssistant = new AudioAssistant();
        }
    }

    async simulateLoading() {
        const steps = [
            'Initializing AI Systems...',
            'Loading Computer Vision...',
            'Setting up Face Recognition...',
            'Preparing Audio Assistant...',
            'Optimizing Performance...',
            'Ready!'
        ];
        
        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            this.updateLoadingText(steps[i]);
        }
    }

    updateLoadingText(text) {
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    setupEventListeners() {
        // Authentication events
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form')?.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('face-recognition-btn')?.addEventListener('click', () => this.handleFaceRecognition());
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchAuthTab(e.target.dataset.tab));
        });
        
        // User type selection
        document.querySelectorAll('.user-type-card').forEach(card => {
            card.addEventListener('click', () => this.selectUserType(card.dataset.type));
        });
        
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.navigateToSection(e.target.dataset.section));
        });
        
        // Dashboard actions
        document.getElementById('ai-strength-test-btn')?.addEventListener('click', () => this.startAITesting());
        document.getElementById('log-training-btn')?.addEventListener('click', () => this.showTrainingSection());
        document.getElementById('nutrition-plan-btn')?.addEventListener('click', () => this.showNutritionSection());
        document.getElementById('message-coach-btn')?.addEventListener('click', () => this.showMessagingSection());
        
        // Training actions
        document.getElementById('start-new-session')?.addEventListener('click', () => this.startNewSession());
        document.getElementById('ai-testing-card')?.addEventListener('click', () => this.startAITesting());
        document.getElementById('manual-entry-card')?.addEventListener('click', () => this.showManualEntry());
        document.getElementById('wearable-sync-card')?.addEventListener('click', () => this.showWearableSync());
        
        // AI Testing controls
        document.getElementById('start-ai-test')?.addEventListener('click', () => this.startAITest());
        document.getElementById('stop-ai-test')?.addEventListener('click', () => this.stopAITest());
        document.getElementById('capture-snapshot')?.addEventListener('click', () => this.captureSnapshot());
        
        // Back buttons
        document.getElementById('back-to-training')?.addEventListener('click', () => this.showTrainingSection());
        document.getElementById('back-to-training-manual')?.addEventListener('click', () => this.showTrainingSection());
        
        // Training form
        document.getElementById('training-form')?.addEventListener('submit', (e) => this.handleTrainingSubmit(e));
        
        // Password toggle
        document.querySelectorAll('.password-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => this.togglePasswordVisibility(e.target));
        });
        
        // Password strength
        document.getElementById('register-password')?.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
        
        // Range slider
        document.getElementById('difficulty')?.addEventListener('input', (e) => this.updateRangeValue(e.target));
        
        // Notification close
        document.querySelector('.toast-close')?.addEventListener('click', () => this.hideNotification());
        
        // Search functionality
        document.querySelector('.search-input')?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Notification button
        document.querySelector('.notification-btn')?.addEventListener('click', () => this.showNotifications());
    }

    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.isOffline = false;
            this.hideOfflineIndicator();
            this.showNotification('Connection restored', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.isOffline = true;
            this.showOfflineIndicator();
            this.showNotification('Working offline', 'info');
        });
        
        if (this.isOffline) {
            this.showOfflineIndicator();
        }
    }

    // ===== SCREEN MANAGEMENT =====
    showLoadingScreen() {
        document.getElementById('loading-screen').classList.remove('hidden');
    }

    hideLoadingScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
    }

    showAuthScreen() {
        this.hideAllScreens();
        document.getElementById('auth-screen').classList.remove('hidden');
    }

    showUserTypeScreen() {
        this.hideAllScreens();
        document.getElementById('user-type-screen').classList.remove('hidden');
    }

    showMainApp() {
        this.hideAllScreens();
        document.getElementById('main-app').classList.remove('hidden');
        this.updateUserDisplay();
        this.showDashboardSection();
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
    }

    // ===== AUTHENTICATION =====
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        try {
            const isValid = await this.authenticateUser(email, password);
            
            if (isValid) {
                this.currentUser = { email, rememberMe };
                this.saveUserData();
                this.showUserTypeScreen();
                this.showNotification('Login successful', 'success');
            } else {
                this.showNotification('Invalid credentials', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const role = document.getElementById('user-role').value;
        const termsAgreed = document.getElementById('terms-agreement').checked;
        
        if (!name || !email || !password || !role) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!termsAgreed) {
            this.showNotification('Please agree to the terms and conditions', 'error');
            return;
        }
        
        try {
            const userCreated = await this.createUser({ name, email, password, role });
            
            if (userCreated) {
                this.currentUser = { name, email, role };
                this.currentUserType = role;
                this.saveUserData();
                this.showMainApp();
                this.showNotification('Account created successfully', 'success');
            } else {
                this.showNotification('Failed to create account', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
        }
    }

    async authenticateUser(email, password) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Demo credentials
        const validUsers = [
            { email: 'athlete@demo.com', password: 'password123', role: 'athlete' },
            { email: 'coach@demo.com', password: 'password123', role: 'coach' },
            { email: 'admin@demo.com', password: 'password123', role: 'admin' }
        ];
        
        const user = validUsers.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUserType = user.role;
            return true;
        }
        
        return false;
    }

    async createUser(userData) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real app, this would create the user in the database
        console.log('Creating user:', userData);
        return true;
    }

    async handleFaceRecognition() {
        const btn = document.getElementById('face-recognition-btn');
        const statusDiv = document.getElementById('face-recognition-status');
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-camera"></i><span>Scanning...</span>';
        
        try {
            if (this.faceRecognition) {
                const result = await this.faceRecognition.performFaceRecognition();
                
                if (result.recognized) {
                    statusDiv.classList.remove('hidden');
                    statusDiv.classList.add('success');
                    statusDiv.textContent = '✅ Face recognized successfully!';
                    
                    // Auto-fill login form
                    document.getElementById('login-email').value = 'athlete@demo.com';
                    document.getElementById('login-password').value = 'password123';
                    
                    this.showNotification('Face recognition successful', 'success');
                } else {
                    throw new Error('Face not recognized');
                }
            } else {
                // Fallback simulation
                await new Promise(resolve => setTimeout(resolve, 3000));
                statusDiv.classList.remove('hidden');
                statusDiv.classList.add('success');
                statusDiv.textContent = '✅ Face recognized successfully!';
                
                document.getElementById('login-email').value = 'athlete@demo.com';
                document.getElementById('login-password').value = 'password123';
            }
        } catch (error) {
            statusDiv.classList.remove('hidden');
            statusDiv.classList.add('error');
            statusDiv.textContent = '❌ Face recognition failed. Please try again.';
            this.showNotification('Face recognition failed', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-camera"></i><span>Face Recognition</span>';
        }
    }

    switchAuthTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-form`).classList.add('active');
    }

    selectUserType(userType) {
        this.currentUserType = userType;
        this.saveUserData();
        this.showMainApp();
        this.showNotification(`Welcome, ${userType}!`, 'success');
    }

    // ===== NAVIGATION =====
    navigateToSection(section) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        // Show corresponding section
        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${section}-section`).classList.add('active');
        
        // Update page title
        document.title = `${section.charAt(0).toUpperCase() + section.slice(1)} - AthleteAI`;
    }

    showDashboardSection() {
        this.navigateToSection('dashboard');
        this.updateDashboardStats();
    }

    showTrainingSection() {
        this.navigateToSection('training');
        this.hideAITestingInterface();
        this.hideManualEntryForm();
    }

    showNutritionSection() {
        this.navigateToSection('nutrition');
    }

    showMessagingSection() {
        this.navigateToSection('messaging');
    }

    // ===== DASHBOARD =====
    updateDashboardStats() {
        const stats = this.getRandomStats();
        
        document.getElementById('strength-score').textContent = stats.strength;
        document.getElementById('training-count').textContent = stats.training;
        document.getElementById('recovery-level').textContent = stats.recovery;
        document.getElementById('achievements').textContent = stats.achievements;
    }

    getRandomStats() {
        return {
            strength: Math.floor(Math.random() * 20) + 80,
            training: Math.floor(Math.random() * 10) + 20,
            recovery: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
            achievements: Math.floor(Math.random() * 5) + 10
        };
    }

    // ===== TRAINING =====
    startNewSession() {
        this.showTrainingSection();
    }

    startAITesting() {
        this.showTrainingSection();
        this.showAITestingInterface();
    }

    showAITestingInterface() {
        document.getElementById('ai-testing-interface').classList.remove('hidden');
        document.getElementById('manual-entry-form').classList.add('hidden');
    }

    hideAITestingInterface() {
        document.getElementById('ai-testing-interface').classList.add('hidden');
    }

    showManualEntry() {
        this.showTrainingSection();
        this.showManualEntryForm();
    }

    showManualEntryForm() {
        document.getElementById('manual-entry-form').classList.remove('hidden');
        document.getElementById('ai-testing-interface').classList.add('hidden');
    }

    hideManualEntryForm() {
        document.getElementById('manual-entry-form').classList.add('hidden');
    }

    showWearableSync() {
        this.showNotification('Wearable sync feature coming soon', 'info');
    }

    async startAITest() {
        if (!this.aiAssistant) {
            this.showNotification('AI Assistant not available', 'error');
            return;
        }
        
        try {
            const startBtn = document.getElementById('start-ai-test');
            const stopBtn = document.getElementById('stop-ai-test');
            
            startBtn.disabled = true;
            stopBtn.disabled = false;
            
            // Start camera
            const cameraStarted = await this.aiAssistant.startCamera();
            if (!cameraStarted) {
                throw new Error('Failed to start camera');
            }
            
            // Start analysis
            await this.aiAssistant.startAnalysis();
            
            // Simulate AI testing process
            await this.simulateAITesting();
            
        } catch (error) {
            console.error('AI Test error:', error);
            this.showNotification('Failed to start AI test', 'error');
            this.stopAITest();
        }
    }

    async simulateAITesting() {
        const instructions = [
            'Stand in the center of the frame',
            'Raise your arms to shoulder height',
            'Hold the position for 3 seconds',
            'Lower your arms slowly',
            'Analysis complete!'
        ];
        
        const instructionText = document.getElementById('ai-instruction-text');
        
        for (let i = 0; i < instructions.length; i++) {
            instructionText.textContent = instructions[i];
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        this.completeAITest();
    }

    stopAITest() {
        if (this.aiAssistant) {
            this.aiAssistant.stopAnalysis();
            this.aiAssistant.stopCamera();
        }
        
        document.getElementById('start-ai-test').disabled = false;
        document.getElementById('stop-ai-test').disabled = true;
        document.getElementById('ai-instruction-text').textContent = 'Ready for analysis';
    }

    completeAITest() {
        document.getElementById('start-ai-test').disabled = false;
        document.getElementById('stop-ai-test').disabled = true;
        document.getElementById('ai-results').classList.remove('hidden');
        
        // Generate results
        const results = this.generateAIResults();
        this.displayAIResults(results);
        
        // Save results
        this.saveAITestResults(results);
        
        this.showNotification('AI analysis completed', 'success');
    }

    generateAIResults() {
        return {
            formScore: Math.floor(Math.random() * 20) + 80,
            powerOutput: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
            stability: Math.floor(Math.random() * 20) + 80,
            symmetry: Math.floor(Math.random() * 20) + 80,
            recommendations: [
                'Excellent form! Maintain current technique.',
                'Good technique with room for improvement in core stability.',
                'Focus on proper breathing during the exercise.',
                'Consider reducing weight to improve form.',
                'Outstanding performance! Ready for increased intensity.'
            ][Math.floor(Math.random() * 5)]
        };
    }

    displayAIResults(results) {
        document.getElementById('form-score').textContent = results.formScore + '%';
        document.getElementById('power-output').textContent = results.powerOutput;
        document.getElementById('stability-score').textContent = results.stability + '%';
        document.getElementById('symmetry-score').textContent = results.symmetry + '%';
        
        // Update progress bars
        document.querySelectorAll('.result-fill').forEach((fill, index) => {
            const values = [results.formScore, results.stability, results.symmetry];
            if (values[index]) {
                fill.style.width = values[index] + '%';
            }
        });
        
        // Update recommendations
        const recommendationsList = document.getElementById('recommendations-list');
        recommendationsList.innerHTML = `
            <div class="recommendation-item">
                <i class="fas fa-check-circle"></i>
                <span>${results.recommendations}</span>
            </div>
        `;
    }

    captureSnapshot() {
        if (this.aiAssistant) {
            this.aiAssistant.captureSnapshot();
            this.showNotification('Snapshot captured', 'success');
        }
    }

    async handleTrainingSubmit(e) {
        e.preventDefault();
        
        const formData = {
            date: document.getElementById('session-date').value,
            duration: document.getElementById('session-duration').value,
            exercise: document.getElementById('exercise-type').value,
            weight: document.getElementById('weight').value,
            reps: document.getElementById('reps').value,
            sets: document.getElementById('sets').value,
            restTime: document.getElementById('rest-time').value,
            difficulty: document.getElementById('difficulty').value,
            notes: document.getElementById('notes').value,
            timestamp: new Date().toISOString()
        };
        
        try {
            this.saveTrainingData(formData);
            this.showNotification('Training session saved successfully', 'success');
            this.showDashboardSection();
        } catch (error) {
            console.error('Training save error:', error);
            this.showNotification('Failed to save training session', 'error');
        }
    }

    // ===== UTILITY FUNCTIONS =====
    togglePasswordVisibility(toggle) {
        const input = toggle.parentElement.querySelector('input');
        const icon = toggle.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');
        
        let strength = 0;
        let strengthLabel = 'Weak';
        
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        
        if (strength >= 75) strengthLabel = 'Strong';
        else if (strength >= 50) strengthLabel = 'Medium';
        else if (strength >= 25) strengthLabel = 'Weak';
        else strengthLabel = 'Very Weak';
        
        strengthBar.style.width = strength + '%';
        strengthText.textContent = strengthLabel;
        
        // Update color based on strength
        strengthBar.style.background = strength >= 75 ? 'var(--success-color)' : 
                                      strength >= 50 ? 'var(--warning-color)' : 'var(--error-color)';
    }

    updateRangeValue(slider) {
        const valueSpan = slider.parentElement.querySelector('.range-value');
        if (valueSpan) {
            valueSpan.textContent = slider.value;
        }
    }

    updateUserDisplay() {
        const userDisplay = document.getElementById('user-name');
        const roleDisplay = document.getElementById('user-role');
        
        if (userDisplay && this.currentUser) {
            userDisplay.textContent = this.currentUser.name || this.currentUser.email || 'User';
        }
        
        if (roleDisplay && this.currentUserType) {
            roleDisplay.textContent = this.currentUserType.charAt(0).toUpperCase() + this.currentUserType.slice(1);
        }
    }

    handleSearch(query) {
        // Implement search functionality
        console.log('Searching for:', query);
    }

    showNotifications() {
        this.showNotification('Notifications feature coming soon', 'info');
    }

    // ===== NOTIFICATIONS =====
    showNotification(message, type = 'info') {
        const toast = document.getElementById('notification-toast');
        const messageEl = toast.querySelector('.toast-message');
        const iconEl = toast.querySelector('.toast-content i');
        
        messageEl.textContent = message;
        
        // Update icon based on type
        iconEl.className = `fas ${
            type === 'success' ? 'fa-check-circle' :
            type === 'error' ? 'fa-exclamation-circle' :
            type === 'warning' ? 'fa-exclamation-triangle' :
            'fa-info-circle'
        }`;
        
        // Update color
        toast.style.borderLeftColor = 
            type === 'success' ? 'var(--success-color)' :
            type === 'error' ? 'var(--error-color)' :
            type === 'warning' ? 'var(--warning-color)' :
            'var(--info-color)';
        
        toast.classList.remove('hidden');
        toast.classList.add('show');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            this.hideNotification();
        }, 5000);
    }

    hideNotification() {
        const toast = document.getElementById('notification-toast');
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }

    showOfflineIndicator() {
        document.getElementById('offline-indicator').classList.remove('hidden');
    }

    hideOfflineIndicator() {
        document.getElementById('offline-indicator').classList.add('hidden');
    }

    showError(message) {
        alert(message); // Simple error display for now
    }

    // ===== DATA PERSISTENCE =====
    saveUserData() {
        const userData = {
            user: this.currentUser,
            userType: this.currentUserType,
            timestamp: new Date().toISOString()
        };
        this.setStoredData('userData', userData);
    }

    loadUserData() {
        const userData = this.getStoredData('userData');
        if (userData && userData.user) {
            this.currentUser = userData.user;
            this.currentUserType = userData.userType;
        }
    }

    saveTrainingData(data) {
        const trainingData = this.getStoredData('trainingData') || [];
        trainingData.push(data);
        this.setStoredData('trainingData', trainingData);
    }

    saveAITestResults(results) {
        const aiResults = this.getStoredData('aiResults') || [];
        aiResults.push({
            ...results,
            timestamp: new Date().toISOString()
        });
        this.setStoredData('aiResults', aiResults);
    }

    getStoredData(key) {
        try {
            const data = localStorage.getItem(`athleteAI_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    setStoredData(key, data) {
        try {
            localStorage.setItem(`athleteAI_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.athleteAI = new AthleteAI();
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
