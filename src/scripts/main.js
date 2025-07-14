const main = () => {
    elements.activityForm.onsubmit = handleActivityFormSubmit;
    elements.entryForm.onsubmit = handleEntryFormSubmit;
    const exportBtn = document.getElementById("export-btn");
    exportBtn.onclick = () => {
        const dataStr = JSON.stringify(activities, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ledger-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    const importFile = document.getElementById("import-file");
    importFile.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (confirm("This will overwrite all current data. Are you sure you want to import?")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedActivities = JSON.parse(event.target.result);
                    if (Array.isArray(importedActivities)) {
                        activities = importedActivities;
                        saveActivities();
                        selectedActivity = null;
                        elements.entrySection.style.display = "none";
                        renderActivities();
                        alert("Data imported successfully!");
                    } else {
                        throw new Error("Invalid file format.");
                    }
                } catch (error) {
                    alert(`Error importing data: ${error.message}`);
                }
            };
            reader.readAsText(file);
        }
        e.target.value = "";
    };

    renderActivities();
};
main();
