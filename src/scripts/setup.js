const $ = (id) => document.getElementById(id);
const elements = {
    activitiesDiv: $("activities"),
    activityForm: $("activity-form"),
    activityNameInput: $("activity-name"),
    calendar: $("calendar"),
    entryForm: $("entry-form"),
    entrySection: $("entry-section"),
    selectedActivityTitle: $("selected-activity"),
    stats: {
        total: $("stats-total"),
        year: $("stats-year"),
        month: $("stats-month"),
        week: $("stats-week"),
        day: $("stats-day"),
        avg: $("stats-avg")
    },
    tooltip: $("calendar-tooltip"),
    yearButtonsDiv: $("year-buttons")
};

let activities = JSON.parse(localStorage.getItem("ledgerActivities") || "[]");
let selectedActivity = null;
let selectedYear = null;
