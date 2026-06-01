const defaultQueries = ["vintage camera auction", "medium format camera", "film lens lot"];
const queryForm = document.querySelector("#queryForm");
const queryInput = document.querySelector("#queryInput");
const queryList = document.querySelector("#queryList");
const buyingOption = document.querySelector("#buyingOption");
const pollSeconds = document.querySelector("#pollSeconds");
const downloadConfig = document.querySelector("#downloadConfig");
const clientId = document.querySelector("#clientId");
const inviteLink = document.querySelector("#inviteLink");
const inviteHint = document.querySelector("#inviteHint");
const previewQuery = document.querySelector("#previewQuery");
const previewBuying = document.querySelector("#previewBuying");
const discordPermissions = "2048";

let queries = loadQueries();

function loadQueries() {
  try {
    const stored = JSON.parse(localStorage.getItem("listingAlertQueries") || "[]");
    if (Array.isArray(stored) && stored.every((value) => typeof value === "string")) {
      return stored.slice(0, 24);
    }
  } catch {
    // Fall back to defaults if localStorage has invalid data.
  }
  return [...defaultQueries];
}

function saveQueries() {
  localStorage.setItem("listingAlertQueries", JSON.stringify(queries));
}

function renderQueries() {
  queryList.textContent = "";
  queries.forEach((query, index) => {
    const chip = document.createElement("div");
    chip.className = "chip";

    const text = document.createElement("span");
    text.textContent = query;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove ${query}`);
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      queries.splice(index, 1);
      saveQueries();
      renderQueries();
      updatePreview();
    });

    chip.append(text, remove);
    queryList.append(chip);
  });
}

function normalizeQuery(value) {
  return value.trim().replace(/\s+/g, " ").slice(0, 80);
}

function updatePreview() {
  previewQuery.textContent = queries[0] || "user configured search";
  previewBuying.textContent = buyingOption.value;
}

function buildConfig() {
  return {
    scanner: {
      poll_seconds: Number(pollSeconds.value),
      buying_options: [buyingOption.value],
      queries,
      data_handling: {
        stores_ebay_member_account_records: false,
        stores_seller_profiles: false,
        stores_buyer_data: false,
        stores_order_records: false,
        stores_discord_credentials_on_public_site: false,
      },
    },
    discord_setup: {
      public_site_collects_tokens: false,
      configure_bot_token_on_server_only: true,
      generated_invite_url: inviteLink.classList.contains("disabled") ? "" : inviteLink.href,
    },
  };
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(buildConfig(), null, 2) + "\n"], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ebay-scout.sample-config.json";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function updateInviteLink() {
  const id = clientId.value.trim();
  const isValid = /^\d{17,22}$/.test(id);

  if (!isValid) {
    inviteLink.href = "#";
    inviteLink.classList.add("disabled");
    inviteLink.setAttribute("aria-disabled", "true");
    inviteHint.textContent = "Paste the numeric Application ID from Discord Developer Portal > General Information.";
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
  inviteHint.textContent = "Invite link generated locally. No bot token or secret is sent to this site.";
}

queryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = normalizeQuery(queryInput.value);
  if (!query || queries.includes(query) || queries.length >= 24) {
    return;
  }
  queries.unshift(query);
  saveQueries();
  renderQueries();
  updatePreview();
  queryInput.value = "";
});

buyingOption.addEventListener("change", updatePreview);
downloadConfig.addEventListener("click", downloadJson);
clientId.addEventListener("input", updateInviteLink);

renderQueries();
updatePreview();
updateInviteLink();
