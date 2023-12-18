chrome.storage.sync.get("tokens", function(data) {
    const tokens = data.tokens || [];
  
    if (tokens.length > 0) {
      const tokenIndex = 0; 
  
      if (tokenIndex < tokens.length) {
        const token = tokens[tokenIndex];
        const tokenInput = document.querySelector("input[name='token']");
        const loginButton = document.querySelector("button[type='submit']");
  
        if (tokenInput && loginButton) {
          tokenInput.value = token;
          loginButton.click();
        }
      }
    }
  });
  