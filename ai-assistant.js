/**
 * AI Strength Testing Assistant
 * Advanced computer vision and pose analysis for athlete performance
 */

class AIStrengthAssistant {
    constructor() {
        this.isActive = false;
        this.isInitialized = false;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        this.stream = null;
        this.poseDetector = null;
        this.analysisResults = null;
        this.frameCount = 0;
        this.lastAnalysisTime = 0;
        this.analysisInterval = 100; // Analyze every 100ms
        
        // Pose detection settings
        this.poseConfig = {
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        };
        
        // Analysis parameters
        this.analysisParams = {
            stabilityThreshold: 0.1,
            symmetryThreshold: 0.15,
            postureThreshold: 0.2,
            rangeOfMotionThreshold: 0.3
        };
        
        this.init();
    }

    async init() {
        try {
            this.video = document.getElementById('camera-feed');
            this.canvas = document.getElementById('analysis-canvas');
            
            if (this.canvas) {
                this.ctx = this.canvas.getContext('2d');
            }
            
            await this.setupPoseDetection();
            this.isInitialized = true;
            
            console.log('AI Strength Assistant initialized successfully');
        } catch (error) {
            console.error('Failed to initialize AI Assistant:', error);
            throw error;
        }
    }

    async setupPoseDetection() {
        // In a real implementation, this would load TensorFlow.js PoseNet or MediaPipe
        // For now, we'll simulate the pose detection setup
        console.log('Setting up pose detection...');
        
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('Pose detection ready');
    }

    async startCamera() {
        try {
            if (!this.video) {
                throw new Error('Video element not found');
            }
            
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 },
                    facingMode: 'user',
                    frameRate: { ideal: 30, min: 15 }
                }
            });
            
            this.video.srcObject = this.stream;
            this.video.play();
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.video.onloadedmetadata = resolve;
            });
            
            // Set canvas size to match video
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            console.log(`Camera started: ${this.video.videoWidth}x${this.video.videoHeight}`);
            return true;
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showCameraError();
            return false;
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
                console.log('Camera track stopped');
            });
            this.stream = null;
        }
        
        if (this.video) {
            this.video.srcObject = null;
        }
        
        this.isActive = false;
    }

    showCameraError() {
        const instructionText = document.getElementById('ai-instruction-text');
        if (instructionText) {
            instructionText.textContent = 'Camera access denied. Please allow camera access to use AI testing.';
        }
        
        // Show error notification
        if (window.athleteAI) {
            window.athleteAI.showNotification('Camera access required for AI testing', 'error');
        }
    }

    async startAnalysis() {
        if (!this.video || !this.canvas || !this.isInitialized) {
            throw new Error('AI Assistant not properly initialized');
        }
        
        this.isActive = true;
        this.frameCount = 0;
        this.lastAnalysisTime = 0;
        
        console.log('Starting AI analysis...');
        this.analyzeFrame();
    }

    stopAnalysis() {
        this.isActive = false;
        
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        console.log('AI analysis stopped');
    }

    analyzeFrame() {
        if (!this.isActive || !this.video || !this.canvas) {
            return;
        }
        
        const currentTime = performance.now();
        
        // Clear previous drawings
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Analyze frame at specified interval
        if (currentTime - this.lastAnalysisTime >= this.analysisInterval) {
            this.performPoseAnalysis();
            this.lastAnalysisTime = currentTime;
        }
        
        // Continue analysis loop
        requestAnimationFrame(() => this.analyzeFrame());
    }

    async performPoseAnalysis() {
        try {
            // In a real implementation, this would use TensorFlow.js or MediaPipe
            // For now, we'll simulate pose detection
            const keypoints = this.generateSimulatedKeypoints();
            
            if (keypoints && keypoints.length > 0) {
                this.drawPoseSkeleton(keypoints);
                this.analyzePose(keypoints);
            }
            
        } catch (error) {
            console.error('Pose analysis error:', error);
        }
    }

    generateSimulatedKeypoints() {
        // Simulate 33 keypoints for MediaPipe Pose
        const keypoints = [];
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Add some realistic movement variation
        const time = Date.now() / 1000;
        const variation = 30;
        
        // Face landmarks (0-10)
        for (let i = 0; i < 11; i++) {
            keypoints.push({
                x: centerX + Math.sin(time + i * 0.5) * 10 + (Math.random() - 0.5) * variation,
                y: centerY - 150 + Math.cos(time + i * 0.3) * 5 + (Math.random() - 0.5) * variation,
                confidence: 0.9 - Math.random() * 0.1
            });
        }
        
        // Upper body landmarks (11-22)
        const upperBodyPoints = [
            { x: centerX - 40, y: centerY - 50 }, // left shoulder
            { x: centerX + 40, y: centerY - 50 }, // right shoulder
            { x: centerX - 60, y: centerY - 20 }, // left elbow
            { x: centerX + 60, y: centerY - 20 }, // right elbow
            { x: centerX - 80, y: centerY + 10 }, // left wrist
            { x: centerX + 80, y: centerY + 10 }, // right wrist
            { x: centerX - 20, y: centerY + 20 }, // left pinky
            { x: centerX + 20, y: centerY + 20 }, // right pinky
            { x: centerX - 25, y: centerY + 15 }, // left index
            { x: centerX + 25, y: centerY + 15 }, // right index
            { x: centerX - 30, y: centerY + 10 }, // left thumb
            { x: centerX + 30, y: centerY + 10 }  // right thumb
        ];
        
        upperBodyPoints.forEach((point, i) => {
            keypoints.push({
                x: point.x + Math.sin(time + i * 0.2) * 5 + (Math.random() - 0.5) * variation,
                y: point.y + Math.cos(time + i * 0.2) * 3 + (Math.random() - 0.5) * variation,
                confidence: 0.8 - Math.random() * 0.2
            });
        });
        
        // Lower body landmarks (23-32)
        const lowerBodyPoints = [
            { x: centerX - 30, y: centerY + 50 }, // left hip
            { x: centerX + 30, y: centerY + 50 }, // right hip
            { x: centerX - 40, y: centerY + 100 }, // left knee
            { x: centerX + 40, y: centerY + 100 }, // right knee
            { x: centerX - 50, y: centerY + 150 }, // left ankle
            { x: centerX + 50, y: centerY + 150 }, // right ankle
            { x: centerX - 55, y: centerY + 170 }, // left heel
            { x: centerX + 55, y: centerY + 170 }, // right heel
            { x: centerX - 60, y: centerY + 175 }, // left foot index
            { x: centerX + 60, y: centerY + 175 }  // right foot index
        ];
        
        lowerBodyPoints.forEach((point, i) => {
            keypoints.push({
                x: point.x + Math.sin(time + i * 0.1) * 3 + (Math.random() - 0.5) * variation,
                y: point.y + Math.cos(time + i * 0.1) * 2 + (Math.random() - 0.5) * variation,
                confidence: 0.7 - Math.random() * 0.2
            });
        });
        
        return keypoints;
    }

    drawPoseSkeleton(keypoints) {
        if (!this.ctx || !keypoints) return;
        
        // Draw keypoints
        this.ctx.fillStyle = '#00ff00';
        keypoints.forEach((point, index) => {
            if (point.confidence > 0.5) {
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Add keypoint numbers for debugging
                if (index % 5 === 0) {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = '12px Arial';
                    this.ctx.fillText(index.toString(), point.x + 6, point.y - 6);
                    this.ctx.fillStyle = '#00ff00';
                }
            }
        });
        
        // Draw skeleton connections
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        
        // Define connections based on MediaPipe Pose model
        const connections = [
            // Face connections
            [0, 1], [1, 2], [2, 3], [3, 7],
            [0, 4], [4, 5], [5, 6], [6, 8],
            [9, 10],
            
            // Upper body connections
            [11, 12], [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
            [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
            [11, 23], [12, 24], [23, 24],
            
            // Lower body connections
            [23, 25], [25, 27], [27, 29], [29, 31],
            [24, 26], [26, 28], [28, 30], [30, 32]
        ];
        
        connections.forEach(([start, end]) => {
            if (keypoints[start] && keypoints[end] && 
                keypoints[start].confidence > 0.5 && keypoints[end].confidence > 0.5) {
                this.ctx.beginPath();
                this.ctx.moveTo(keypoints[start].x, keypoints[start].y);
                this.ctx.lineTo(keypoints[end].x, keypoints[end].y);
                this.ctx.stroke();
            }
        });
    }

    analyzePose(keypoints) {
        if (!keypoints || keypoints.length < 33) return;
        
        const analysis = {
            posture: this.analyzePosture(keypoints),
            symmetry: this.analyzeSymmetry(keypoints),
            stability: this.analyzeStability(keypoints),
            rangeOfMotion: this.analyzeRangeOfMotion(keypoints),
            timestamp: Date.now()
        };
        
        this.analysisResults = analysis;
        this.updateInstructions(analysis);
        
        // Update real-time feedback
        this.updateRealTimeFeedback(analysis);
    }

    analyzePosture(keypoints) {
        // Analyze overall posture using key body points
        const nose = keypoints[0];
        const leftShoulder = keypoints[11];
        const rightShoulder = keypoints[12];
        const leftHip = keypoints[23];
        const rightHip = keypoints[24];
        
        if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip) {
            return { score: 0, feedback: 'Insufficient pose data for posture analysis' };
        }
        
        // Check shoulder alignment
        const shoulderAlignment = Math.abs(leftShoulder.y - rightShoulder.y);
        const hipAlignment = Math.abs(leftHip.y - rightHip.y);
        
        // Check spine alignment
        const spineAlignment = Math.abs((leftShoulder.x + rightShoulder.x) / 2 - (leftHip.x + rightHip.x) / 2);
        
        let score = 100;
        let feedback = 'Good posture';
        
        if (shoulderAlignment > 20) {
            score -= 25;
            feedback = 'Shoulders not level - focus on shoulder alignment';
        }
        
        if (hipAlignment > 20) {
            score -= 25;
            feedback = 'Hips not level - check hip alignment';
        }
        
        if (spineAlignment > 30) {
            score -= 20;
            feedback = 'Spine not aligned - maintain straight posture';
        }
        
        return { 
            score: Math.max(0, score), 
            feedback,
            details: {
                shoulderAlignment,
                hipAlignment,
                spineAlignment
            }
        };
    }

    analyzeSymmetry(keypoints) {
        // Analyze left-right symmetry
        const leftShoulder = keypoints[11];
        const rightShoulder = keypoints[12];
        const leftElbow = keypoints[13];
        const rightElbow = keypoints[14];
        const leftHip = keypoints[23];
        const rightHip = keypoints[24];
        const leftKnee = keypoints[25];
        const rightKnee = keypoints[26];
        
        if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
            return { score: 0, feedback: 'Insufficient data for symmetry analysis' };
        }
        
        // Calculate symmetry metrics
        const shoulderSymmetry = Math.abs(leftShoulder.y - rightShoulder.y);
        const hipSymmetry = Math.abs(leftHip.y - rightHip.y);
        const armSymmetry = Math.abs((leftElbow?.y || 0) - (rightElbow?.y || 0));
        const legSymmetry = Math.abs((leftKnee?.y || 0) - (rightKnee?.y || 0));
        
        const totalAsymmetry = shoulderSymmetry + hipSymmetry + armSymmetry + legSymmetry;
        const score = Math.max(0, 100 - (totalAsymmetry / 2));
        
        let feedback = 'Good symmetry';
        if (score < 80) {
            feedback = 'Asymmetry detected - focus on balanced movement';
        } else if (score < 60) {
            feedback = 'Significant asymmetry - consider corrective exercises';
        }
        
        return {
            score,
            feedback,
            details: {
                shoulderSymmetry,
                hipSymmetry,
                armSymmetry,
                legSymmetry
            }
        };
    }

    analyzeStability(keypoints) {
        // Analyze stability based on keypoint movement
        const nose = keypoints[0];
        const leftShoulder = keypoints[11];
        const rightShoulder = keypoints[12];
        
        if (!nose || !leftShoulder || !rightShoulder) {
            return { score: 0, feedback: 'No stability data available' };
        }
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Calculate distance from center
        const noseDistance = Math.sqrt(
            Math.pow(nose.x - centerX, 2) + Math.pow(nose.y - centerY, 2)
        );
        
        const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
        const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;
        const shoulderDistance = Math.sqrt(
            Math.pow(shoulderCenterX - centerX, 2) + Math.pow(shoulderCenterY - centerY, 2)
        );
        
        const totalDistance = (noseDistance + shoulderDistance) / 2;
        const stability = Math.max(0, 100 - (totalDistance / 3));
        
        let feedback = 'Stable position';
        if (stability < 70) {
            feedback = 'Movement detected - focus on stability';
        } else if (stability < 50) {
            feedback = 'Excessive movement - maintain steady position';
        }
        
        return {
            score: stability,
            feedback,
            details: {
                noseDistance,
                shoulderDistance,
                totalDistance
            }
        };
    }

    analyzeRangeOfMotion(keypoints) {
        // Analyze range of motion for arms and legs
        const leftShoulder = keypoints[11];
        const leftElbow = keypoints[13];
        const leftWrist = keypoints[15];
        const rightShoulder = keypoints[12];
        const rightElbow = keypoints[14];
        const rightWrist = keypoints[16];
        
        const leftHip = keypoints[23];
        const leftKnee = keypoints[25];
        const leftAnkle = keypoints[27];
        const rightHip = keypoints[24];
        const rightKnee = keypoints[26];
        const rightAnkle = keypoints[28];
        
        let armROM = 0;
        let legROM = 0;
        
        // Calculate arm range of motion
        if (leftShoulder && leftElbow && leftWrist) {
            const leftArmAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
            armROM += leftArmAngle;
        }
        
        if (rightShoulder && rightElbow && rightWrist) {
            const rightArmAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
            armROM += rightArmAngle;
        }
        
        // Calculate leg range of motion
        if (leftHip && leftKnee && leftAnkle) {
            const leftLegAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
            legROM += leftLegAngle;
        }
        
        if (rightHip && rightKnee && rightAnkle) {
            const rightLegAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
            legROM += rightLegAngle;
        }
        
        const avgROM = (armROM + legROM) / 4;
        const score = Math.min(100, avgROM * 0.5); // Convert angle to score
        
        let feedback = `Average range of motion: ${avgROM.toFixed(1)}°`;
        if (score < 60) {
            feedback += ' - Consider flexibility training';
        } else if (score > 90) {
            feedback += ' - Excellent range of motion';
        }
        
        return {
            score,
            feedback,
            details: {
                armROM: armROM / 2,
                legROM: legROM / 2,
                avgROM
            }
        };
    }

    calculateAngle(p1, p2, p3) {
        const a = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
        const b = Math.sqrt(Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2));
        const c = Math.sqrt(Math.pow(p3.x - p1.x, 2) + Math.pow(p3.y - p1.y, 2));
        
        if (a === 0 || b === 0) return 0;
        
        const angle = Math.acos((a * a + b * b - c * c) / (2 * a * b));
        return (angle * 180) / Math.PI;
    }

    updateInstructions(analysis) {
        const instructionText = document.getElementById('ai-instruction-text');
        if (!instructionText) return;
        
        // Provide real-time feedback based on analysis
        if (analysis.posture.score < 70) {
            instructionText.textContent = analysis.posture.feedback;
        } else if (analysis.symmetry.score < 70) {
            instructionText.textContent = analysis.symmetry.feedback;
        } else if (analysis.stability.score < 70) {
            instructionText.textContent = analysis.stability.feedback;
        } else {
            instructionText.textContent = 'Excellent form! Hold position steady.';
        }
    }

    updateRealTimeFeedback(analysis) {
        // Update real-time metrics display if available
        const formScoreEl = document.getElementById('form-score');
        const stabilityScoreEl = document.getElementById('stability-score');
        const symmetryScoreEl = document.getElementById('symmetry-score');
        
        if (formScoreEl) {
            formScoreEl.textContent = Math.round(analysis.posture.score) + '%';
        }
        
        if (stabilityScoreEl) {
            stabilityScoreEl.textContent = Math.round(analysis.stability.score) + '%';
        }
        
        if (symmetryScoreEl) {
            symmetryScoreEl.textContent = Math.round(analysis.symmetry.score) + '%';
        }
    }

    getAnalysisResults() {
        return this.analysisResults;
    }

    generateStrengthReport() {
        if (!this.analysisResults) {
            return {
                overallScore: 0,
                recommendations: ['No analysis data available'],
                areas: {
                    posture: 0,
                    symmetry: 0,
                    stability: 0,
                    rangeOfMotion: 0
                },
                timestamp: Date.now()
            };
        }
        
        const { posture, symmetry, stability, rangeOfMotion } = this.analysisResults;
        
        const overallScore = Math.round(
            (posture.score + symmetry.score + stability.score + rangeOfMotion.score) / 4
        );
        
        const recommendations = this.generateRecommendations(this.analysisResults);
        
        return {
            overallScore,
            recommendations,
            areas: {
                posture: posture.score,
                symmetry: symmetry.score,
                stability: stability.score,
                rangeOfMotion: rangeOfMotion.score
            },
            details: this.analysisResults,
            timestamp: Date.now()
        };
    }

    generateRecommendations(analysis) {
        const recommendations = [];
        
        if (analysis.posture.score < 80) {
            recommendations.push({
                type: 'posture',
                priority: 'high',
                message: 'Focus on maintaining proper posture during exercises',
                suggestion: 'Practice wall slides and shoulder blade squeezes'
            });
        }
        
        if (analysis.symmetry.score < 80) {
            recommendations.push({
                type: 'symmetry',
                priority: 'medium',
                message: 'Work on improving left-right symmetry in your movements',
                suggestion: 'Include unilateral exercises in your training'
            });
        }
        
        if (analysis.stability.score < 80) {
            recommendations.push({
                type: 'stability',
                priority: 'high',
                message: 'Practice stability exercises to improve balance',
                suggestion: 'Try single-leg stands and stability ball exercises'
            });
        }
        
        if (analysis.rangeOfMotion.score < 80) {
            recommendations.push({
                type: 'flexibility',
                priority: 'medium',
                message: 'Incorporate flexibility training to improve range of motion',
                suggestion: 'Add dynamic stretching and mobility work'
            });
        }
        
        if (recommendations.length === 0) {
            recommendations.push({
                type: 'general',
                priority: 'low',
                message: 'Excellent form! Continue with your current training approach.',
                suggestion: 'Consider progressive overload for continued improvement'
            });
        }
        
        return recommendations;
    }

    captureSnapshot() {
        if (!this.canvas || !this.video) return null;
        
        // Create a snapshot of the current analysis
        const snapshotCanvas = document.createElement('canvas');
        const snapshotCtx = snapshotCanvas.getContext('2d');
        
        snapshotCanvas.width = this.video.videoWidth;
        snapshotCanvas.height = this.video.videoHeight;
        
        // Draw video frame
        snapshotCtx.drawImage(this.video, 0, 0);
        
        // Draw analysis overlay
        snapshotCtx.drawImage(this.canvas, 0, 0);
        
        // Add timestamp and analysis data
        snapshotCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        snapshotCtx.fillRect(10, 10, 300, 100);
        
        snapshotCtx.fillStyle = '#ffffff';
        snapshotCtx.font = '16px Arial';
        snapshotCtx.fillText(`AI Analysis - ${new Date().toLocaleString()}`, 20, 35);
        
        if (this.analysisResults) {
            snapshotCtx.font = '14px Arial';
            snapshotCtx.fillText(`Overall Score: ${this.generateStrengthReport().overallScore}%`, 20, 55);
            snapshotCtx.fillText(`Posture: ${Math.round(this.analysisResults.posture.score)}%`, 20, 75);
            snapshotCtx.fillText(`Stability: ${Math.round(this.analysisResults.stability.score)}%`, 20, 95);
        }
        
        return snapshotCanvas.toDataURL('image/png');
    }

    // Cleanup method
    destroy() {
        this.stopAnalysis();
        this.stopCamera();
        this.isInitialized = false;
        console.log('AI Strength Assistant destroyed');
    }
}

// Audio Assistant for Voice Guidance
class AudioAssistant {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.isEnabled = true;
        this.voice = null;
        this.currentUtterance = null;
        this.volume = 0.8;
        this.rate = 0.9;
        this.pitch = 1.0;
        
        this.init();
    }

    init() {
        this.loadVoices();
        
        // Some browsers load voices asynchronously
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = () => this.loadVoices();
        }
        
        console.log('Audio Assistant initialized');
    }

    loadVoices() {
        const voices = this.synthesis.getVoices();
        
        // Prefer English voices, especially female voices for better user experience
        this.voice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Karen'))
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        
        if (this.voice) {
            console.log('Selected voice:', this.voice.name);
        }
    }

    speak(text, priority = 'normal') {
        if (!this.isEnabled || !this.synthesis || !text) return;
        
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.voice;
        utterance.rate = this.rate;
        utterance.pitch = this.pitch;
        utterance.volume = this.volume;
        
        // Add event listeners
        utterance.onstart = () => {
            console.log('Speaking:', text);
        };
        
        utterance.onend = () => {
            this.currentUtterance = null;
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
        };
        
        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);
    }

    speakInstruction(instruction) {
        this.speak(instruction, 'high');
    }

    speakFeedback(feedback) {
        this.speak(feedback, 'normal');
    }

    speakResults(results) {
        const text = `Analysis complete. Your overall score is ${results.overallScore} percent. ${results.recommendations[0]?.message || 'Great job!'}`;
        this.speak(text, 'normal');
    }

    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    setRate(rate) {
        this.rate = Math.max(0.1, Math.min(10, rate));
    }

    setPitch(pitch) {
        this.pitch = Math.max(0, Math.min(2, pitch));
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
        this.stopSpeaking();
    }

    isSpeaking() {
        return this.synthesis.speaking;
    }
}

// Initialize AI components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make classes globally available
    window.AIStrengthAssistant = AIStrengthAssistant;
    window.AudioAssistant = AudioAssistant;
});
