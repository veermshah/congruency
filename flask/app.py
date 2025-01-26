from flask import Flask, request, jsonify
from openai import OpenAI
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enables CORS for all routes


# Define a route for chatting with OpenAI GPT
@app.route("/chat", methods=["POST"])
def chat_with_openai():
    try:
        # Get user input from the request body (JSON)
        user_message = request.json.get("message", "")

        # Ensure message is provided
        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        client = OpenAI()
        response = client.chat.completions.create(
            model="gpt-4o",
            # store=True,
            messages=[
               {"role": "system", "content": "You are an AI contract generator named Connie. You only help with generating contracts and nothing else. Only return the contract and no other words. Just use plaintext."},
               {"role": "user", "content": user_message}],
          )

        # Extract and return the response from GPT
        gpt_reply = response.choices[0].message.content

        return jsonify(gpt_reply)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Run the app
if __name__ == "__main__":
    app.run(port=5000)
