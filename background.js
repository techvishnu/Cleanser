chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
	// Use asynchronous storage call; return true to indicate async response.
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
	});
	return true; // Keep the callback channel open for async use.
});
