const main = () => {
    elements.activityForm.onsubmit = handleActivityFormSubmit;
    elements.entryForm.onsubmit = handleEntryFormSubmit;
    renderActivities();
};
main();
