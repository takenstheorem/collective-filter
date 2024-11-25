document.getElementById('search_txt').addEventListener('keydown', () => {
    udRes('search');
});
document.getElementById('result_div').addEventListener('click', (event) => {
    if (event.target.classList.contains('add-btn')) {
        updateSugg(event.target.attributes.data.value);
        event.target.parentElement.style.backgroundColor = "#112255";
        event.target.style.display = 'none';
    }
    if (event.target.classList.contains('proj-logo')) {
        showProjectModal(event.target);
    }
    if (event.target.classList.contains('x-btn')) {
        exclude(event.target.attributes.data.value);
        udRes(curclick, true);
        updateSugg();
        updateSelectedModal();
    }
});
document.getElementById('sugg_content').addEventListener('click', (event) => {
    if (event.target.classList.contains('add-btn')) {
        updateSugg(event.target.attributes.data.value);
        event.target.parentElement.style.backgroundColor = "#112255";
        event.target.style.display = 'none';
        udRes(curclick, true);
    }
    if (event.target.classList.contains('proj-logo')) {
        showProjectModal(event.target);
    }
    if (event.target.classList.contains('x-btn')) {
        exclude(event.target.attributes.data.value);
        udRes(curclick, true);
        updateSugg();
        updateSelectedModal();
    }
});
document.getElementById('modal_selected').addEventListener('click', (event) => {
    if (event.target.classList.contains('x-btn')) {
        exclude(event.target.attributes.data.value);
        udRes(curclick, true);
        updateSugg();
        updateSelectedModal();
    }
});
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
document.querySelectorAll('.modal-background').forEach(element => {
    element.addEventListener('click', () => {
        closeModal();
    });
});