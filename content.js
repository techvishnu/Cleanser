// Create and add the blacklist button
function createBlacklistButton() {
    const button = document.createElement('button');
    button.className = 'file-segregator-blacklist-btn';
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-4.42 3.58-8 8-8 4.42 0 8 3.58 8 8 0 4.42-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
        Add this Site
    `;
    document.body.appendChild(button);
    return button;
}

// Check if current site is blacklisted
function checkIfBlacklisted() {
    const domain = window.location.hostname;
    return new Promise((resolve) => {
        chrome.storage.sync.get("blacklistedSites", (data) => {
            const blacklistedSites = data.blacklistedSites || [];
            resolve(blacklistedSites.includes(domain));
        });
    });
}

// Update button state
function updateButtonState(button, isBlacklisted) {
    if (isBlacklisted) {
        button.classList.add('blacklisted');
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
            </svg>
            Site Blacklisted
        `;
    } else {
        button.classList.remove('blacklisted');
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-4.42 3.58-8 8-8 4.42 0 8 3.58 8 8 0 4.42-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            Add this Site
        `;
    }
}

// Initialize the button
async function initializeButton() {
    const button = createBlacklistButton();
    const isBlacklisted = await checkIfBlacklisted();
    updateButtonState(button, isBlacklisted);

    button.addEventListener('click', async () => {
        if (!button.classList.contains('blacklisted')) {
            // Send message to background script to blacklist the site
            chrome.runtime.sendMessage({ type: "blacklistCurrentSite" }, (response) => {
                if (response.success) {
                    updateButtonState(button, true);
                }
            });
        }
    });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "siteBlacklisted") {
        const button = document.querySelector('.file-segregator-blacklist-btn');
        if (button) {
            updateButtonState(button, true);
        }
    }
});

// Initialize when the page loads
initializeButton(); 