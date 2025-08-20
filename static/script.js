document.addEventListener("DOMContentLoaded", function () {
  // Elementos
  const toggleBtn = document.getElementById("toggle-dark");
  const validarBtn = document.getElementById("validarBtn");
  const campoTexto = document.getElementById("campo-texto");
  const resultadoArea = document.getElementById("resultadoArea");
  const resultadoText = document.getElementById("resultadoText");
  const copyBtn = document.getElementById("copyBtn");

  // ===== MODO ESCURO (com persistência) =====
  const THEME_KEY = "theme-pref"; // "dark" | "light"
  const applyTheme = (mode) => {
    const isDark = mode === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    if (toggleBtn) toggleBtn.setAttribute("aria-pressed", String(isDark));
    if (toggleBtn) toggleBtn.textContent = isDark ? "Modo Claro" : "Modo Escuro";
  };

  // Carrega preferência salva
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") {
    applyTheme(saved);
  } else {
    // opcional: respeitar preferência do SO
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const next = document.body.classList.contains("dark-mode") ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  // ===== Mostrar resultado =====
  function mostrarResultado(texto) {
    resultadoText.textContent = texto || "";
    resultadoArea.style.display = "block";
    resultadoArea.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ===== Validar (fetch) =====
  if (validarBtn) {
    validarBtn.addEventListener("click", async () => {
      const texto = (campoTexto.value || "").trim();
      if (!texto) {
        alert("Por favor, insira um texto para validar.");
        campoTexto.focus();
        return;
      }

      validarBtn.disabled = true;
      const original = validarBtn.textContent;
      validarBtn.textContent = "Validando...";

      try {
        const resp = await fetch("/validar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto })
        });

        const data = await resp.json();

        if (!resp.ok) {
          mostrarResultado(data.erro || "Erro ao validar o texto.");
        } else {
          mostrarResultado(data.resultado || "(Sem retorno)");
        }
      } catch (err) {
        console.error(err);
        mostrarResultado("Erro de conexão: " + err.message);
      } finally {
        validarBtn.disabled = false;
        validarBtn.textContent = original;
      }
    });
  }

  // ===== Copiar texto =====
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const text = resultadoText.textContent || "";
      if (!text) return;
      try {
        // API moderna, com fallback
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const tmp = document.createElement("textarea");
          tmp.value = text;
          document.body.appendChild(tmp);
          tmp.select();
          document.execCommand("copy");
          document.body.removeChild(tmp);
        }
        copyBtn.textContent = "Copiado!";
        setTimeout(() => (copyBtn.textContent = "Copiar Texto Formatado"), 2000);
      } catch (e) {
        alert("Não foi possível copiar automaticamente. Selecione e copie manualmente.");
      }
    });
  }
});