const saveActivities = () => {
    localStorage.setItem("ledgerActivities", JSON.stringify(activities));
};

const renderActivities = () => {
    elements.activitiesDiv.innerHTML = "";
    activities.forEach((activity, idx) => {
        const container = document.createElement("div");
        container.style.display = "flex";
        const btn = document.createElement("button");
        btn.className = "activity-btn";
        btn.textContent = activity.name;
        btn.onclick = () => selectActivity(idx);
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-activity-btn";
        deleteBtn.innerHTML = "&times;";
        deleteBtn.onclick = () => deleteActivity(idx);
        container.appendChild(btn);
        container.appendChild(deleteBtn);
        elements.activitiesDiv.appendChild(container);
    });
};

const selectActivity = (idx) => {
    selectedActivity = idx;
    elements.entrySection.style.display = "block";
    elements.selectedActivityTitle.textContent = activities[idx].name;
    selectedYear = null;
    renderEntries();
};

const deleteActivity = (idx) => {
    if (confirm(`Are you sure you want to delete "${activities[idx].name}"?`)) {
        activities.splice(idx, 1);
        saveActivities();
        renderActivities();
        if (selectedActivity === idx) {
            elements.entrySection.style.display = "none";
            selectedActivity = null;
        } else if (selectedActivity > idx) {
            selectedActivity--;
        }
    }
};

const handleActivityFormSubmit = (e) => {
    e.preventDefault();
    const name = elements.activityNameInput.value.trim();
    if (!name) return;
    activities.push({ name, entries: [] });
    saveActivities();
    renderActivities();
    elements.activityForm.reset();
};

const handleEntryFormSubmit = (e) => {
    e.preventDefault();
    if (selectedActivity === null) return;
    const date = document.getElementById("date").value;
    const start = document.getElementById("start-time").value;
    const end = document.getElementById("end-time").value;
    const note = document.getElementById("note").value.trim();
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let hours = (eh + em / 60) - (sh + sm / 60);
    if (hours < 0) hours += 24;
    activities[selectedActivity].entries.push({ date, start, end, hours: hours.toFixed(2), note });
    saveActivities();
    renderEntries();
    elements.entryForm.reset();
};

const getAllEntryYears = () => {
    if (selectedActivity === null) return [];
    const entries = activities[selectedActivity].entries;
    if (entries.length === 0) return [new Date().getFullYear()];
    const years = [...new Set(entries.map(e => Number(e.date.slice(0, 4))))];
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    let allYears = [];
    for (let y = minYear; y <= maxYear; y++) allYears.push(y);
    return allYears.sort((a, b) => b - a);
};

const renderYearButtons = () => {
    elements.yearButtonsDiv.innerHTML = "";
    if (selectedActivity === null) return;
    const years = getAllEntryYears();
    if (years.length === 0) return;
    if (!selectedYear || !years.includes(selectedYear)) selectedYear = Math.max(...years);
    years.forEach((year) => {
        const btn = document.createElement("button");
        btn.className = "year-btn";
        if (year === selectedYear) btn.classList.add("active");
        btn.textContent = year;
        btn.onclick = () => {
            selectedYear = year;
            renderEntries();
        };
        elements.yearButtonsDiv.appendChild(btn);
    });
};

const renderEntries = () => {
    elements.calendar.innerHTML = "";
    renderYearButtons();
    if (selectedActivity === null || selectedYear === null) return;
    const entries = activities[selectedActivity].entries.filter(e => e.date.startsWith(selectedYear));
    const dateMap = {};
    entries.forEach((entry) => {
        if (!dateMap[entry.date]) dateMap[entry.date] = [];
        dateMap[entry.date].push(entry);
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
    calendarContainer.className = "calendar-container";
    const monthRow = document.createElement("div");
    monthRow.className = "calendar-months";
    const monthPositions = {};
    weeks.forEach((week, weekIndex) => {
        const firstDayOfMonth = week.find((day) => day.getDate() === 1);
        if (firstDayOfMonth) {
            const month = firstDayOfMonth.getMonth();
            if (monthPositions[month] === undefined) {
                monthPositions[month] = weekIndex;
            }
        }
    });
    months.forEach((monthName, monthIndex) => {
        if (monthPositions[monthIndex] !== undefined) {
            const monthLabel = document.createElement("div");
            monthLabel.className = "calendar-month-label";
            monthLabel.textContent = monthName;
            monthLabel.style.gridColumnStart = monthPositions[monthIndex] + 1;
            monthRow.appendChild(monthLabel);
        }
    });
    calendarContainer.appendChild(monthRow);
    const calendarGridArea = document.createElement("div");
    calendarGridArea.className = "calendar-grid-area";
    const weekdayLabelsDiv = document.createElement("div");
    weekdayLabelsDiv.className = "calendar-weekdays";
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekdays.forEach((day, i) => {
        const labelDiv = document.createElement("div");
        labelDiv.className = "calendar-weekday-label";
        if ([1, 3, 5].includes(i)) labelDiv.textContent = day;
        weekdayLabelsDiv.appendChild(labelDiv);
    });
    calendarGridArea.appendChild(weekdayLabelsDiv);
    const grid = document.createElement("div");
    grid.className = "calendar-grid";
    weeks.forEach((weekArr) => {
        const weekDiv = document.createElement("div");
        weekDiv.className = "calendar-week";
        weekArr.forEach((day) => {
            const dayDiv = document.createElement("div");
            dayDiv.className = "calendar-day";
            if (day.getFullYear() === selectedYear) {
                const dateStr = day.toISOString().slice(0, 10);
                const dayEntries = dateMap[dateStr] || [];
                let totalHours = 0;
                dayEntries.forEach((e) => totalHours += parseFloat(e.hours));
                if (dayEntries.length > 0) {
                    let intensity = Math.min(1, totalHours / 8);
                    let blue = Math.floor(200 + 55 * intensity);
                    dayDiv.style.background = `rgb(66, 135, ${blue})`;
                    dayDiv.style.cursor = "pointer";
                    dayDiv.onmouseenter = (evt) => {
                        elements.tooltip.innerHTML = `<strong>${dateStr}</strong><br>` + dayEntries.map((e) => `${e.start} - ${e.end} (${e.hours} hours)${e.note ? `<br><i>${e.note}</i>` : ""}`).join("<br>");
                        elements.tooltip.style.display = "block";
                        elements.tooltip.style.left = (evt.pageX + 10) + "px";
                        elements.tooltip.style.top = (evt.pageY - 10) + "px";
                    };
                    dayDiv.onmousemove = (evt) => {
                        elements.tooltip.style.left = (evt.pageX + 10) + "px";
                        elements.tooltip.style.top = (evt.pageY - 10) + "px";
                    };
                    dayDiv.onmouseleave = () => {
                        elements.tooltip.style.display = "none";
                    };
                    dayDiv.oncontextmenu = (evt) => {
                        evt.preventDefault();
                        if (confirm(`Delete all entries for ${dateStr}?`)) {
                            activities[selectedActivity].entries = activities[selectedActivity].entries.filter((e) => e.date !== dateStr);
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
    calendarGridArea.appendChild(grid);
    calendarContainer.appendChild(calendarGridArea);
    elements.calendar.appendChild(calendarContainer);
    updateStats();
};

const deleteEntry = (idx) => {
    if (selectedActivity === null) return;
    activities[selectedActivity].entries.splice(idx, 1);
    saveActivities();
    renderEntries();
};
