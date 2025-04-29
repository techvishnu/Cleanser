document.addEventListener("DOMContentLoaded", function () {
	const mappingTable = document.getElementById("mappingTable");
	const addMappingBtn = document.getElementById("addMapping");
	const saveMappingsBtn = document.getElementById("saveMappings");
	const blacklistContainer = document.getElementById("blacklistContainer");
	const addSiteBtn = document.getElementById("addSite");
	const newSiteInput = document.getElementById("newSite");

	// Load mappings from chrome.storage
	function loadMappings() {
		chrome.storage.sync.get("mappings", (data) => {
			let mappings = data.mappings;
			// If no mappings are saved, use default mappings.
			if (!mappings) {
				mappings = {
					PDFs: ["pdf"],
					Documents: ["doc", "docx", "txt", "rtf"],
					Images: ["jpg", "jpeg", "png", "gif", "bmp"],
					Audio: ["mp3", "wav", "ogg"],
					Videos: ["mp4", "mkv", "avi", "mov"],
				};
			}
			// Clear any existing rows (except the header)
			while (mappingTable.rows.length > 1) {
				mappingTable.deleteRow(1);
			}
			// Populate table with each mapping
			for (const folder in mappings) {
				addMappingRow(folder, mappings[folder].join(", "));
			}
		});
	}

	// Function to add a row to the mapping table
	function addMappingRow(folderValue = "", extensionsValue = "") {
		const row = mappingTable.insertRow();
		const folderCell = row.insertCell();
		const extensionsCell = row.insertCell();
		const actionsCell = row.insertCell();

		const folderInput = document.createElement("input");
		folderInput.type = "text";
		folderInput.value = folderValue;
		folderCell.appendChild(folderInput);

		const extensionsInput = document.createElement("input");
		extensionsInput.type = "text";
		extensionsInput.value = extensionsValue;
		extensionsCell.appendChild(extensionsInput);

		const removeBtn = document.createElement("button");
		removeBtn.textContent = "Remove";
		removeBtn.addEventListener("click", () => {
			mappingTable.deleteRow(row.rowIndex);
		});
		actionsCell.appendChild(removeBtn);
	}

	// Add a blank row for new mapping
	addMappingBtn.addEventListener("click", () => {
		addMappingRow();
	});

	// Save the mappings back to chrome.storage
	saveMappingsBtn.addEventListener("click", () => {
		const newMappings = {};
		// Skip the header row (index 0)
		for (let i = 1; i < mappingTable.rows.length; i++) {
			const row = mappingTable.rows[i];
			const folder = row.cells[0].querySelector("input").value.trim();
			const exts = row.cells[1].querySelector("input").value.trim();
			if (folder && exts) {
				// Convert the comma separated string into an array
				newMappings[folder] = exts
					.split(",")
					.map((ext) => ext.trim().toLowerCase())
					.filter((ext) => ext !== "");
			}
		}
		chrome.storage.sync.set({ mappings: newMappings }, () => {
			alert("Mappings saved!");
		});
	});

	// Load blacklisted sites
	function loadBlacklistedSites() {
		chrome.storage.sync.get("blacklistedSites", (data) => {
			const blacklistedSites = data.blacklistedSites || [];
			blacklistContainer.innerHTML = "";
			blacklistedSites.forEach(site => {
				addBlacklistItem(site);
			});
		});
	}

	// Add a blacklisted site to the UI
	function addBlacklistItem(site) {
		const item = document.createElement("div");
		item.className = "blacklist-item";
		
		const siteSpan = document.createElement("span");
		siteSpan.textContent = site;
		
		const removeBtn = document.createElement("button");
		removeBtn.textContent = "Remove";
		removeBtn.className = "delete-btn";
		removeBtn.addEventListener("click", () => {
			chrome.storage.sync.get("blacklistedSites", (data) => {
				const blacklistedSites = data.blacklistedSites || [];
				const newBlacklist = blacklistedSites.filter(s => s !== site);
				chrome.storage.sync.set({ blacklistedSites: newBlacklist }, () => {
					item.remove();
				});
			});
		});

		item.appendChild(siteSpan);
		item.appendChild(removeBtn);
		blacklistContainer.appendChild(item);
	}

	// Add new site to blacklist
	addSiteBtn.addEventListener("click", () => {
		const site = newSiteInput.value.trim().toLowerCase();
		if (site) {
			chrome.storage.sync.get("blacklistedSites", (data) => {
				const blacklistedSites = data.blacklistedSites || [];
				if (!blacklistedSites.includes(site)) {
					blacklistedSites.push(site);
					chrome.storage.sync.set({ blacklistedSites }, () => {
						addBlacklistItem(site);
						newSiteInput.value = "";
					});
				}
			});
		}
	});

	// Handle Enter key in the new site input
	newSiteInput.addEventListener("keypress", (e) => {
		if (e.key === "Enter") {
			addSiteBtn.click();
		}
	});

	// Initial load
	loadMappings();
	loadBlacklistedSites();
});
