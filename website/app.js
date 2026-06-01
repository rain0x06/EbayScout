const clientId = document.querySelector("#clientId");
const inviteLink = document.querySelector("#inviteLink");
const inviteHint = document.querySelector("#inviteHint");
const discordPermissions = "2048";

function updateInviteLink() {
  const id = clientId.value.trim();
  const isValid = /^\d{17,22}$/.test(id);

  if (!isValid) {
    inviteLink.href = "#";
    inviteLink.classList.add("disabled");
    inviteLink.setAttribute("aria-disabled", "true");
    inviteHint.textContent = "";
    return;
  }

  const params = new URLSearchParams({
    client_id: id,
    permissions: discordPermissions,
    integration_type: "0",
  });
  params.set("scope", "bot applications.commands");
  inviteLink.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
  inviteLink.classList.remove("disabled");
  inviteLink.removeAttribute("aria-disabled");
  inviteHint.textContent = "Invite link generated locally.";
}

clientId.addEventListener("input", updateInviteLink);
updateInviteLink();
