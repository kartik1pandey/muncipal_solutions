from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import os
import json
from typing import List, Dict

app = Flask(__name__)
CORS(app)

# Initialize Groq client with current recommended model
MODEL_NAME = "llama3-70b-8192"  # Updated model name

try:
    client = Groq(api_key=os.getenv("GROQ_API_KEY")) if os.getenv("GROQ_API_KEY") else None
except:
    client = None

class CommentStorage:
    def __init__(self):
        self.comments: List[str] = []
        self.groups: List[Dict] = []
    
    def add_comment(self, text: str) -> None:
        self.comments.append(text)
    
    async def group_with_llm(self) -> bool:
        """Group comments using LLM only"""
        if not client or not self.comments:
            return False
            
        try:
            prompt = f"""
            Analyze these comments and group similar ones together. For each group:
            1. Create a concise summary (1 sentence)
            2. List all comments in the group
            
            Comments to analyze:
            {self.comments}
            
            Return JSON format with this structure:
            {{
                "groups": [
                    {{
                        "summary": "summary text",
                        "comments": ["comment1", "comment2"]
                    }}
                ]
            }}
            """
            
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=MODEL_NAME,  # Using current recommended model
                response_format={"type": "json_object"},
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content)
            self.groups = result.get("groups", [])
            return True
            
        except Exception as e:
            print(f"LLM Error: {e}")
            return False

storage = CommentStorage()

@app.route('/comment', methods=['POST'])
async def add_comment():
    data = request.get_json()
    if not data or 'text' not in data or not data['text'].strip():
        return jsonify({"error": "Comment text is required"}), 400
    
    storage.add_comment(data['text'])
    success = await storage.group_with_llm()
    
    if not success:
        return jsonify({"error": "Failed to process comments. Please check your API key and connection."}), 500
    
    return jsonify({
        "message": "Comment added and processed",
        "groups": storage.groups
    })

@app.route('/summaries', methods=['GET'])
def get_summaries():
    return jsonify({
        "groups": storage.groups if storage.groups else [],  # Ensure array
        "total_comments": len(storage.comments)
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)