const formatHours = (totalHours) => `${totalHours.toFixed(2)} hrs`;

const updateStats = () => {
    if (selectedActivity === null) return;
    const entries = activities[selectedActivity].entries;
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const today = `${year}-${month}-${day}`;
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
    const uniqueDays = new Set();
    entries.forEach((entry) => {
        const entryHours = parseFloat(entry.hours);
        total += entryHours;
        uniqueDays.add(entry.date);
        const [y, m, d] = entry.date.split('-').map(Number);
        const entryDate = new Date(Date.UTC(y, m - 1, d));
        if (entryDate.getUTCFullYear() === currentYear) {
            yearTotal += entryHours;
            if (entryDate.getUTCMonth() === currentMonth) {
                monthTotal += entryHours;
            }
        }
        if (entryDate >= startOfWeek) weekTotal += entryHours;
        if (entry.date === today) dayTotal += entryHours;
    });
    const dailyAverage = uniqueDays.size > 0 ? total / uniqueDays.size : 0;
    elements.stats.total.textContent = formatHours(total);
    elements.stats.year.textContent = formatHours(yearTotal);
    elements.stats.month.textContent = formatHours(monthTotal);
    elements.stats.week.textContent = formatHours(weekTotal);
    elements.stats.day.textContent = formatHours(dayTotal);
    elements.stats.avg.textContent = formatHours(dailyAverage);
};
