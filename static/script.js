// static/script.js
document.addEventListener("DOMContentLoaded", function () {
  // Elementos
  const toggleBtn = document.getElementById("toggle-dark");
  const validarBtn = document.getElementById("validarBtn");
  const campoTexto = document.getElementById("campo-texto");
  const resultadoArea = document.getElementById("resultadoArea");
  const resultadoText = document.getElementById("resultadoText");
  const copyBtn = document.getElementById("copyBtn");

  // Toggle tema
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });
  }

  // Função para mostrar resultado
  function mostrarResultado(texto) {
    resultadoText.textContent = texto;
    resultadoArea.style.display = "block";
  }

  // Botão validar
  if (validarBtn) {
    validarBtn.addEventListener("click", async () => {
      const texto = (campoTexto.value || "").trim();
      if (!texto) {
        alert("Por favor, insira um texto para validar.");
        return;
      }

      validarBtn.disabled = true;
      validarBtn.textContent = "Validando...";

      try {
        const resp = await fetch("/validar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: texto })
        });

        const data = await resp.json();

        if (!resp.ok) {
          // mostra mensagem de erro vinda do backend
          mostrarResultado(data.erro || "Erro desconhecido");
        } else {
          mostrarResultado(data.resultado || "");
        }
      } catch (err) {
        mostrarResultado("Erro de conexão: " + err.message);
        console.error(err);
      } finally {
        validarBtn.disabled = false;
        validarBtn.textContent = "Validar";
      }
    });
  }

  // Botão copiar
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const text = resultadoText.textContent;
      if (!text) return;

      // criar textarea temporária para copiar
      const tmp = document.createElement("textarea");
      tmp.value = text;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);

      copyBtn.textContent = "Copiado!";
      setTimeout(() => (copyBtn.textContent = "Copiar Texto Formatado"), 2000);
    });
  }
});