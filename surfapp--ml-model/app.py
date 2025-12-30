from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from predict_risk import predict_risk_score, update_all_risk_scores
from analyze_hazard import analyze_hazard_image

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration from environment
FLASK_PORT = int(os.getenv('FLASK_PORT', 5001))
FLASK_HOST = os.getenv('FLASK_HOST', '0.0.0.0')
FLASK_ENV = os.getenv('FLASK_ENV', 'development')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'OK',
        'message': 'ML API is running',
        'environment': FLASK_ENV
    })

@app.route('/predict-risk/<spot_name>', methods=['GET'])
def predict_risk(spot_name):
    """Predict risk score for a specific surf spot"""
    try:
        prediction = predict_risk_score(spot_name)
        return jsonify({
            'success': True,
            'data': prediction
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/update-risk-score', methods=['POST'])
def update_risk():
    """Update risk score for a surf spot after new hazard report"""
    try:
        data = request.json
        spot_id = data.get('surf_spot_id')
        
        # Update all scores
        update_all_risk_scores()
        
        return jsonify({
            'success': True,
            'message': 'Risk scores updated'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/analyze-hazard', methods=['POST'])
def analyze_hazard():
    """Analyze uploaded hazard images"""
    try:
        if 'images' not in request.files:
            return jsonify({
                'success': False,
                'message': 'No images provided'
            }), 400
        
        images = request.files.getlist('images')
        hazard_type = request.form.get('hazard_type', '')
        
        results = []
        for img in images:
            # Save temporarily
            temp_path = f'/tmp/{img.filename}'
            img.save(temp_path)
            
            # Analyze
            analysis = analyze_hazard_image(temp_path, hazard_type)
            results.append(analysis)
            
            # Clean up
            os.remove(temp_path)
        
        # Combine results
        combined_hazards = []
        total_confidence = 0
        all_suggestions = []
        
        for result in results:
            combined_hazards.extend(result['detectedHazards'])
            total_confidence += result['confidenceScore']
            if result['aiSuggestions']:
                all_suggestions.append(result['aiSuggestions'])
        
        return jsonify({
            'success': True,
            'detectedHazards': list(set(combined_hazards)),
            'confidenceScore': total_confidence / len(results),
            'aiSuggestions': '; '.join(set(all_suggestions))
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    print('\n🤖 ================================')
    print('   ML Service Starting')
    print('   ================================\n')
    print(f'✅ Environment: {FLASK_ENV}')
    print(f'🌍 Host: {FLASK_HOST}')
    print(f'🔌 Port: {FLASK_PORT}\n')
    print(f'📡 Access: http://{FLASK_HOST}:{FLASK_PORT}')
    print('================================\n')
    
    app.run(
        host=FLASK_HOST,
        port=FLASK_PORT,
        debug=(FLASK_ENV == 'development')
    )