from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
import random

app = Flask(__name__)
CORS(app)

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Mock database of skills and questions
skills_db = {
    "python": ["What is a list comprehension?", "Explain the difference between a tuple and a list."],
    "javascript": ["What is closure in JavaScript?", "Explain the difference between let and var."],
    "react": ["What is JSX?", "Explain the concept of state in React."],
    "css": ["What is the box model?", "Explain the difference between flexbox and grid."],
    "html": ["What is semantic HTML?", "Explain the purpose of the 'alt' attribute in img tags."],
}

@app.route('/scan_resume', methods=['POST'])
def scan_resume():
    try:
        resume_text = request.json['resume']
        doc = nlp(resume_text)
        
        # Extract skills (this is a simple example, you might want to use a more sophisticated method)
        skills = [token.text.lower() for token in doc if token.pos_ == "NOUN" and token.text.lower() in skills_db]
        
        return jsonify({"skills": list(set(skills))})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/generate_test', methods=['POST'])
def generate_test():
    try:
        skills = request.json['skills']
        test = []
        for skill in skills:
            if skill in skills_db:
                test.extend(random.sample(skills_db[skill], min(len(skills_db[skill]), 2)))
        return jsonify({"test": test})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/evaluate_test', methods=['POST'])
def evaluate_test():
    try:
        answers = request.json['answers']
        # In a real scenario, you'd evaluate the answers here
        # For this example, we'll just return a random score
        score = random.randint(0, 100)
        category = "Expert" if score > 80 else "Intermediate" if score > 50 else "Beginner"
        return jsonify({"score": score, "category": category})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)