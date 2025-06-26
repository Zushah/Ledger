const activityForm = document.getElementById("activity-form");
const activityNameInput = document.getElementById("activity-name");
const activitiesDiv = document.getElementById("activities");
const entrySection = document.getElementById("entry-section");
const selectedActivityTitle = document.getElementById("selected-activity");
const entryForm = document.getElementById("entry-form");
const calendar = document.getElementById("calendar");
const tooltip = document.getElementById("calendar-tooltip");
const yearButtonsDiv = document.getElementById("year-buttons");
let activities = JSON.parse(localStorage.getItem("ledgerActivities") || "[]");
let selectedActivity = null;
let selectedYear = null;

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
    selectedYear = null;
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

const getAllEntryYears = () => {
    if (selectedActivity === null) return [];
    const entries = activities[selectedActivity].entries;
    if (entries.length === 0) return [];
    const years = entries.map(e => Number(e.date.slice(0, 4)));
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    let allYears = [];
    for (let y = minYear; y <= maxYear; y++) allYears.push(y);
    return allYears;
};

const renderYearButtons = () => {
    yearButtonsDiv.innerHTML = "";
    if (selectedActivity === null) return;
    const years = getAllEntryYears();
    if (years.length === 0) return;
    if (!selectedYear || !years.includes(selectedYear)) selectedYear = years[years.length - 1];
    years.forEach(year => {
        const btn = document.createElement("button");
        btn.textContent = year;
        btn.className = "year-btn";
        if (year === selectedYear) btn.classList.add("active");
        btn.onclick = () => {
            selectedYear = year;
            renderYearButtons();
            renderEntries();
        };
        yearButtonsDiv.appendChild(btn);
    });
};

const renderEntries = () => {
    calendar.innerHTML = "";
    renderYearButtons();
    if (selectedActivity === null) return;
    const entries = activities[selectedActivity].entries;
    if (!selectedYear) return;
    const dateMap = {};
    entries.forEach(entry => {
        if (entry.date.startsWith(selectedYear + "-")) {
            if (!dateMap[entry.date]) dateMap[entry.date] = [];
            dateMap[entry.date].push(entry);
        }
    });
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    const firstDay = new Date(startDate);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay());
    const lastDay = new Date(endDate);
    lastDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    let date = new Date(firstDay);
    let weeks = [];
    while (date <= lastDay) {
        let week = [];
        for (let i = 0; i < 7; i++) {
            week.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        weeks.push(week);
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const calendarContainer = document.createElement("div");
    calendarContainer.style.display = "flex";
    calendarContainer.style.flexDirection = "row";
    calendarContainer.style.alignItems = "flex-start";
    const weekdayLabelsDiv = document.createElement("div");
    weekdayLabelsDiv.className = "calendar-week";
    weekdayLabelsDiv.style.marginRight = "5px";
    weekdayLabelsDiv.style.paddingTop = "16px";
    const weekdays = ["", "Mon", "", "Wed", "", "Fri", ""];
    for (let i = 0; i < 7; i++) {
        const labelDiv = document.createElement("div");
        labelDiv.style.height = "18px";
        labelDiv.style.width = "25px";
        labelDiv.style.fontSize = "0.8em";
        labelDiv.style.color = "#555";
        labelDiv.style.lineHeight = "18px";
        labelDiv.style.margin = "1px 0";
        labelDiv.textContent = weekdays[i];
        weekdayLabelsDiv.appendChild(labelDiv);
    }
    calendarContainer.appendChild(weekdayLabelsDiv);
    const mainGridContainer = document.createElement("div");
    const monthRow = document.createElement("div");
    monthRow.style.display = "flex";
    monthRow.style.flexDirection = "row";
    monthRow.style.gap = "2px";
    let monthForWeek = [];
    let lastMonth = null;
    weeks.forEach(week => {
        let label = "";
        for (let d = 0; d < 7; d++) {
            const day = week[d];
            if (day.getFullYear() === selectedYear) {
                const month = day.getMonth();
                if (month !== lastMonth) {
                    label = months[month];
                    lastMonth = month;
                }
                break;
            }
        }
        monthForWeek.push(label);
    });
    let seen = {};
    monthForWeek.forEach(label => {
        const span = document.createElement("div");
        span.style.width = "18px";
        span.style.height = "16px";
        span.style.fontSize = "0.9em";
        span.style.textAlign = "left";
        span.style.flex = "none";
        if (label && !seen[label]) {
            span.textContent = label;
            seen[label] = true;
        } else {
            span.textContent = "";
        }
        monthRow.appendChild(span);
    });
    mainGridContainer.appendChild(monthRow);
    const grid = document.createElement("div");
    grid.className = "calendar-grid";
    grid.style.flexDirection = "row";
    weeks.forEach(weekArr => {
        const weekDiv = document.createElement("div");
        weekDiv.className = "calendar-week";
        weekArr.forEach(day => {
            const dayDiv = document.createElement("div");
            dayDiv.className = "calendar-day";
            if (day.getFullYear() === selectedYear) {
                const dateStr = day.toISOString().slice(0, 10);
                const dayEntries = dateMap[dateStr] || [];
                let totalHours = 0;
                dayEntries.forEach(e => totalHours += parseFloat(e.hours));
                if (dayEntries.length > 0) {
                    let intensity = Math.min(1, totalHours / 8);
                    let blue = Math.floor(200 + 55 * intensity);
                    dayDiv.style.background = `rgb(66, 135, ${blue})`;
                    dayDiv.style.cursor = "pointer";
                    dayDiv.onmouseenter = (evt) => {
                        tooltip.innerHTML = `<strong>${dateStr}</strong><br>` +
                            dayEntries.map((e) => `${e.start} - ${e.end} (${e.hours} hrs)`).join("<br>");
                        tooltip.style.display = "block";
                        tooltip.style.left = (evt.pageX + 10) + "px";
                        tooltip.style.top = (evt.pageY - 10) + "px";
                    };
                    dayDiv.onmousemove = (evt) => {
                        tooltip.style.left = (evt.pageX + 10) + "px";
                        tooltip.style.top = (evt.pageY - 10) + "px";
                    };
                    dayDiv.onmouseleave = () => {
                        tooltip.style.display = "none";
                    };
                    dayDiv.oncontextmenu = (evt) => {
                        evt.preventDefault();
                        if (confirm(`Delete all entries for ${dateStr}?`)) {
                            activities[selectedActivity].entries = activities[selectedActivity].entries.filter(e => e.date !== dateStr);
                            saveActivities();
                            renderEntries();
                        }
                    };
                }
            } else {
                dayDiv.style.opacity = "0.2";
            }
            weekDiv.appendChild(dayDiv);
        });
        grid.appendChild(weekDiv);
    });
    mainGridContainer.appendChild(grid);

    calendarContainer.appendChild(mainGridContainer);
    calendar.appendChild(calendarContainer);
};

const deleteEntry = (idx) => {
    if (selectedActivity === null) return;
    activities[selectedActivity].entries.splice(idx, 1);
    saveActivities();
    renderEntries();
};

renderActivities();
