// config.js
window.onload = function() {
    fetch('localConfig.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('No local config found');
        }
        return response.json();
      })
      .then(config => {
        // Set the settings here
        document.getElementById('apiKey').value = config.apiKey;
        document.getElementById('systemPrompt').value = config.systemPrompt;
      })
      .catch(error => {
        console.log('No local config found');
      });
  };