const activityForm = document.getElementById("activity-form");
const activityNameInput = document.getElementById("activity-name");
const activitiesDiv = document.getElementById("activities");
const entrySection = document.getElementById("entry-section");
const selectedActivityTitle = document.getElementById("selected-activity");
const entryForm = document.getElementById("entry-form");
const entryList = document.getElementById("entry-list");
let activities = JSON.parse(localStorage.getItem("ledgerActivities") || "[]");
let selectedActivity = null;

const saveActivities = () => {
    localStorage.setItem("ledgerActivities", JSON.stringify(activities));
};

const renderActivities = () => {
    activitiesDiv.innerHTML = "";
    activities.forEach((activity, idx) => {
        const btn = document.createElement("button");
        btn.textContent = activity.name;
        btn.onclick = () => selectActivity(idx);
        btn.className = "activity-btn";
        const del = document.createElement("button");
        del.textContent = "🗑️";
        del.onclick = (e) => {
            e.stopPropagation();
            deleteActivity(idx);
        };
        del.className = "delete-activity-btn";
        const wrapper = document.createElement("div");
        wrapper.appendChild(btn);
        wrapper.appendChild(del);
        activitiesDiv.appendChild(wrapper);
    });
};

const selectActivity = (idx) => {
    selectedActivity = idx;
    entrySection.style.display = "block";
    selectedActivityTitle.textContent = activities[idx].name;
    renderEntries();
};

const deleteActivity = (idx) => {
    activities.splice(idx, 1);
    saveActivities();
    renderActivities();
    if (selectedActivity === idx) {
        entrySection.style.display = "none";
        selectedActivity = null;
    }
};

activityForm.onsubmit = (e) => {
    e.preventDefault();
    const name = activityNameInput.value.trim();
    if (!name) return;
    activities.push({ name, entries: [] });
    saveActivities();
    renderActivities();
    activityForm.reset();
};

entryForm.onsubmit = (e) => {
    e.preventDefault();
    if (selectedActivity === null) return;
    const date = document.getElementById("date").value;
    const start = document.getElementById("start-time").value;
    const end = document.getElementById("end-time").value;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let hours = (eh + em / 60) - (sh + sm / 60);
    if (hours < 0) hours += 24;
    activities[selectedActivity].entries.push({ date, start, end, hours: hours.toFixed(2) });
    saveActivities();
    renderEntries();
    entryForm.reset();
};

const renderEntries = () => {
    entryList.innerHTML = "";
    if (selectedActivity === null) return;
    activities[selectedActivity].entries.forEach((entry, idx) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <strong>${entry.date}</strong> | 
            ${entry.start} - ${entry.end} | 
            <span>${entry.hours} hours</span>
            <button data-idx="${idx}">Delete</button>
        `;
        li.querySelector("button").onclick = function() {
            deleteEntry(idx);
        };
        entryList.appendChild(li);
    });
};

const deleteEntry = (idx) => {
    if (selectedActivity === null) return;
    activities[selectedActivity].entries.splice(idx, 1);
    saveActivities();
    renderEntries();
};

renderActivities();
