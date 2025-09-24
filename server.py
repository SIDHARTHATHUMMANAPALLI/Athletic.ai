#!/usr/bin/env python3
"""
Simple HTTP Server for AthleteAI Platform
Serves the static files and provides basic API endpoints
"""

import http.server
import socketserver
import json
import urllib.parse
import os
import sys
from datetime import datetime
import mimetypes

class AthleteAIHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler for AthleteAI platform"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)
    
    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path.startswith('/api/'):
            self.handle_api_get()
        else:
            super().do_GET()
    
    def do_POST(self):
        """Handle POST requests"""
        if self.path.startswith('/api/'):
            self.handle_api_post()
        else:
            self.send_error(404, "Not Found")
    
    def handle_api_get(self):
        """Handle API GET requests"""
        try:
            if self.path == '/api/health':
                self.send_json_response({'status': 'healthy', 'timestamp': datetime.now().isoformat()})
            elif self.path == '/api/config':
                config = {
                    'appName': 'AthleteAI',
                    'version': '1.0.0',
                    'features': {
                        'aiTesting': True,
                        'faceRecognition': True,
                        'offlineMode': True,
                        'pwa': True
                    }
                }
                self.send_json_response(config)
            else:
                self.send_error(404, "API endpoint not found")
        except Exception as e:
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def handle_api_post(self):
        """Handle API POST requests"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            if self.path == '/api/auth/login':
                response = self.handle_login(data)
            elif self.path == '/api/auth/register':
                response = self.handle_register(data)
            elif self.path == '/api/training/sessions':
                response = self.handle_training_session(data)
            elif self.path == '/api/ai/analysis':
                response = self.handle_ai_analysis(data)
            else:
                self.send_error(404, "API endpoint not found")
                return
            
            self.send_json_response(response)
            
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
        except Exception as e:
            self.send_error(500, f"Internal server error: {str(e)}")
    
    def handle_login(self, data):
        """Handle login request"""
        email = data.get('email', '')
        password = data.get('password', '')
        
        # Demo authentication
        demo_users = {
            'athlete@demo.com': {'password': 'password123', 'role': 'athlete', 'name': 'Demo Athlete'},
            'coach@demo.com': {'password': 'password123', 'role': 'coach', 'name': 'Demo Coach'},
            'admin@demo.com': {'password': 'password123', 'role': 'admin', 'name': 'Demo Admin'}
        }
        
        if email in demo_users and demo_users[email]['password'] == password:
            return {
                'success': True,
                'user': {
                    'id': f"user_{email.split('@')[0]}",
                    'email': email,
                    'name': demo_users[email]['name'],
                    'role': demo_users[email]['role']
                },
                'token': f"demo_token_{datetime.now().timestamp()}"
            }
        else:
            return {'success': False, 'error': 'Invalid credentials'}
    
    def handle_register(self, data):
        """Handle registration request"""
        name = data.get('name', '')
        email = data.get('email', '')
        password = data.get('password', '')
        role = data.get('role', 'athlete')
        
        if not name or not email or not password:
            return {'success': False, 'error': 'Missing required fields'}
        
        # In a real app, you would save to database
        return {
            'success': True,
            'user': {
                'id': f"user_{datetime.now().timestamp()}",
                'name': name,
                'email': email,
                'role': role
            }
        }
    
    def handle_training_session(self, data):
        """Handle training session save"""
        # In a real app, you would save to database
        return {
            'success': True,
            'sessionId': f"session_{datetime.now().timestamp()}",
            'message': 'Training session saved successfully'
        }
    
    def handle_ai_analysis(self, data):
        """Handle AI analysis results"""
        # In a real app, you would process and store analysis results
        return {
            'success': True,
            'analysisId': f"analysis_{datetime.now().timestamp()}",
            'message': 'AI analysis saved successfully'
        }
    
    def send_json_response(self, data):
        """Send JSON response"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def log_message(self, format, *args):
        """Custom log format"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{timestamp}] {format % args}")

def main():
    """Main server function"""
    PORT = 8000
    
    # Check if port is available
    try:
        with socketserver.TCPServer(("", PORT), AthleteAIHandler) as httpd:
            print(f"""
╔══════════════════════════════════════════════════════════════╗
║                    AthleteAI Platform                       ║
║                                                              ║
║  🚀 Server running at: http://localhost:{PORT}                ║
║  📱 PWA ready for installation                               ║
║  🤖 AI features enabled                                      ║
║  📷 Camera access required for full functionality           ║
║                                                              ║
║  Demo Credentials:                                           ║
║  • Athlete: athlete@demo.com / password123                  ║
║  • Coach:   coach@demo.com / password123                    ║
║  • Admin:   admin@demo.com / password123                    ║
║                                                              ║
║  Press Ctrl+C to stop the server                            ║
╚══════════════════════════════════════════════════════════════╝
            """)
            
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use. Please try a different port.")
            print("💡 You can specify a different port by modifying the PORT variable in server.py")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)

if __name__ == "__main__":
    main()
