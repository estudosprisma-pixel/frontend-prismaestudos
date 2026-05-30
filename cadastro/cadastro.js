const API_BASE = window.PRISMA_API_BASE || (
  window.location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:3001/api"
    : "https://backend-prisma-estudos-production.up.railway.app/api"
);

const PLAN_CONFIG = {
  mensal: {
    label: "Mensal",
    days: 30,
    description: "Seu acesso sera liberado por 30 dias a partir de hoje."
  },
  semestral: {
    label: "Semestral",
    days: 180,
    description: "Seu acesso sera liberado por 180 dias a partir de hoje."
  },
  anual: {
    label: "Anual",
    days: 365,
    description: "Seu acesso sera liberado por 365 dias a partir de hoje."
  }
};

const params = new URLSearchParams(window.location.search);
const plan = PLAN_CONFIG[params.get("plano")] ? params.get("plano") : "mensal";

const form = document.querySelector("#signup-form");
const message = document.querySelector("#signup-message");
const button = form?.querySelector('button[type="submit"]');
const planName = document.querySelector("#signup-plan-name");
const planDescription = document.querySelector("#signup-plan-description");

if (planName) planName.textContent = PLAN_CONFIG[plan].label;
if (planDescription) planDescription.textContent = PLAN_CONFIG[plan].description;

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.querySelector("#signup-name").value.trim();
  const email = document.querySelector("#signup-email").value.trim().toLowerCase();
  const password = document.querySelector("#signup-password").value;

  if (!name || !email || password.length < 6) {
    setMessage("Preencha nome, e-mail e uma senha com pelo menos 6 caracteres.", true);
    return;
  }

  button.disabled = true;
  button.textContent = "Criando acesso...";
  setMessage(`Ativando plano ${PLAN_CONFIG[plan].label}...`, false);

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password, plan })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Nao foi possivel concluir o cadastro agora.");
    }

    localStorage.setItem("prisma-estudos-state-v1", JSON.stringify(data.state));
    localStorage.removeItem("prisma-estudos-local-session");
    setMessage("Cadastro concluido. Redirecionando para o app...", false);
    window.location.assign("/app/");
  } catch (error) {
    button.disabled = false;
    button.textContent = "Finalizar cadastro";
    setMessage(error.message || "Nao foi possivel concluir o cadastro agora.", true);
  }
});

function setMessage(text, isError) {
  message.textContent = text;
  message.classList.toggle("is-error", Boolean(isError));
}
