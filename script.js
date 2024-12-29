document.addEventListener('DOMContentLoaded', () => {
    const profileSelection = document.getElementById('profile-selection');
    const appPage = document.getElementById('app-page');

    const profileList = document.getElementById('profile-list');
    const createNewProfileButton = document.getElementById('create-new-profile');
    const selectProfileButton = document.getElementById('select-profile');
    const deleteProfileButton = document.getElementById('delete-profile');
    const logoutButton = document.getElementById('logout');

    const profileName = document.getElementById('profile-name');
    const profilePosition = document.getElementById('profile-position');

    const timeDisplay = document.getElementById('time-display');
    const toDoTasks = document.getElementById('to-do-tasks');
    const doneTasks = document.getElementById('done-tasks');
    const addTaskButton = document.getElementById('add-task');
    const deleteAllButton = document.getElementById('delete-all');

    let currentProfile = null;

    const loadProfiles = () => {
        const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
        profileList.innerHTML = '';
        for (const profile in profiles) {
            const option = document.createElement('option');
            option.value = profile;
            option.textContent = profile;
            profileList.appendChild(option);
        }
    };

    const saveProfiles = (profiles) => {
        localStorage.setItem('profiles', JSON.stringify(profiles));
    };





    selectProfileButton.addEventListener('click', () => {
        const selectedProfile = profileList.value;
        if (!selectedProfile) {
            alert('Silakan pilih profil terlebih dahulu!');
            return;
        }

        const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
        currentProfile = profiles[selectedProfile];

        profileName.textContent = selectedProfile;
        profilePosition.textContent = currentProfile.position;

        loadTasks();
        profileSelection.style.display = 'none';
        appPage.style.display = 'block';
    });




    deleteProfileButton.addEventListener('click', () => {
        const selectedProfile = profileList.value;
        if (!selectedProfile) {
            alert('Silakan pilih profil terlebih dahulu!');
            return;
        }

        if (confirm(`Apakah Anda yakin ingin menghapus profil "${selectedProfile}"?`)) {
            const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
            delete profiles[selectedProfile];
            saveProfiles(profiles);
            loadProfiles();
            alert('Profil berhasil dihapus.');
        }
    });





    createNewProfileButton.addEventListener('click', () => {
        const userName = prompt('Masukkan nama profil baru:');
        if (!userName) return;

        const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
        if (profiles[userName]) {
            alert('Profil dengan nama ini sudah ada!');
            return;
        }

        const userPosition = prompt('Masukkan jabatan untuk profil baru:');
        if (!userPosition) return;

        profiles[userName] = { position: userPosition, tasks: { toDo: [], done: [] } };
        saveProfiles(profiles);
        loadProfiles();
    });






    const loadTasks = () => {
        toDoTasks.innerHTML = '';
        doneTasks.innerHTML = '';

        currentProfile.tasks.toDo.forEach(task => {
            const row = createTaskRow(task, false);
            toDoTasks.appendChild(row);
            sortTasksByPriority();
        });

        currentProfile.tasks.done.forEach(task => {
            const row = createTaskRow(task, true);
            doneTasks.appendChild(row);
            row.classList.add('done-row');
        });
    };






    const saveTasks = () => {
        const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
        profiles[profileName.textContent] = currentProfile;
        saveProfiles(profiles);
    };





    addTaskButton.addEventListener('click', () => {
        const taskInput = document.getElementById('task').value.trim();
        const priority = document.getElementById('priority').value;

        if (taskInput === '') {
            alert('Agenda tidak bisa dikosongkan!');
            return;
        }

        const now = new Date();
        const dateTime = now.toLocaleString();

        const task = { description: taskInput, priority, time: dateTime };
        currentProfile.tasks.toDo.push(task);
        saveTasks();

        const row = createTaskRow(task, false);
        toDoTasks.appendChild(row);
        sortTasksByPriority();
        document.getElementById('task').value = '';
    });

    const createTaskRow = (task, isDone) => {
        const row = document.createElement('tr');
        row.classList.add(`priority-${task.priority}`);
        row.innerHTML = `
            <td><button class="delete-task">Hapus</button></td>
            <td>${task.description}</td>
            <td>${task.priority}</td>
            <td>${task.time}</td>
            <td><input type="checkbox" class="${isDone ? 'uncheck-done' : 'mark-done'}" ${isDone ? 'checked' : ''}></td>
        `;
        return row;
    };






    const sortTasksByPriority = () => {
        const rows = Array.from(toDoTasks.querySelectorAll('tr'));
        rows.sort((a, b) => {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            const priorityA = priorityOrder[a.children[2].textContent.toLowerCase()];
            const priorityB = priorityOrder[b.children[2].textContent.toLowerCase()];
            return priorityA - priorityB;
        });
        rows.forEach(row => toDoTasks.appendChild(row));
    };







    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-task')) {
            const row = e.target.closest('tr');
            const taskDescription = row.children[1].textContent;

            if (toDoTasks.contains(row)) {
                currentProfile.tasks.toDo = currentProfile.tasks.toDo.filter(task => task.description !== taskDescription);
            } else if (doneTasks.contains(row)) {
                currentProfile.tasks.done = currentProfile.tasks.done.filter(task => task.description !== taskDescription);

            }

            row.remove();
            saveTasks();
        }
    });

    toDoTasks.addEventListener('change', (e) => {
        if (e.target.classList.contains('mark-done')) {
            const row = e.target.closest('tr');
            const taskDescription = row.children[1].textContent;

            const task = currentProfile.tasks.toDo.find(task => task.description === taskDescription);
            currentProfile.tasks.toDo = currentProfile.tasks.toDo.filter(t => t !== task);
            currentProfile.tasks.done.push(task);

            row.remove();
            saveTasks();

            const doneRow = createTaskRow(task, true);
            doneRow.classList.add('done-row');
            doneTasks.prepend(doneRow);

        }
    });

    doneTasks.addEventListener('change', (e) => {
        if (e.target.classList.contains('uncheck-done')) {
            const row = e.target.closest('tr');
            const taskDescription = row.children[1].textContent;

            const task = currentProfile.tasks.done.find(task => task.description === taskDescription);
            currentProfile.tasks.done = currentProfile.tasks.done.filter(t => t !== task);
            currentProfile.tasks.toDo.push(task);

            row.remove();
            saveTasks();

            const toDoRow = createTaskRow(task, false);
            toDoTasks.appendChild(toDoRow);
            sortTasksByPriority();
        }
    });







    deleteAllButton.addEventListener('click', () => {
        if (confirm('Apakah anda yakin ingin menghapus semua agenda?')) {
            currentProfile.tasks.toDo = [];
            currentProfile.tasks.done = [];
            saveTasks();
            loadTasks();
        }
    });







    logoutButton.addEventListener('click', () => {
        saveTasks();
        currentProfile = null;
        appPage.style.display = 'none';
        profileSelection.style.display = 'block';
    });

    loadProfiles();
});