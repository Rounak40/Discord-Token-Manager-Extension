document.addEventListener("DOMContentLoaded", function () {
  const tokenInput = document.getElementById("tokenInput");
  const addTokenButton = document.getElementById("addToken");
  const tokenList = document.getElementById("tokenList");
  const totalTokensElement = document.getElementById("totalTokens"); 

  chrome.storage.sync.get("tokens", function (data) {
    if (data.tokens) {
      totalTokensElement.textContent = `Stored Tokens ( ${data.tokens.length} )`;
      data.tokens.forEach(token => {
        const decodedUserID = atob(token.split('.')[0]);
        getUserInfo(decodedUserID)
          .then(userInfo => {
            const formattedUsername = `${userInfo.global_name} (${userInfo.tag})`;
            addTokenToList(token, formattedUsername);
          })
          .catch(error => {
            console.error("Error getting user info:", error);
            addTokenToList(token, "Unknown User");
          });
      });
    }
  });

  addTokenButton.addEventListener("click", function () {
    const inputTokens = tokenInput.value.trim();
    if (inputTokens) {
      const newTokens = inputTokens.split(",").map(token => token.trim());
      chrome.storage.sync.get("tokens", function (data) {
        const existingTokens = data.tokens || [];
        const tokensToAdd = newTokens.filter(newToken => !existingTokens.includes(newToken));

        if (tokensToAdd.length > 0) {
          const updatedTokens = [...existingTokens, ...tokensToAdd];
          chrome.storage.sync.set({ tokens: updatedTokens }, function () {
            tokensToAdd.forEach(newToken => {
              const decodedUserID = atob(newToken.split('.')[0]);
              getUserInfo(decodedUserID)
                .then(userInfo => {
                  const formattedUsername = `${userInfo.global_name} (${userInfo.tag})`;
                  addTokenToList(newToken, formattedUsername);
                })
                .catch(error => {
                  console.error("Error getting user info:", error);
                  addTokenToList(newToken, "Unknown User");
                });
            });
            tokenInput.value = "";
          });
        } else {
          alert("All tokens are already added!");
        }
      });
    }
  });

  function addTokenToList(token, formattedUsername) {
    const listItem = document.createElement("li");
    listItem.classList.add("token-item");

    listItem.textContent = formattedUsername;

    const loginButton = document.createElement("button");
    loginButton.textContent = "Login";
    loginButton.addEventListener("click", function () {
      executeLogin(token);
    });
    

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
      const decodedUserID = atob(token.split('.')[0]);
      chrome.storage.sync.get("tokens", function (data) {
        const tokens = data.tokens || [];
        const index = tokens.findIndex(existingToken => {
          const existingDecodedUserID = atob(existingToken.split('.')[0]);
          return existingDecodedUserID === decodedUserID;
        });
        if (index > -1) {
          tokens.splice(index, 1);
          chrome.storage.sync.set({ tokens: tokens }, function () {
            listItem.remove();
          });
        }
      });
    });

    listItem.appendChild(loginButton);
    listItem.appendChild(removeButton);
    tokenList.appendChild(listItem);
  }

  function getUserInfo(userID) {
    const DISCORD_LOOKUP_API_URL = `https://discordlookup.mesavirep.xyz/v1/user/${userID}`;
    return fetch(DISCORD_LOOKUP_API_URL)
      .then(response => response.json())
      .catch(error => {
        console.error("Error fetching user info:", error);
        throw error;
      });
  }

  function executeLogin(token) {
    chrome.tabs.executeScript(null, {
      code: "function login() { " +
      "setInterval(() => { " +
      "document.body.appendChild(document.createElement(`iframe`)).contentWindow.localStorage.token = `\"" + token + "\"`; " +
      "}, 50); " +
      "setTimeout(() => { " +
      "location.reload(); " +
      "}, 2500); " +
      "}; login();"
    });
  }
});
