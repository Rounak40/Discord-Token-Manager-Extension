document.addEventListener("DOMContentLoaded", function () {

  const tokenInput = document.getElementById("tokenInput");
  const addTokenButton = document.getElementById("addToken");
  const tokenList = document.getElementById("tokenList");
  const totalTokensElement = document.getElementById("totalTokens");
  const refreshButton = document.getElementById("refreshButton");



  function refreshUserDetails() {
    chrome.storage.sync.get('tokens', function (result) {
      const existingTokens = result.tokens || [];
      const freshTokens = [];
      existingTokens.forEach(storeInfo => {
        newToken = storeInfo.token;
        getUserInfo(newToken).then(userInfo => {
            if (userInfo.global_name == null) {
              var formattedUsername = `${userInfo.username}#${userInfo.discriminator}`;
            } else {
              var formattedUsername = `${userInfo.username}`;
            }
            var localUserInfo = {
                token:newToken,
                username: formattedUsername,
                avatarURL: `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.webp?size=256`,
              }
            
            if (userInfo.avatar == null) {
              localUserInfo.avatarURL = `https://discord.com/assets/edda5bb474d4135b4296.png`
            }

            freshTokens.push(localUserInfo);
            chrome.storage.sync.set({ 'tokens': freshTokens }, function () {
              console.log('Data stored in tokens:', freshTokens);
            });
          
          }).catch(error => {
              console.error("Error getting user info:", error);
          });
        
        });

  
    })
    
    
  }


  refreshButton.addEventListener("click", refreshUserDetails);



  chrome.storage.sync.get("tokens", function (data) {
    console.log(data);
    if (data.tokens) {
      totalTokensElement.textContent = `Stored Tokens ( ${data.tokens.length} )`;
      data.tokens.forEach(userInfo => {
        addUserToList(userInfo);
        })

    }
  });

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


  function getUserInfo(token) {
    const DISCORD_API_URL = "https://discord.com/api/v10/users/@me";
  
    return fetch(DISCORD_API_URL, {
      headers: {
        Authorization: token,
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .catch(error => {
        console.error("Error fetching user info:", error);
        throw error;
      });
  }

 
  addTokenButton.addEventListener("click", function () {
    const inputTokens = tokenInput.value.trim();
    if (inputTokens) {
      const newTokens = inputTokens.split(",").map(token => token.trim());

      chrome.storage.sync.get('tokens', function (result) {
        const existingTokens = result.tokens || [];
    
        newTokens.forEach(newToken => {

          const isTokenUnique = !existingTokens.some(item => item.token === newToken);
      
          if (isTokenUnique) {


            getUserInfo(newToken).then(userInfo => {
                if (userInfo.global_name == null) {
                  var formattedUsername = `${userInfo.username}#${userInfo.discriminator}`;
                } else {
                  var formattedUsername = `${userInfo.username}`;
                }

                var localUserInfo = {
                  token:newToken,
                  username: formattedUsername,
                  avatarURL: `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.webp?size=256`,
                }

                if (userInfo.avatar == null) {
                  localUserInfo.avatarURL = `https://discord.com/assets/edda5bb474d4135b4296.png`
                }

                existingTokens.push(localUserInfo);

                chrome.storage.sync.set({ 'tokens': existingTokens }, function () {
                  console.log('Data stored in tokens:', existingTokens);
                });

                addUserToList(localUserInfo);

              }).catch(error => {
                console.error("Error getting user info:", error);
              });

            }
          else {
            const duplicateTokenDict = existingTokens.find(item => item.token === newToken);
            alert(`Token already exists: ${duplicateTokenDict.username} || ${duplicateTokenDict.token}`);

          }
  
          
          });
        
        totalTokensElement.textContent = `Stored Tokens ( ${existingTokens.length} )`;
        
        tokenInput.value = "";

        

      });

        
    }
  });

  function addUserToList(user) {

    const listItem = document.createElement("li");
    listItem.classList.add("token-item");

    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("avatar-container");

    const avatarImage = document.createElement("img");
    avatarImage.src = user.avatarURL;
    avatarImage.classList.add("avatar-image");

    avatarDiv.appendChild(avatarImage);

    listItem.appendChild(avatarDiv);

    listItem.appendChild(document.createTextNode(user.username));

    const loginButton = document.createElement("button");
    loginButton.textContent = "Login";
    loginButton.classList.add("login-button");
    loginButton.addEventListener("click", function () {
      executeLogin(user.token);
    });

    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {

      chrome.storage.sync.get('tokens', function (result) {
        const existingTokens = result.tokens || [];
        const indexToRemove = existingTokens.findIndex(item => item.token === user.token);
        if (indexToRemove !== -1) {
          existingTokens.splice(indexToRemove, 1);
          chrome.storage.sync.set({ 'tokens': existingTokens }, function () {
            console.log('Data stored in tokens:', existingTokens);
          });
          listItem.remove();
          totalTokensElement.textContent = `Stored Tokens ( ${existingTokens.length} )`;

        } else {
          console.log('Token not found in the list.');
        }
      });

    });

    listItem.appendChild(loginButton);
    listItem.appendChild(removeButton);
    tokenList.appendChild(listItem);


  }



});
