// let's check if we need to update the options interface
if (localStorage.getItem('faved')) {
    document.getElementById('storage_switch').checked = true;
    faved = JSON.parse(localStorage.getItem('faved'));
}

// live update when pressing keys into search box
document.getElementById('search_txt').addEventListener('keydown', () => {
    udRes('search');
});

// results of the search whether by button or keyword; left side
document.getElementById('result_div').addEventListener('click', (event) => {
    addUpdate(event);
    if (event.target.classList.contains('proj-logo')) {
        showProjectModal(event.target);
    }
    excludeUpdate(event);
});

// this is the suggestion output; right side
document.getElementById('sugg_content').addEventListener('click', (event) => {
    addUpdate(event);
    if (event.target.classList.contains('proj-logo')) {
        showProjectModal(event.target);
    }
    excludeUpdate(event);
});

// check if they've clicked on the favorite modal
document.getElementById('modal_faved').addEventListener('click', (event) => {
    addUpdate(event);
});

// check if they've clicked on the selected modal
document.getElementById('modal_selected').addEventListener('click', (event) => {
    excludeUpdate(event);
});

// implement a scroll even for all main-nav class
const navbarLinks = document.querySelectorAll('.main-nav');
navbarLinks.forEach(link => {
    link.addEventListener('click', function (event) {
        event.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// if any modal is clicked outside, close all modals
document.querySelectorAll('.modal-background').forEach(element => {
    element.addEventListener('click', () => {
        closeModal();
    });
});

// convenience functions for the above; event = e.g., clicked element in modal
function excludeUpdate(event) {
    if (event.target.classList.contains('x-btn')) {
        exclude(event.target.attributes.data.value);
        udRes(curclick, true);
        updateSugg('',false);
        updateSelectedModal();
    }
}
function addUpdate(event) {
    if (event.target.classList.contains('add-btn')) {
        updateSugg(event.target.attributes.data.value,false);
        event.target.parentElement.style.backgroundColor = "#112255";
        event.target.style.display = 'none';
        udRes(curclick, false);
    }
}