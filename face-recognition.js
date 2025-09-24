/**
 * Face Recognition Module
 * Advanced biometric authentication using computer vision
 */

class FaceRecognition {
    constructor() {
        this.isInitialized = false;
        this.isRecognizing = false;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.stream = null;
        this.faceDetector = null;
        this.knownFaces = new Map();
        this.recognitionThreshold = 0.6;
        this.maxFaces = 5;
        this.frameCount = 0;
        this.lastDetectionTime = 0;
        this.detectionInterval = 200; // Detect every 200ms
        
        // Face detection settings
        this.detectionConfig = {
            model: 'short', // 'short' or 'full'
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        };
        
        // Recognition settings
        this.recognitionConfig = {
            maxResults: 5,
            scoreThreshold: 0.6
        };
        
        this.init();
    }

    async init() {
        try {
            await this.setupFaceDetection();
            await this.loadKnownFaces();
            this.isInitialized = true;
            
            console.log('Face Recognition initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Face Recognition:', error);
            throw error;
        }
    }

    async setupFaceDetection() {
        // In a real implementation, this would load TensorFlow.js Face Detection
        // For now, we'll simulate the face detection setup
        console.log('Setting up face detection...');
        
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Face detection ready');
    }

    async loadKnownFaces() {
        // Load known faces from storage
        const storedFaces = this.getStoredData('knownFaces');
        if (storedFaces) {
            this.knownFaces = new Map(storedFaces);
            console.log(`Loaded ${this.knownFaces.size} known faces`);
        } else {
            // Initialize with demo faces
            this.initializeDemoFaces();
        }
    }

    initializeDemoFaces() {
        // Add demo faces for testing
        const demoFaces = [
            {
                id: 'demo-athlete',
                name: 'Demo Athlete',
                email: 'athlete@demo.com',
                role: 'athlete',
                features: this.generateRandomFaceFeatures(),
                enrolled: new Date().toISOString()
            },
            {
                id: 'demo-coach',
                name: 'Demo Coach',
                email: 'coach@demo.com',
                role: 'coach',
                features: this.generateRandomFaceFeatures(),
                enrolled: new Date().toISOString()
            },
            {
                id: 'demo-admin',
                name: 'Demo Admin',
                email: 'admin@demo.com',
                role: 'admin',
                features: this.generateRandomFaceFeatures(),
                enrolled: new Date().toISOString()
            }
        ];
        
        demoFaces.forEach(face => {
            this.knownFaces.set(face.id, face);
        });
        
        this.saveKnownFaces();
        console.log('Initialized demo faces');
    }

    generateRandomFaceFeatures() {
        // Generate random face features for simulation
        return {
            landmarks: Array.from({ length: 68 }, () => ({
                x: Math.random() * 100,
                y: Math.random() * 100
            })),
            descriptor: Array.from({ length: 128 }, () => Math.random()),
            boundingBox: {
                x: Math.random() * 50,
                y: Math.random() * 50,
                width: 20 + Math.random() * 30,
                height: 20 + Math.random() * 30
            }
        };
    }

    async performFaceRecognition() {
        if (!this.isInitialized) {
            throw new Error('Face Recognition not initialized');
        }
        
        if (this.isRecognizing) {
            throw new Error('Face recognition already in progress');
        }
        
        this.isRecognizing = true;
        
        try {
            // Start camera
            await this.startCamera();
            
            // Perform recognition
            const result = await this.recognizeFace();
            
            // Stop camera
            this.stopCamera();
            
            this.isRecognizing = false;
            return result;
            
        } catch (error) {
            this.stopCamera();
            this.isRecognizing = false;
            throw error;
        }
    }

    async startCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640, min: 320 },
                    height: { ideal: 480, min: 240 },
                    facingMode: 'user'
                }
            });
            
            // Create temporary video element for face detection
            this.video = document.createElement('video');
            this.video.srcObject = this.stream;
            this.video.play();
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.video.onloadedmetadata = resolve;
            });
            
            // Create canvas for face detection
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            console.log(`Camera started for face recognition: ${this.video.videoWidth}x${this.video.videoHeight}`);
            return true;
            
        } catch (error) {
            console.error('Error accessing camera for face recognition:', error);
            throw new Error('Camera access denied for face recognition');
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
        }
        
        if (this.video) {
            this.video.srcObject = null;
        }
        
        this.video = null;
        this.canvas = null;
        this.ctx = null;
    }

    async recognizeFace() {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const maxDuration = 10000; // 10 seconds timeout
            
            const recognitionLoop = () => {
                if (Date.now() - startTime > maxDuration) {
                    reject(new Error('Face recognition timeout'));
                    return;
                }
                
                try {
                    // Capture frame
                    this.ctx.drawImage(this.video, 0, 0);
                    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                    
                    // Detect faces
                    const faces = this.detectFaces(imageData);
                    
                    if (faces.length > 0) {
                        // Try to recognize the face
                        const recognition = this.recognizeFaces(faces);
                        
                        if (recognition.recognized) {
                            resolve(recognition);
                            return;
                        }
                    }
                    
                    // Continue recognition loop
                    setTimeout(recognitionLoop, this.detectionInterval);
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            recognitionLoop();
        });
    }

    detectFaces(imageData) {
        // In a real implementation, this would use TensorFlow.js Face Detection
        // For now, we'll simulate face detection
        
        const faces = [];
        const numFaces = Math.floor(Math.random() * 3) + 1; // 1-3 faces
        
        for (let i = 0; i < numFaces; i++) {
            const face = {
                boundingBox: {
                    x: Math.random() * (this.canvas.width - 100),
                    y: Math.random() * (this.canvas.height - 100),
                    width: 80 + Math.random() * 40,
                    height: 80 + Math.random() * 40
                },
                landmarks: this.generateFaceLandmarks(),
                confidence: 0.7 + Math.random() * 0.3,
                descriptor: this.generateFaceDescriptor()
            };
            
            faces.push(face);
        }
        
        return faces;
    }

    generateFaceLandmarks() {
        // Generate 68 facial landmarks for simulation
        const landmarks = [];
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Face outline (0-16)
        for (let i = 0; i < 17; i++) {
            landmarks.push({
                x: centerX + Math.sin(i * 0.4) * 50 + (Math.random() - 0.5) * 10,
                y: centerY + Math.cos(i * 0.4) * 30 + (Math.random() - 0.5) * 10
            });
        }
        
        // Eyebrows (17-26)
        for (let i = 17; i < 27; i++) {
            landmarks.push({
                x: centerX + (i - 21.5) * 15 + (Math.random() - 0.5) * 5,
                y: centerY - 20 + (Math.random() - 0.5) * 5
            });
        }
        
        // Eyes (27-35, 36-47)
        for (let eye = 0; eye < 2; eye++) {
            const eyeX = centerX + (eye === 0 ? -20 : 20);
            for (let i = 0; i < 6; i++) {
                landmarks.push({
                    x: eyeX + Math.sin(i * Math.PI / 3) * 8 + (Math.random() - 0.5) * 3,
                    y: centerY - 10 + Math.cos(i * Math.PI / 3) * 5 + (Math.random() - 0.5) * 3
                });
            }
        }
        
        // Nose (48-67)
        for (let i = 48; i < 68; i++) {
            landmarks.push({
                x: centerX + (Math.random() - 0.5) * 10,
                y: centerY + (i - 58) * 2 + (Math.random() - 0.5) * 5
            });
        }
        
        return landmarks;
    }

    generateFaceDescriptor() {
        // Generate 128-dimensional face descriptor for simulation
        return Array.from({ length: 128 }, () => Math.random());
    }

    recognizeFaces(faces) {
        if (faces.length === 0) {
            return { recognized: false, confidence: 0 };
        }
        
        // Use the first detected face
        const face = faces[0];
        
        // Compare with known faces
        let bestMatch = null;
        let bestScore = 0;
        
        for (const [id, knownFace] of this.knownFaces) {
            const similarity = this.calculateFaceSimilarity(face.descriptor, knownFace.features.descriptor);
            
            if (similarity > bestScore && similarity > this.recognitionThreshold) {
                bestScore = similarity;
                bestMatch = knownFace;
            }
        }
        
        if (bestMatch) {
            return {
                recognized: true,
                confidence: bestScore,
                user: {
                    id: bestMatch.id,
                    name: bestMatch.name,
                    email: bestMatch.email,
                    role: bestMatch.role
                },
                face: face
            };
        }
        
        return { recognized: false, confidence: bestScore };
    }

    calculateFaceSimilarity(descriptor1, descriptor2) {
        // Calculate cosine similarity between face descriptors
        if (descriptor1.length !== descriptor2.length) {
            return 0;
        }
        
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        
        for (let i = 0; i < descriptor1.length; i++) {
            dotProduct += descriptor1[i] * descriptor2[i];
            norm1 += descriptor1[i] * descriptor1[i];
            norm2 += descriptor2[i] * descriptor2[i];
        }
        
        norm1 = Math.sqrt(norm1);
        norm2 = Math.sqrt(norm2);
        
        if (norm1 === 0 || norm2 === 0) {
            return 0;
        }
        
        return dotProduct / (norm1 * norm2);
    }

    async enrollFace(userData) {
        if (!this.isInitialized) {
            throw new Error('Face Recognition not initialized');
        }
        
        try {
            // Start camera for enrollment
            await this.startCamera();
            
            // Capture multiple face samples
            const samples = await this.captureFaceSamples(5);
            
            if (samples.length === 0) {
                throw new Error('No face detected during enrollment');
            }
            
            // Create face template
            const faceTemplate = this.createFaceTemplate(samples);
            
            // Store face data
            const faceData = {
                id: userData.id || this.generateFaceId(),
                name: userData.name,
                email: userData.email,
                role: userData.role,
                features: faceTemplate,
                enrolled: new Date().toISOString(),
                samples: samples.length
            };
            
            this.knownFaces.set(faceData.id, faceData);
            this.saveKnownFaces();
            
            // Stop camera
            this.stopCamera();
            
            console.log(`Face enrolled successfully for ${faceData.name}`);
            return faceData;
            
        } catch (error) {
            this.stopCamera();
            throw error;
        }
    }

    async captureFaceSamples(count) {
        const samples = [];
        const captureInterval = 500; // 500ms between captures
        
        return new Promise((resolve, reject) => {
            let captured = 0;
            
            const captureSample = () => {
                try {
                    // Capture frame
                    this.ctx.drawImage(this.video, 0, 0);
                    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                    
                    // Detect face
                    const faces = this.detectFaces(imageData);
                    
                    if (faces.length > 0) {
                        samples.push(faces[0]);
                        captured++;
                        
                        // Update progress
                        this.updateEnrollmentProgress(captured, count);
                    }
                    
                    if (captured >= count) {
                        resolve(samples);
                    } else {
                        setTimeout(captureSample, captureInterval);
                    }
                    
                } catch (error) {
                    reject(error);
                }
            };
            
            captureSample();
        });
    }

    createFaceTemplate(samples) {
        // Create a template from multiple face samples
        const landmarks = samples.map(sample => sample.landmarks);
        const descriptors = samples.map(sample => sample.descriptor);
        
        // Average landmarks
        const avgLandmarks = [];
        for (let i = 0; i < landmarks[0].length; i++) {
            const avgX = landmarks.reduce((sum, lm) => sum + lm[i].x, 0) / landmarks.length;
            const avgY = landmarks.reduce((sum, lm) => sum + lm[i].y, 0) / landmarks.length;
            avgLandmarks.push({ x: avgX, y: avgY });
        }
        
        // Average descriptor
        const avgDescriptor = [];
        for (let i = 0; i < descriptors[0].length; i++) {
            const avg = descriptors.reduce((sum, desc) => sum + desc[i], 0) / descriptors.length;
            avgDescriptor.push(avg);
        }
        
        // Average bounding box
        const avgBoundingBox = {
            x: samples.reduce((sum, s) => sum + s.boundingBox.x, 0) / samples.length,
            y: samples.reduce((sum, s) => sum + s.boundingBox.y, 0) / samples.length,
            width: samples.reduce((sum, s) => sum + s.boundingBox.width, 0) / samples.length,
            height: samples.reduce((sum, s) => sum + s.boundingBox.height, 0) / samples.length
        };
        
        return {
            landmarks: avgLandmarks,
            descriptor: avgDescriptor,
            boundingBox: avgBoundingBox,
            confidence: samples.reduce((sum, s) => sum + s.confidence, 0) / samples.length
        };
    }

    updateEnrollmentProgress(current, total) {
        // Update enrollment progress UI
        const progress = (current / total) * 100;
        console.log(`Enrollment progress: ${progress.toFixed(0)}%`);
        
        // You could update a progress bar here
        if (window.athleteAI && window.athleteAI.showNotification) {
            window.athleteAI.showNotification(`Capturing face sample ${current}/${total}`, 'info');
        }
    }

    generateFaceId() {
        return 'face_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    deleteFace(faceId) {
        if (this.knownFaces.has(faceId)) {
            this.knownFaces.delete(faceId);
            this.saveKnownFaces();
            console.log(`Face deleted: ${faceId}`);
            return true;
        }
        return false;
    }

    getKnownFaces() {
        return Array.from(this.knownFaces.values());
    }

    getFaceById(faceId) {
        return this.knownFaces.get(faceId);
    }

    updateRecognitionThreshold(threshold) {
        this.recognitionThreshold = Math.max(0, Math.min(1, threshold));
        console.log(`Recognition threshold updated: ${this.recognitionThreshold}`);
    }

    // Data persistence methods
    saveKnownFaces() {
        const facesArray = Array.from(this.knownFaces.entries());
        this.setStoredData('knownFaces', facesArray);
    }

    getStoredData(key) {
        try {
            const data = localStorage.getItem(`faceRecognition_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error loading face recognition data:', error);
            return null;
        }
    }

    setStoredData(key, data) {
        try {
            localStorage.setItem(`faceRecognition_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving face recognition data:', error);
        }
    }

    // Utility methods
    isSupported() {
        return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    }

    getCapabilities() {
        return {
            supported: this.isSupported(),
            initialized: this.isInitialized,
            knownFaces: this.knownFaces.size,
            recognitionThreshold: this.recognitionThreshold,
            maxFaces: this.maxFaces
        };
    }

    // Cleanup method
    destroy() {
        this.stopCamera();
        this.isInitialized = false;
        this.knownFaces.clear();
        console.log('Face Recognition destroyed');
    }
}

// Initialize Face Recognition when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make class globally available
    window.FaceRecognition = FaceRecognition;
});
