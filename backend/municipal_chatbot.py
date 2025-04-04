from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import os
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Groq client with better error handling
client = None
try:
    api_key = os.getenv("GROQ_API_KEY")
    if api_key:
        client = Groq(api_key=api_key)
        # Test connection immediately
        test_response = client.chat.completions.create(
            messages=[{"role": "user", "content": "Test connection"}],
            model="llama3-70b-8192",
            max_tokens=1
        )
        print("Groq client initialized successfully")
    else:
        print("GROQ_API_KEY not found in environment variables")
except Exception as e:
    print(f"Failed to initialize Groq client: {str(e)}")
    client = None

MUNICIPAL_GUIDELINES = """You are an official municipal chatbot assistant. Your responses must:
1. Only address municipal issues (water, roads, waste, taxes, permits)
2. Provide step-by-step complaint filing instructions
3. Reference official municipal policies
4. For non-municipal queries, respond: "This query is not within municipal jurisdiction."
5. Always respond in valid JSON format with these fields:
   - response: string
   - is_municipal: boolean
   - next_steps: array of strings
   - contact: string"""

@app.route('/municipal-chat', methods=['POST'])
def municipal_chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data or not isinstance(data['message'], str):
            return jsonify({
                "response": "Invalid request format",
                "is_municipal": False,
                "next_steps": [],
                "contact": ""
            }), 400

        if not client:
            return jsonify({
                "response": "Municipal chatbot services are currently unavailable. Please call 1800-123-4567",
                "is_municipal": False,
                "next_steps": ["Call the municipal office directly"],
                "contact": "Municipal Office: 1800-123-4567"
            })

        prompt = f"""{MUNICIPAL_GUIDELINES}
        
        Current user query: {data['message']}
        
        Generate response in the specified JSON format:"""
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-70b-8192",
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=500
        )
        
        # Validate the response structure
        response = json.loads(chat_completion.choices[0].message.content)
        if not all(key in response for key in ['response', 'is_municipal', 'next_steps', 'contact']):
            raise ValueError("Invalid response format from LLM")
            
        return jsonify(response)
        
    except json.JSONDecodeError:
        return jsonify({
            "response": "We're having trouble processing your request",
            "is_municipal": False,
            "next_steps": ["Try again later or call the municipal office"],
            "contact": "1800-123-4567"
        }), 500
    except Exception as e:
        print(f"Error in municipal_chat: {str(e)}")
        return jsonify({
            "response": "Technical difficulties. Please contact the municipal office directly.",
            "is_municipal": False,
            "next_steps": ["Visit the municipal office in person"],
            "contact": "Main Office: 123 Municipal St, Open 9AM-5PM"
        }), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True, host='0.0.0.0')