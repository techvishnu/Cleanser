// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: "blacklistSite",
		title: "Blacklist this site",
		contexts: ["page"]
	});
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === "blacklistSite") {
		const url = new URL(tab.url);
		const domain = url.hostname;
		addToBlacklist(domain);
	}
});

// Function to add a site to blacklist
function addToBlacklist(domain) {
	chrome.storage.sync.get("blacklistedSites", (data) => {
		const blacklistedSites = data.blacklistedSites || [];
		if (!blacklistedSites.includes(domain)) {
			blacklistedSites.push(domain);
			chrome.storage.sync.set({ blacklistedSites }, () => {
				// Notify the user
				chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					if (tabs[0]) {
						chrome.tabs.sendMessage(tabs[0].id, {
							type: "siteBlacklisted",
							domain: domain
						});
					}
				});
			});
		}
	});
}

// Handle extension icon click to open options in new tab
chrome.action.onClicked.addListener(() => {
	chrome.tabs.create({
		url: 'options.html'
	});
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "blacklistCurrentSite") {
		const url = new URL(sender.tab.url);
		const domain = url.hostname;
		addToBlacklist(domain);
		sendResponse({ success: true });
	}
});

// Handle downloads with IDM Integration compatibility
chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
	// Check if the download is from IDM
	if (downloadItem.byExtensionId === 'dnhgegphmhcgpahdpphdpbjjpifp') {
		return false; // Let IDM handle the download
	}

	// Check if the site is blacklisted
	const url = new URL(downloadItem.url);
	const domain = url.hostname;

	return new Promise((resolve) => {
		chrome.storage.sync.get("blacklistedSites", (data) => {
			const blacklistedSites = data.blacklistedSites || [];
			if (blacklistedSites.includes(domain)) {
				resolve(false); // Let the download proceed normally for blacklisted sites
				return;
			}

			// Use asynchronous storage call for mappings
			chrome.storage.sync.get("mappings", (data) => {
				// Use default mappings if none are saved.
				const mappings = data.mappings || {
					PDFs: ["pdf"],
					Documents: ["doc", "docx", "txt", "rtf"],
					Images: ["jpg", "jpeg", "png", "gif", "bmp"],
					Audio: ["mp3", "wav", "ogg"],
					Videos: ["mp4", "mkv", "avi", "mov"],
				};

				// Extract the base filename (in case a default path contains directories)
				const fullName = downloadItem.filename.split("/").pop();
				// Get the file extension and normalize it
				const extension = fullName.split(".").pop().toLowerCase();

				// Default folder if no mapping is found
				let folder = "Others";
				// Loop through each mapping to find the right folder.
				for (const key in mappings) {
					if (mappings[key].includes(extension)) {
						folder = key;
						break;
					}
				}

				// Construct the new filename (relative to the default downloads directory)
				const newFilename = `${folder}/${fullName}`;
				// Suggest the new filename.
				suggest({ filename: newFilename });
				resolve(true);
			});
		});
	});
});
