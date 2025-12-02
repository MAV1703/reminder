//Получаем переменные
let add = document.querySelector('.add');
let taskNameInput = document.querySelector('.name');
let dayInput = document.querySelector('.day');
let monthInput = document.querySelector('.month');
let yearInput = document.querySelector('.year');
let taskList = document.querySelector('.taskList');
let rightPart = document.querySelector('.right-part-tasks');


//Загружаем список из локального хранилища при загрузке страницы
window.onload = function() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        addTaskToList(task);
        TaskFilter(task);
    });

};


//Функция для добавления задачи в список
function addTaskToList(obj){
    //создаем пункт списка
    let taskPlace = document.createElement('li');
    //Проверяем статус выполнения для корректного отображения
    if (obj.completeStatus == 1){
        taskPlace.classList.add('complete');
    }
    //флекс контейнер для имени задачи и даты
    let taskDescription = document.createElement('div');
    taskDescription.classList.add('flex');
    let taskName = document.createElement('p');
    taskName.textContent = obj.name;
    let taskDate = document.createElement('p');
    taskDate.textContent = obj.date;
    taskDescription.appendChild(taskName);
    taskDescription.appendChild(taskDate);
    taskPlace.appendChild(taskDescription);

    //Пусть при нажатии на имя или дату открывается возможность редактирования
    taskName.addEventListener('click', function rename(){
        let oldName = taskName.textContent;
        let oldDate = taskDate.textContent; 
        taskName.removeEventListener('click', rename);
        let newName = document.createElement('input');
        newName.value = taskName.textContent;
        taskName.textContent = '';
        taskName.appendChild(newName);
        newName.focus();
        newName.addEventListener('blur', ()=>{
            taskName.textContent = newName.value;
            taskName.addEventListener('click', rename);
            renameTaskInLocalStorage(oldName, oldDate, newName.value)
        })

    })

     taskDate.addEventListener('click', function rename(){
        let oldName = taskName.textContent;
        let oldDate = taskDate.textContent; 
        taskDate.removeEventListener('click', rename);
        let newDate = document.createElement('input');
        newDate.value = taskDate.textContent;
        taskDate.textContent = '';
        taskDate.appendChild(newDate);
        newDate.focus();
        newDate.addEventListener('blur', ()=>{
            taskDate.textContent = newDate.value;
            taskDate.addEventListener('click', rename);
            changeDateTaskInLocalStorage(oldName, oldDate, newDate.value);
            document.location.reload();
        })

    })
    
    //Создаем флекс контейнер с кнопками для изменения задачи
    let buttonsBlock = document.createElement('div');
    buttonsBlock.classList.add('flex');

    //Кнопка "редактировать" с обработчиком и стилизацией
    let editBtn = document.createElement('button');
    editBtn.textContent = "Переименовать";
    editBtn.addEventListener('click', 
        function rename(){
        taskName.removeEventListener('click', rename);
        let newName = document.createElement('input');
        newName.value = taskName.textContent;
        taskName.textContent = '';
        taskName.appendChild(newName);
        newName.focus();
        newName.addEventListener('blur', ()=>{
            taskName.textContent = newName.value;
            taskName.addEventListener('click', rename);
            renameTaskInLocalStorage(taskName.textContent, taskDate.textContent, newName.value)
        })
    });

    editBtn.classList.add('editBtn');

    //Кнопка "удалить" с обработчиком и стилизацией
    let removeBtn = document.createElement('button');
    removeBtn.textContent = "Удалить";
    removeBtn.addEventListener('click', ()=>{
        taskPlace.remove();
        removeTaskfromLocalStorage(taskName.textContent, taskDate.textContent);
    })
    removeBtn.classList.add('removeBtn');

    buttonsBlock.appendChild(editBtn);
    buttonsBlock.appendChild(removeBtn);
    taskPlace.appendChild(buttonsBlock);
    taskList.appendChild(taskPlace);

    
}

//Добавляем обработчик события на кнопку, сохраняем введенные данные в массив объектов
add.addEventListener('click', ()=>{
    if(taskNameInput.value && dayInput.value && monthInput.value && yearInput.value){
    let task = {name:taskNameInput.value,
                date:dayInput.value + '.' + monthInput.value + '.' +yearInput.value
                };
    addTaskToList(task);
    saveTaskToLocalStorage(task);
    document.location.reload();
    taskNameInput.value = '';
    dayInput.value = '';
    monthInput.value = '';
    yearInput.value = '';
    }

});

// Функция для сохранения задач в локальном хранилище
function saveTaskToLocalStorage(obj) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(obj);
    localStorage.setItem('tasks', JSON.stringify(tasks));

}


// Функция для переименования задач в локальном хранилище
function renameTaskInLocalStorage(oldName, oldDate, newName) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let index = tasks.findIndex(task => task.name === oldName && task.date === oldDate);
    if (index !== -1) {
        tasks[index].name = newName;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } 
}


//Функция для изменения даты задачи в локальном хранилище
function changeDateTaskInLocalStorage(oldName, oldDate, newDate) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let index = tasks.findIndex(task => task.name === oldName && task.date === oldDate);
    if (index !== -1) {
        tasks[index].date = newDate;
        localStorage.setItem('tasks', JSON.stringify(tasks));

    } 
}

// Функция для удаления задач из локального хранилища
function removeTaskfromLocalStorage(removename, removedate) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let index = tasks.findIndex(task => task.name === removename && task.date === removedate);
    if (index !== -1) {
        tasks.splice(index, 1);
        daysUntill(removedate);
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
}


//Функция для расчёта количества дней до срока выполнения задачи
function daysUntill(tasktargetDate){
    let today = new Date().getTime();
    let targetDateArr = tasktargetDate.split('.');
    let targetDate = new Date(targetDateArr[2], targetDateArr[1]-1, targetDateArr[0]).getTime();
    let diff = targetDate-today;
    let diffDays = Math.ceil(diff/60/60/24/1000);
    return diffDays;
    
}

//Функция для отбора задач, до которых осталось меньше 4 дней
function TaskFilter(obj){
    if(obj.completeStatus !=1){
        let daysTill = daysUntill(obj.date);
        if (daysTill <=3 ){
            let urgentlyTask = document.createElement('li');
            if(daysTill>=2) {
                urgentlyTask.style.color = 'rgb(107, 175, 6)';
                urgentlyTask.textContent = obj.name + ' - срок выполнения --- ' + obj.date + ` ---  Осталось ${daysUntill(obj.date)} д.`;
            } else if (daysTill<2 && daysTill>0){
                urgentlyTask.textContent = obj.name + ' - срок выполнения --- ' + obj.date + ` ---  Осталось ${daysUntill(obj.date)} д.`;
                urgentlyTask.style.color = 'rgb(255, 102, 0)';
            } else if (daysTill === 0) {
                urgentlyTask.textContent = obj.name + ' - срок выполнения --- ' + obj.date + ` ---  Осталось ${daysUntill(obj.date)} д.`;
            urgentlyTask.style.color = 'rgb(235, 68, 18)';
            } else if (daysTill<0) {
            urgentlyTask.textContent = obj.name + ' - срок выполнения --- ' + obj.date + ` ---  Задача просрочена.`;
            urgentlyTask.style.color = 'rgb(235, 68, 18)';
            }
            rightPart.appendChild(urgentlyTask);
            urgentlyTask.classList.add('urgently');

            //Добавляем кнопки к срочным задачам
            let buttons = document.createElement('div');

            //Кнопка "выполнено" с обработчиком и стилизацией
            let doneBtn = document.createElement('button');
            doneBtn.textContent = 'Выполнено';
            doneBtn.classList.add('doneBtn');
            doneBtn.addEventListener('click', ()=>{
                let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                 const index = tasks.findIndex(task => task.name === obj.name && task.date === obj.date); 
                 if (index !== -1) {
                    tasks[index].completeStatus = 1; 
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                   }
                urgentlyTask.remove();
                document.location.reload();
            })
       
            //Кнопка "отложить" с обработчиком и стилизацией
            let postponeBtn = document.createElement('button');
            postponeBtn.textContent = 'Отложить';
            postponeBtn.classList.add('postponeBtn');
            postponeBtn.addEventListener('click', ()=>{
                let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
                 const index = tasks.findIndex(task => task.name === obj.name && task.date === obj.date); 
                 if (index !== -1) {
                    tasks[index].postpone = 1; 
                    let oldDateArr = tasks[index].date.split('.');
                    oldDateArr[0] = +oldDateArr[0] + 4;
                    let newDate = oldDateArr.join('.');
                    tasks[index].date = newDate;
                    localStorage.setItem('tasks', JSON.stringify(tasks));
                    document.location.reload();
                   }
                urgentlyTask.remove();
                
            })
            
            //Собираем DOM
            buttons.appendChild(doneBtn);
            buttons.appendChild(postponeBtn);
            urgentlyTask.appendChild(buttons);

    
        }
    }
 }