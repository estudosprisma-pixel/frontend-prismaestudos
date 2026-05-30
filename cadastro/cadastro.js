const STORAGE_KEY = "prisma-estudos-state-v1";
const LOCAL_SESSION_KEY = "prisma-estudos-local-session";

const form = document.querySelector("#signup-form");
const message = document.querySelector("#signup-message");

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.querySelector("#signup-name").value.trim();
  const email = document.querySelector("#signup-email").value.trim().toLowerCase();
  const password = document.querySelector("#signup-password").value;

  if (!name || !email || password.length < 6) {
    message.textContent = "Preencha nome, e-mail e uma senha com pelo menos 6 caracteres.";
    message.classList.add("is-error");
    return;
  }

  const userId = `u-${crypto.randomUUID()}`;
  const state = {
    currentUserId: userId,
    users: [
      {
        id: userId,
        name,
        email,
        role: "student",
        status: "active",
        accessExpiresAt: null
      }
    ],
    profiles: {
      [userId]: {
        studentName: name,
        objective: "",
        context: "",
        dailyMinutes: 60,
        days: ["Seg", "Ter", "Qua", "Qui", "Sex"],
        preferredTime: "19:00",
        interests: [],
        contests: [],
        activeContestId: "",
        level: "iniciante",
        reviewPreference: "semanal",
        topicsPerDay: 2,
        mixSubjects: true,
        configured: false,
        onboardingCompleted: false
      }
    },
    userSubjects: {
      [userId]: []
    },
    userTopics: {
      [userId]: {}
    },
    route: "profile"
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(LOCAL_SESSION_KEY, "true");
  message.classList.remove("is-error");
  message.textContent = "Cadastro concluído. Redirecionando para o app...";
  window.location.assign("/app/");
});
