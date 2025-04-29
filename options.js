document.addEventListener("DOMContentLoaded", function () {
	const mappingTable = document.getElementById("mappingTable");
	const addMappingBtn = document.getElementById("addMapping");
	const saveMappingsBtn = document.getElementById("saveMappings");

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

	loadMappings();
});
