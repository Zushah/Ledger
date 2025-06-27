const $ = (id) => document.getElementById(id);
const elements = {
    activitiesDiv: $("activities"),
    activityForm: $("activity-form"),
    activityNameInput: $("activity-name"),
    calendar: $("calendar"),
    entryForm: $("entry-form"),
    entrySection: $("entry-section"),
    selectedActivityTitle: $("selected-activity"),
    tooltip: $("calendar-tooltip"),
    yearButtonsDiv: $("year-buttons")
};

let activities = JSON.parse(localStorage.getItem("ledgerActivities") || "[]");
let selectedActivity = null;
let selectedYear = null;
