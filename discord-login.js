const clientId = "1374928268901220482";
const redirectUri = "https://cyanstudiosdev.github.io/staff.html";

// Builds Discord OAuth2 URL
function loginWithDiscord() {
  const authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=identify`;
  window.location.href = authUrl;
}

// Get access token from URL hash
function getTokenFromHash() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return params.get("access_token");
}

// Fetch Discord user from token
async function fetchDiscordUser(token) {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

// Render Discord user in top right
function showUser(user) {
  const userArea = document.getElementById("userArea");
  if (!userArea) return;

  userArea.innerHTML = `
    <img class="user-avatar" src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" alt="avatar">
    <span class="username">${user.username}#${user.discriminator}</span>
    <button class="logout-button" onclick="logout()">Log out</button>
  `;
}

// Clears session and reloads
function logout() {
  localStorage.removeItem("discordUser");
  location.reload();
}

// Startup logic (called on page load)
async function runDiscordLoginSystem() {
  const token = getTokenFromHash();
  if (token) {
    try {
      const user = await fetchDiscordUser(token);
      localStorage.setItem("discordUser", JSON.stringify(user));
      showUser(user);
      history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error("Login failed", err);
      alert("Discord login failed.");
    }
  } else {
    const user = localStorage.getItem("discordUser");
    if (user) {
      showUser(JSON.parse(user));
    } else {
      const userArea = document.getElementById("userArea");
      if (userArea) {
        userArea.innerHTML = `<button class="login-button" onclick="loginWithDiscord()">Login with Discord</button>`;
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", runDiscordLoginSystem);
