document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('loginView');
  const clipperView = document.getElementById('clipperView');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const loginBtn = document.getElementById('loginBtn');
  const loggedInUser = document.getElementById('loggedInUser');
  const logoutLink = document.getElementById('logoutLink');
  
  const titleInput = document.getElementById('titleInput');
  const contentInput = document.getElementById('contentInput');
  const saveBtn = document.getElementById('saveBtn');
  const statusMsg = document.getElementById('statusMessage');

  // Server Settings UI Elements
  const toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
  const settingsPanel = document.getElementById('settingsPanel');
  const serverUrlInput = document.getElementById('serverUrlInput');
  const activeServerBadge = document.getElementById('activeServerBadge');
  const saveServerUrlBtn = document.getElementById('saveServerUrlBtn');
  const presetProdBtn = document.getElementById('presetProdBtn');
  const presetLocalBtn = document.getElementById('presetLocalBtn');

  const DEFAULT_PROD_URL = 'https://lifeos-backend-qxsy.onrender.com';
  const DEFAULT_LOCAL_URL = 'http://localhost:8080';

  // Helper to get normalized server URL (strip trailing slashes)
  function getServerUrl() {
    let url = localStorage.getItem('lifeos_server_url') || DEFAULT_PROD_URL;
    return url.replace(/\/+$/, '');
  }

  // Update server URL UI display
  function updateServerBadge() {
    const currentUrl = getServerUrl();
    activeServerBadge.textContent = `Server: ${currentUrl}`;
    serverUrlInput.value = currentUrl;
  }

  // Toggle settings panel
  toggleSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('active');
  });

  // Save server URL button
  saveServerUrlBtn.addEventListener('click', () => {
    let inputUrl = serverUrlInput.value.trim();
    if (!inputUrl) {
      inputUrl = DEFAULT_PROD_URL;
    }
    // Ensure protocol prefix
    if (!/^https?:\/\//i.test(inputUrl)) {
      inputUrl = 'https://' + inputUrl;
    }
    inputUrl = inputUrl.replace(/\/+$/, '');
    localStorage.setItem('lifeos_server_url', inputUrl);
    updateServerBadge();
    settingsPanel.classList.remove('active');
    showStatus(`Server URL updated to: ${inputUrl}`, 'success');
  });

  // Preset buttons
  presetProdBtn.addEventListener('click', () => {
    serverUrlInput.value = DEFAULT_PROD_URL;
  });

  presetLocalBtn.addEventListener('click', () => {
    serverUrlInput.value = DEFAULT_LOCAL_URL;
  });

  // Initial load
  updateServerBadge();
  updateViewState();

  // Switch views and fetch data based on authorization state
  function updateViewState() {
    const token = localStorage.getItem('lifeos_clipper_token');
    const username = localStorage.getItem('lifeos_clipper_username');
    
    if (token) {
      loginView.style.display = 'none';
      clipperView.style.display = 'block';
      loggedInUser.textContent = username || 'User';
      loadTabContent();
    } else {
      loginView.style.display = 'block';
      clipperView.style.display = 'none';
      loggedInUser.textContent = '';
    }
  }

  // Load active tab details into inputs
  function loadTabContent() {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          const activeTab = tabs[0];
          titleInput.value = activeTab.title || 'Clipped Web Page';
          contentInput.value = `URL: ${activeTab.url || ''}\n\n[Clipping details gathered from browser tab]`;
        }
      });
    } else {
      titleInput.value = 'Local Web Page';
      contentInput.value = 'URL: http://localhost\n\n[Clipping details gathered from browser tab]';
    }
  }

  // Handle Login Click
  loginBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const serverUrl = getServerUrl();

    if (!username) {
      showStatus('Please enter your username.', 'error');
      return;
    }
    if (!password) {
      showStatus('Please enter your password.', 'error');
      return;
    }

    showStatus(`Connecting to ${serverUrl}...`, '');

    try {
      const response = await fetch(`${serverUrl}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.accessToken || data.token;
        const user = data.username || username;

        if (token) {
          localStorage.setItem('lifeos_clipper_token', token);
          localStorage.setItem('lifeos_clipper_username', user);
          
          // Clear inputs
          usernameInput.value = '';
          passwordInput.value = '';
          
          showStatus('Successfully logged in!', 'success');
          
          setTimeout(() => {
            statusMsg.style.display = 'none';
            updateViewState();
          }, 1000);
        } else {
          showStatus('Error: Invalid response format from server.', 'error');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        showStatus(errorData.message || `Login failed. Status: ${response.status}`, 'error');
      }
    } catch (err) {
      showStatus(`Failed to connect to LifeOS server at ${serverUrl}. Check your internet connection or server settings (⚙️).`, 'error');
    }
  });

  // Handle Logout Click
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('lifeos_clipper_token');
    localStorage.removeItem('lifeos_clipper_username');
    statusMsg.style.display = 'none';
    updateViewState();
  });

  // Handle Note Save Click
  saveBtn.addEventListener('click', async () => {
    const token = localStorage.getItem('lifeos_clipper_token');
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const serverUrl = getServerUrl();

    if (!token) {
      showStatus('Session expired. Please log in again.', 'error');
      updateViewState();
      return;
    }
    if (!title) {
      showStatus('Please enter a note title.', 'error');
      return;
    }

    showStatus('Saving web clip...', '');

    try {
      const response = await fetch(`${serverUrl}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title,
          content: content,
          category: 'Clipped',
          tags: 'web-clipper'
        })
      });

      if (response.ok) {
        showStatus('Web page successfully clipped to LifeOS!', 'success');
        contentInput.value = '';
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('lifeos_clipper_token');
        localStorage.removeItem('lifeos_clipper_username');
        showStatus('Session expired. Please log in again.', 'error');
        setTimeout(() => {
          updateViewState();
        }, 1500);
      } else {
        const errorData = await response.json().catch(() => ({}));
        showStatus(errorData.message || `Error saving note. Status: ${response.status}`, 'error');
      }
    } catch (err) {
      showStatus(`Failed to connect to LifeOS server at ${serverUrl}. Check your internet connection or server settings (⚙️).`, 'error');
    }
  });

  function showStatus(msg, type) {
    statusMsg.innerText = msg;
    statusMsg.className = 'status';
    if (type) {
      statusMsg.classList.add(type);
    } else {
      statusMsg.style.display = 'block';
      statusMsg.style.color = '#06b6d4';
      statusMsg.style.background = 'rgba(6, 182, 212, 0.1)';
      statusMsg.style.border = '1px solid rgba(6, 182, 212, 0.2)';
    }
  }
});
