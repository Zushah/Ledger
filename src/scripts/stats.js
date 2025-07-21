const formatHours = (totalHours) => `${totalHours.toFixed(2)} hours`;

const updateStats = () => {
    if (selectedActivity === null) return;
    const entries = activities[selectedActivity].entries;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    let total = 0;
    let yearTotal = 0;
    let monthTotal = 0;
    let weekTotal = 0;
    let dayTotal = 0;
    const dailyHours = {};
    const weeklyHours = {};
    const monthlyHours = {};
    const yearlyHours = {};
    const weekdayHours = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    entries.forEach((entry) => {
        const entryHours = parseFloat(entry.hours);
        total += entryHours;
        const [y, m, d] = entry.date.split("-").map(Number);
        const entryDate = new Date(Date.UTC(y, m - 1, d));
        dailyHours[entry.date] = (dailyHours[entry.date] || 0) + entryHours;
        const weekStart = new Date(entryDate);
        weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
        const weekKey = weekStart.toISOString().slice(0, 10);
        weeklyHours[weekKey] = (weeklyHours[weekKey] || 0) + entryHours;
        const monthKey = entry.date.slice(0, 7);
        monthlyHours[monthKey] = (monthlyHours[monthKey] || 0) + entryHours;
        const yearKey = entry.date.slice(0, 4);
        yearlyHours[yearKey] = (yearlyHours[yearKey] || 0) + entryHours;
        weekdayHours[entryDate.getUTCDay()] += entryHours;
        if (entryDate.getUTCFullYear() === currentYear) {
            yearTotal += entryHours;
            if (entryDate.getUTCMonth() === currentMonth) {
                monthTotal += entryHours;
            }
        }
        if (entryDate >= startOfWeek) weekTotal += entryHours;
        if (entry.date === todayStr) dayTotal += entryHours;
    });
    const dailyAverage = Object.keys(dailyHours).length > 0 ? total / Object.keys(dailyHours).length : 0;
    const weeklyAverage = Object.keys(weeklyHours).length > 0 ? total / Object.keys(weeklyHours).length : 0;
    const monthlyAverage = Object.keys(monthlyHours).length > 0 ? total / Object.keys(monthlyHours).length : 0;
    let currentStreak = 0, bestStreak = 0;
    let currentStreakStartDate = null, bestStreakStartDate = null;
    const sortedDates = Object.keys(dailyHours).sort();
    if (sortedDates.length > 0) {
        let streak = 0;
        let streakStartDate = sortedDates[0];
        for (let i = 0; i < sortedDates.length; i++) {
            const date = new Date(sortedDates[i] + "T00:00:00");
            if (i > 0) {
                const prevDate = new Date(sortedDates[i - 1] + "T00:00:00");
                const diff = (date - prevDate) / (1000 * 60 * 60 * 24);
                if (diff === 1) {
                    streak++;
                } else {
                    streak = 1;
                    streakStartDate = sortedDates[i];
                }
            } else {
                streak = 1;
            }
            if (streak > bestStreak) {
                bestStreak = streak;
                bestStreakStartDate = streakStartDate;
            }
        }
        const lastEntryDate = new Date(sortedDates[sortedDates.length - 1] + "T00:00:00");
        const today = new Date(todayStr + "T00:00:00");
        const diffToday = (today - lastEntryDate) / (1000 * 60 * 60 * 24);
        if (diffToday <= 1) {
            currentStreak = streak;
            currentStreakStartDate = streakStartDate;
        }
    }
    let bestDay = { date: null, hours: 0 };
    for (const date in dailyHours) {
        if (dailyHours[date] > bestDay.hours) {
            bestDay = { date, hours: dailyHours[date] };
        }
    }
    let bestWeek = { date: null, hours: 0 };
    for (const date in weeklyHours) {
        if (weeklyHours[date] > bestWeek.hours) {
            bestWeek = { date, hours: weeklyHours[date] };
        }
    }
    let bestMonth = { date: null, hours: 0 };
    for (const date in monthlyHours) {
        if (monthlyHours[date] > bestMonth.hours) {
            bestMonth = { date, hours: monthlyHours[date] };
        }
    }
    let bestYear = { date: null, hours: 0 };
    for (const date in yearlyHours) {
        if (yearlyHours[date] > bestYear.hours) {
            bestYear = { date, hours: yearlyHours[date] };
        }
    }
    let busiestWeekday = { day: null, hours: -1 };
    for (const day in weekdayHours) {
        if (weekdayHours[day] > busiestWeekday.hours) {
            busiestWeekday = { day, hours: weekdayHours[day] };
        }
    }
    elements.stats.total.textContent = formatHours(total);
    elements.stats.year.textContent = formatHours(yearTotal);
    elements.stats.month.textContent = formatHours(monthTotal);
    elements.stats.week.textContent = formatHours(weekTotal);
    elements.stats.day.textContent = formatHours(dayTotal);
    elements.stats.dailyAvg.textContent = formatHours(dailyAverage);
    elements.stats.weeklyAvg.textContent = formatHours(weeklyAverage);
    elements.stats.monthlyAvg.textContent = formatHours(monthlyAverage);
    if (currentStreak > 0) {
        const d = new Date(currentStreakStartDate + "T00:00:00");
        const formattedDate = d.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit", year: "numeric" });
        elements.stats.currentStreak.innerHTML = `${currentStreak} days<br><small>(${formattedDate})</small>`;
    } else {
        elements.stats.currentStreak.textContent = "0 days";
    }
    if (bestStreak > 0) {
        const d = new Date(bestStreakStartDate + "T00:00:00");
        const formattedDate = d.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit", year: "numeric" });
        elements.stats.bestStreak.innerHTML = `${bestStreak} days<br><small>(${formattedDate})</small>`;
    } else {
        elements.stats.bestStreak.textContent = "0.00 hours";
    }
    if (bestDay.date) {
        const d = new Date(bestDay.date + "T00:00:00");
        const formattedDate = d.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit", year: "numeric" });
        elements.stats.bestDay.innerHTML = `${formatHours(bestDay.hours)}<br><small>(${formattedDate})</small>`;
    } else {
        elements.stats.bestDay.textContent = "0.00 hours";
    }
    if (bestWeek.date) {
        const d = new Date(bestWeek.date + "T00:00:00");
        const formattedDate = d.toLocaleDateString(undefined, { month: "2-digit", day: "2-digit", year: "numeric" });
        elements.stats.bestWeek.innerHTML = `${formatHours(bestWeek.hours)}<br><small>(${formattedDate})</small>`;
    } else {
        elements.stats.bestWeek.textContent = "0.00 hours";
    }
    if (bestMonth.date) {
        const [year, month] = bestMonth.date.split("-");
        elements.stats.bestMonth.innerHTML = `${formatHours(bestMonth.hours)}<br><small>(${month}/${year})</small>`;
    } else {
        elements.stats.bestMonth.textContent = "0.00 hours";
    }
    if (bestYear.date) {
        elements.stats.bestYear.innerHTML = `${formatHours(bestYear.hours)}<br><small>(${bestYear.date})</small>`;
    } else {
        elements.stats.bestYear.textContent = "0.00 hours";
    }
    if (busiestWeekday.day !== null && busiestWeekday.hours > 0) {
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        elements.stats.busiestWeekday.innerHTML = `${formatHours(busiestWeekday.hours)}<br><small>(${weekdays[busiestWeekday.day]})</small>`;
    } else {
        elements.stats.busiestWeekday.textContent = "0.00 hours";
    }
};
