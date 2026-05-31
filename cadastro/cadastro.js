const API_BASE = window.PRISMA_API_BASE || (
  window.location.protocol === "file:" || ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "http://localhost:3001/api"
    : "https://backend-prisma-estudos-production.up.railway.app/api"
);

const PLAN_CONFIG = {
  mensal: {
    label: "Mensal",
    days: 30,
    description: "Seu acesso sera liberado por 30 dias a partir da ativacao."
  },
  trimestral: {
    label: "Trimestral",
    days: 90,
    description: "Seu acesso sera liberado por 90 dias a partir da ativacao."
  },
  anual: {
    label: "Anual",
    days: 365,
    description: "Seu acesso sera liberado por 365 dias a partir da ativacao."
  }
};

const params = new URLSearchParams(window.location.search);
const token = String(params.get("token") || "").trim();

const form = document.querySelector("#signup-form");
const submitButton = document.querySelector("#signup-submit");
const message = document.querySelector("#signup-message");
const help = document.querySelector("#signup-help");
const stateCard = document.querySelector("#signup-state");
const planName = document.querySelector("#signup-plan-name");
const planDescription = document.querySelector("#signup-plan-description");
const nameInput = document.querySelector("#signup-name");
const emailInput = document.querySelector("#signup-email");
const passwordInput = document.querySelector("#signup-password");

let activePlan = null;
let activeEmail = "";

disableForm();

if (!token) {
  setBlockedState(
    "Cadastro disponivel apenas apos a confirmacao da compra.",
    "Quando seu pagamento for aprovado, voce recebera um link unico para ativar sua conta."
  );
} else {
  validateToken();
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!token || !activePlan) {
    setMessage("Link invalido, expirado ou ja utilizado.", true);
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Criando acesso...";
  setMessage("Finalizando seu cadastro...", false);

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        token,
        name: nameInput.value.trim(),
        email: emailInput.value.trim().toLowerCase(),
        password: passwordInput.value
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Nao foi possivel concluir o cadastro agora.");
    }

    localStorage.setItem("prisma-estudos-state-v1", JSON.stringify(data.state));
    localStorage.removeItem("prisma-estudos-local-session");
    setState("ready", "Conta criada com sucesso.", "Redirecionando voce para o app do Prisma Estudos.");
    setMessage("Cadastro concluido. Redirecionando para o app...", false);
    window.setTimeout(() => {
      window.location.assign("/app/");
    }, 500);
  } catch (error) {
    submitButton.disabled = false;
    submitButton.textContent = "Finalizar cadastro";
    setMessage(error.message || "Nao foi possivel concluir o cadastro agora.", true);
  }
});

async function validateToken() {
  setState("loading", "Validando seu link...", "Estamos conferindo o token de acesso liberado pela compra.");
  setMessage("", false);

  try {
    const response = await fetch(`${API_BASE}/payment-tokens/validate?token=${encodeURIComponent(token)}`, {
      credentials: "include"
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.valid) {
      setBlockedState(
        "Link invalido, expirado ou ja utilizado.",
        "Confira se voce abriu o link mais recente enviado apos a confirmacao da compra."
      );
      return;
    }

    activePlan = PLAN_CONFIG[data.plan] ? data.plan : "mensal";
    activeEmail = String(data.email || "").trim().toLowerCase();

    planName.textContent = PLAN_CONFIG[activePlan].label;
    planDescription.textContent = PLAN_CONFIG[activePlan].description;
    if (activeEmail) {
      emailInput.value = activeEmail;
      emailInput.readOnly = true;
    } else {
      emailInput.readOnly = false;
    }

    setState("ready", "Link confirmado.", `Plano ${PLAN_CONFIG[activePlan].label} pronto para ativacao.`);
    help.textContent = activeEmail
      ? "O e-mail de acesso veio do token da compra e ja foi preenchido para voce."
      : "Preencha o e-mail usado na compra para finalizar o cadastro.";
    enableForm();
  } catch (_error) {
    setBlockedState(
      "Nao foi possivel validar seu link agora.",
      "Tente novamente em instantes. Se o problema continuar, acione o suporte do Prisma Estudos."
    );
  }
}

function disableForm() {
  [nameInput, emailInput, passwordInput].forEach((input) => {
    input.disabled = true;
  });
  submitButton.disabled = true;
}

function enableForm() {
  [nameInput, emailInput, passwordInput].forEach((input) => {
    input.disabled = false;
  });
  if (activeEmail) emailInput.readOnly = true;
  submitButton.disabled = false;
  submitButton.textContent = "Finalizar cadastro";
}

function setBlockedState(title, detail) {
  activePlan = null;
  disableForm();
  planName.textContent = "Aguardando link valido";
  planDescription.textContent = "Seu plano sera mostrado aqui quando o token for confirmado.";
  help.textContent = detail;
  setState("error", title, detail);
  setMessage(title, true);
}

function setState(state, title, detail) {
  stateCard.dataset.state = state;
  stateCard.innerHTML = `
    <span>Status do acesso</span>
    <strong>${escapeHtml(title)}</strong>
    <small>${escapeHtml(detail)}</small>
  `;
}

function setMessage(text, isError) {
  message.textContent = text;
  message.classList.toggle("is-error", Boolean(isError));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}
