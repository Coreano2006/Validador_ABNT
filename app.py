from flask import Flask, request, render_template, jsonify
import cohere
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# Sua chave de API da Cohere
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if not COHERE_API_KEY:
    raise RuntimeError("COHERE_API_KEY nâo encontrada. Criar um arquivo .env com COHERE_API_KEY=seu_token_aqui")

# Inicializa o cliente Cohere
co = cohere.Client(COHERE_API_KEY)

@app.route("/validar", methods=["POST"])
def validar_texto():
    try:
        # Aceita JSON ou form-data
        data_json = request.get_json(silent=True)
        if data_json and "texto" in data_json:
            texto = data_json.get("texto", "")
        else:
            texto = request.form.get("texto", "")

        texto = (texto or "").strip()
        if not texto:
            return jsonify({"erro": "Nenhum texto fornecido."}), 400
        prompt = f""" Valide o seguinte texto segundo as normas ABNT, corrija os erros e retorne:
        1. O texto corrigido (sem tags HTML, so texto simples)
        2. Algunhas observaçoes sobre os erros encontrados
        
        Texto:
        {texto}
        
        Responda apenas com texto corrigido e as observaçoes, separados claramente.
        """

        # Chamada à Cohere
        resposta = co.generate (
        model="command-xlarge",
            prompt=prompt,
            max_tokens=450,
            temperature=0.2
        )

        resultado = resposta.generations[0].text.strip()
        return jsonify({"resultado": resultado})

    except Exception as e:
        # Em produção não exponha a exceção inteira para o usuário
        return jsonify({"erro": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)