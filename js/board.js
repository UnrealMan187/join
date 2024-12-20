// Funktion zum Hinzufügen der Drag-and-Drop-Events
function addDragAndDropEvents() {
  const draggedCards = document.querySelectorAll('.taskCard');
  const dropZones = document.querySelectorAll('#cardContainertoDo, #cardContainerinProgress, #cardContainerawaitingFeedback, #cardContainerdone');

  draggedCards.forEach(card => {
      card.ondragstart = (event) => {
          // Die ID des zu ziehenden Elements wird in den Datenübertragungsobjekt gespeichert
          event.dataTransfer.setData("text", event.target.id);
      };
  });

  dropZones.forEach(zone => {
      zone.ondragover = (event) => {
          event.preventDefault();
          event.currentTarget.style.backgroundColor = "#1FD7C1";
      };

      zone.ondragleave = (event) => {
          event.currentTarget.style.backgroundColor = ""; // Zurücksetzen des Hintergrunds
      };

      zone.ondrop = (event) => {
          event.preventDefault();
          event.currentTarget.style.backgroundColor = ""; // Zurücksetzen des Hintergrunds
          const data = event.dataTransfer.getData("text");
          const card = document.getElementById(data);
          event.currentTarget.appendChild(card);

          let newLevel = event.currentTarget.id;

          if(newLevel.includes("cardContainertoDo")) { newLevel = "To do"; }
          if(newLevel.includes("cardContainerinProgress")) { newLevel = "In Progress"; }
          if(newLevel.includes("cardContainerawaitingFeedback")) { newLevel = "Awaiting Feedback"; }
          if(newLevel.includes("cardContainerdone")) { newLevel = "Done"; }

          let taskNr = data.split("-")[1];

          tasks[taskNr].level = newLevel;

          editTask(tasks[taskNr].id, tasks[taskNr]);
          loadTasks("/tasks");
          
      };
  });
}

function editPopupTask()
{
  document.getElementById('editPopUpID').innerHTML =`
         <div class="editClosePopupMainContainer">
            <img onclick="closeDialog()" id="closePopupID" src="./img/close.svg" alt="">
        </div>
      
      <div class="scrollbar">
          <div class="editPopupTitelMainContainer">
            <span class="editPopupTitelTxt">Title</span>
            <input id="" class="editTitelInput" type="text">
          </div>

          <div class="editPopupDescriptionMainContainer">
            <span class="editPopupDescriptionTxt">Description</span>
            <input class="editDescriptionInput" type="text">
          </div>
            
            <div class="editPopupDateMainContainer">
              <p class="editPopupDateTxt">Due date</p>
              <input class="editDateInput" type="date">
            </div>

            <div class="editPrio">
              <label>Prio</label>
              <div class="buttons-prio">
                <button onclick="clickOnUrgent()" type="button" id="urgent" class="btn-prio btn-prio:hover">
                  Urgent<img id="urgentID" src="./img/urgent.svg" class="">
                        <img id="urgent-whiteID" class="d-none" src="./img/urgent-white.svg">
                </button>
                <div class="">
                <button onclick="clickOnMedium()" type="button" id="medium" class="btn-prio btn-bg-change-medium-onclick prio-txt-color-set-white" style="box-shadow: none;">
                  Medium<img id="mediumID" src="./img/medium.svg" class="d-none">
                  <img id="medium-whiteID" class="" src="./img/medium-white.svg">
                </button>
              </div>
                <button onclick="clickOnLow()" type="button" id="low" class="btn-prio">
                  Low<img id="lowID" src="./img/low.svg" class="">
                  <img id="low-whiteID" class="d-none" src="./img/low-white.svg">
                </button>
              </div>
            </div>
            <!-- Begin Assigned to  -->
            <div class="editPopupAssignedToMainContainer">
              <p class="editAssignedToTxt">Assigned to</p>
              <div class="editDropdown">
                <div id="contacts-list" class="select assigned-to" onclick="toggleDropdown()">
                  <input class="select-input placeholder" type="text" placeholder="Select contacts to assign" readonly/>
                  <span class="down-arrow">
                    <img src="img/arrow_drop_downaa.svg" alt="">
                  </span>
                </div>
                <div id="selected-contacts-container" class="selected-contacts"></div>
                <!-- Begin Contacts Assigned to-->
                <ul id="myDropdown" class="dropdown-content "></ul>
                <!-- End Contacts Assigned to-->
                <div class="selected-contacts"></div>
              </div>
            </div>
            <!-- End Assigned to -->

            <!--Begin subtask-->
            <div class="editPopupSubtasksMainContainer">
              <p class="editPopupSubtasksTxt">Subtask</p>
              <div class="input-container-subtask">
                <input class="input subtask" type="text" placeholder="Add new subtask" />
                <div class="btn-subtask add">
                  <img src="./img/add.png" alt="Add" />
                </div>
                <div class="btn-subtask check-cancel">
                  <div class="cancel-subtask">
                    <img src="./img/close.png" alt="Cancel" />
                  </div>
                  <div class="divider-subtask"></div>
                  <div class="check-subtask">
                    <img src="./img/check.png" alt="Check" />
                  </div>
                  </div>
              </div>
                <div class="container-subtasks-display">
                    <ul id="subtaskList" class="list-subtasks"></ul>
                </div>
            </div>
      </div>
          <div class="okButtonMainContainer" >
            <button class="okButtonOnEditPopUp">OK</button>
          </div>`
}

function openDialog() {
  document.getElementById("popupOnTaskSelectionID").style.visibility = "visible";
}
function closeDialog() {
  document.getElementById("popupOnTaskSelectionID").style.visibility = "hidden";
}

function popupValueImplementFromTask()
{   
    let titelCardInput = document.getElementById('titelCardID').innerHTML;
    let descriptionCard = document.getElementById('descriptionCardID').innerHTML;
    let contactEllipse = document.getElementById('profileBadges').innerHTML;
    
    let valueFromTask = document.getElementById('popupHeaderID');
    valueFromTask.innerHTML = titelCardInput;
    let valueFromdescription = document.getElementById('popupSpanID');
    valueFromdescription.innerHTML = descriptionCard;
    
    let valueFromEllipse = document.getElementById('popupContactEllipseID');
    valueFromEllipse.innerHTML = '';     
    valueFromEllipse.innerHTML += contactEllipse;

    let valueFromName = document.getElementById('popupContactNameID');
    
    valueFromName.innerHTML = '';   
     for(let i = 0; i < tasks.length; i++) {
      if(tasks[i].title == titelCardInput) {
         let assignedNames = tasks[i].assigned.split(",");

         currentId = tasks[i].id;

         document.getElementById("dateId").textContent = tasks[i].date;
         document.getElementById("prioId").textContent = tasks[i].priority;
         document.getElementById("prioIdImg").src = `./img/${tasks[i].priority.toLowerCase()}.svg`;

         for(let j = 0; j < assignedNames.length; j++) {
         valueFromName.innerHTML += `
             <div>${assignedNames[j]}</div>
             `;
         }

         }
      }

}

async function renderBadges() {
  await loadUsers("/users");

  let myBadges = document.getElementById("profileBadges");
  let j = 1;

  myBadges.innerHTML = "";

  for (let i = 0; i < users.length; i++) {
    myBadges.innerHTML += `
            <div class="badgeImg initialsColor${j}">${getUserInitials(users[i].name)}</div>
            `;

    j++;
    if (j > 15) {
      j = 1;
    }
  }

  renderTaskCards();
}
async function renderTaskCards() {
    await loadTasks("/tasks");
  
    document.getElementById("cardContainertoDo").innerHTML = "";
    document.getElementById("cardContainerinProgress").innerHTML = "";
    document.getElementById("cardContainerawaitingFeedback").innerHTML = "";
    document.getElementById("cardContainerdone").innerHTML = "";

  
    for (let i = 0; i < tasks.length; i++) {
      const uniqueId = `taskCard-${i}`;
      let assignedUsers = tasks[i].assigned.split(",");
      let subTasksArray = tasks[i].subtasks.split("|");
      let assignedUsersHTML = "";


      let cardContainerIdName = tasks[i].level;

      switch(cardContainerIdName) {
        case "To do":
          cardContainerIdName = "cardContainertoDo";
          break;
        case "In Progress":
          cardContainerIdName = "cardContainerinProgress";
          break;
        case "Awaiting Feedback":
          cardContainerIdName = "cardContainerawaitingFeedback";
          break;
        case "Done":
          cardContainerIdName = "cardContainerdone";
          break;
        default:
          cardContainerIdName = "";
          break;
      }
      

      for(j = 0; j < assignedUsers.length; j++) {

        for(c = 0; c < users.length; c++) {
          let cc = c + 1;

          while(cc > 15) { cc = cc - 15; }

          if(users[c].name == assignedUsers[j]) {
            assignedUsersHTML += `
            <div class="badgeImg initialsColor${cc}">${getUserInitials(assignedUsers[j])}</div>
            `;
            break;
          }
        }
      }
      document.getElementById(cardContainerIdName).innerHTML += `
                <div draggable="true" id="${uniqueId}" class="taskCard">
                <div class="taskCardTop">
                  <label class="categoryGreen">${tasks[i].category}</label>
                  <div class="dropdownCard">
                    <button onclick="toggleDropdown('dropdown-content')" class="dropdown-btn">
                      <div class="dropdownBtnContainer">
                        <img src="" alt="Dropdown Arrow">
                      </div>
                    </button>
                    <div id="dropdown-content" class="dropdown-content">
                      <p onclick="">In Progress</p>
                      <p onclick="">Done</p>
                      <p onclick="">Awaiting Feedback</p>
                    </div>
                  </div>
                </div>
                <div class="cardBody" onclick="openDialog(); popupValueImplementFromTask()">
                  <p id="titelCardID" class="titleCard">${tasks[i].title}</p>
                  <p id="descriptionCardID" class="descriptionCard">${tasks[i].description}</p>
                  <div>
                    <div class="progress">
                      <div class="progressBarContainer">
                        <div id="" class="progressBar" style="width: 50%;"></div>
                      </div>
                      <p class="amountSubtasks">${subTasksArray.length} subtask(s)</p>
                    </div>
                    <div class="footerCard">
                      <div id="profileBadges" class="profileBadges">
                        ${assignedUsersHTML}
                      </div>
                      <div class="prioImg">
                        <img src="./img/medium.svg" alt="">
                      </div>
                    </div>
                  </div>
                </div>
              </div>  
                  `;
    }
    // Drag-and-Drop-Events nach dem Rendern der Karten hinzufügen
    addDragAndDropEvents();
}

// Initiale Aufrufe
renderTaskCards();




/*AddTask Pop up*/

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.querySelector('dialog[data-modal]');
    const openModalButton = document.getElementById('openModal');
    const closeModalButton = document.getElementById('closeModal');
    const alsoOpenButtons = document.querySelectorAll('.alsoOpenModal'); // Alle Elemente mit der Klasse "alsobtn"


    if (modal && openModalButton && closeModalButton) {
        // Modal öffnen
        openModalButton.addEventListener('click', () => {
            modal.showModal();
        });

        alsoOpenButtons.forEach(button => {
            button.addEventListener('click', () => {
                modal.showModal();
            });
        });


        // Modal schließen
        closeModalButton.addEventListener('click', () => {
            modal.close();
        });

        // Optional: Modal schließen, wenn man außerhalb des Modals klickt
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.close();
            }
        });
    } else {
        console.error('Modal, Open Button, or Close Button not found in the DOM.');
    }
});

