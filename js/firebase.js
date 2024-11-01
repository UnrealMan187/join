const FIREBASE_URL = "https://join-4d42f-default-rtdb.europe-west1.firebasedatabase.app/";
let users = [];
let tasks = [];
let accounts = [];
let login = [];
let currentUser = -1;
let currentId = -1;

 /*
 ** routes user to login html (or to summary if user already logged in)
 */

function indexHtmlInit() {
  // Hier noch eine if Abfrage einbauen: wenn User bereits eingeloggt ist, verlinke direkt zu summary.html, ansonsten zu login.html
  window.location.href = "login.html"
}

 /*
 ** load users from firebase
 */

async function loadUsers(path = "/users") {
  users = [];
  let userResponse = await fetch(FIREBASE_URL + path + ".json");
  let responseToJson = await userResponse.json();

  if (responseToJson) {
    Object.keys(responseToJson).forEach((key) => {
      users.push({
        id: key,
        name: responseToJson[key]["name"],
        email: responseToJson[key]["email"],
        phone: responseToJson[key]["phone"],
      });
    });
    users.sort((a, b) => {
      return a.name.localeCompare(b.name); // sortiere users nach dem Wert "name"
    });
  }
}

 /*
 ** load tasks from firebase
 */

async function loadTasks(path = "/tasks") {
  tasks = [];
  let userResponse = await fetch(FIREBASE_URL + path + ".json");
  let responseToJson = await userResponse.json();

  if (responseToJson) {
    Object.keys(responseToJson).forEach((key) => {
      tasks.push({
        id: key,
        title: responseToJson[key]["title"],
        description: responseToJson[key]["description"],
        date: responseToJson[key]["date"],
        category: responseToJson[key]["category"],
        priority: responseToJson[key]["priority"],
        level: responseToJson[key]["level"],
        subtasks: responseToJson[key]["subtasks"],
        assigned: responseToJson[key]["assigned"],
      });
    });
  }
}

 /*
 ** save task function
 */

async function saveTasks(path = "", data = {}) {
  await fetch(FIREBASE_URL + path + ".json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

 /*
 ** edit task function
 */

async function editTask(id, data = {}) {
  await fetch(FIREBASE_URL + `/tasks/${id}` + ".json", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

 /*
 ** delete task function
 */

async function deleteTask(id) {
  if (id == -1) {
    return;
  }
  await fetch(FIREBASE_URL + `/tasks/${id}` + ".json", {
    method: "DELETE",
  });

  window.location.href = "board.html";
}

 /*
 ** login user (check password also)
 */

async function loginUser() {
  let userEmail = document.getElementById("userEmail").value;
  let userPassword = document.getElementById("userPassword").value;

  await loadAccounts();

  for(let i = 0; i < accounts.length; i++) {
    if(accounts[i].email == userEmail) {
      if(accounts[i].password == userPassword) {
        alert("LOGIN ERFOLGREICH");
        window.location.href = "board.html";
        break;        
      }
    }
  }
}

 /*
 ** sign up user (also check if user/email already exists)
 */

async function signUpUser(data = {}) {
  let stopSignUp = false;
  await loadAccounts();

  for (let i = 0; i < accounts.length; i++) {
    if (accounts[i].email == data.email) {
      alert("Zu dieser E-Mail-Adresse besteht bereits ein Account. Passwort vergessen? Selber schuld!");
      stopSignUp = true;
    }
  }

  if (stopSignUp == false) {
    await fetch(FIREBASE_URL + "/login" + ".json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }
}

 /*
 ** load accounts from firebase
 */

async function loadAccounts() {
  accounts = [];
  let userResponse = await fetch(FIREBASE_URL + "/login" + ".json");
  let responseToJson = await userResponse.json();

  if (responseToJson) {
    Object.keys(responseToJson).forEach((key) => {
      accounts.push({
        id: key,
        name : responseToJson[key]["name"],
        email: responseToJson[key]["email"],
        password: responseToJson[key]["password"],
      });
    });
  }
}

 /*
 ** register user function (also check if passwords are both same while creating)
 */

async function registerUser() {
  let signUpName = document.getElementById("fullName").value.trim();
  let signUpEmail = document.getElementById("userEmail").value.trim();
  let signUpPassword = document.getElementById("userPassword").value.trim();
  let signUpPassword2 = document.getElementById("confirmPassword").value.trim();

  let loginData = { name: signUpName, email: signUpEmail, password: signUpPassword };

  if(signUpPassword == signUpPassword2) {
    await signUpUser(loginData);
    window.location.href = "login.html";
  } else {
    alert("PASSWORTEINGABEN UNGLEICH");
  }
}

 /*
 ** add user function & save on firebase & load users new into array (sorted)
 */

async function addUser() {
  let nameValue = document.getElementById("name").value;
  let phoneValue = document.getElementById("phone").value;
  let emailValue = document.getElementById("email").value;
  let newUser = { name: nameValue, email: emailValue, phone: phoneValue };
  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("email").value = "";
  await postData("/users", newUser);
  await renderContacts();
}

 /*
 ** save data into firebase
 */

async function postData(path = "", data = {}) {
  await fetch(FIREBASE_URL + path + ".json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}


/*
** id = path in firebase. delete user function. also checks if user is integrated into tasks, which has to be removed before deleting
** save in firebase, load users new (sorted)
*/

async function deleteUser(id) {
  await loadTasks("/tasks");
  let stopDelete = false;

  for (let i = 0; i < users.length; i++) {
    if (users[i].id == id) {
      for (let j = 0; j < tasks.length; j++) {
        if (tasks[j].assigned.includes(users[i].name)) {
          alert("Bitte entferne den User aus allen Tasks vor dem Löschen.");
          stopDelete = true;
          break;
        }
      }
    }
  }

  if (stopDelete == false) {
    await fetch(FIREBASE_URL + `/users/${id}` + ".json", {
      method: "DELETE",
    });
    await renderContacts();
    loadUserInformation(-1);
  }
}

 /*
 ** edit user function, save in firebase and load users new into array (sorted)
 */

async function editUser(id, data = {}) {
  data.name = document.getElementById("name").value;
  data.email = document.getElementById("email").value;
  data.phone = document.getElementById("phone").value;

  await fetch(FIREBASE_URL + `/users/${id}` + ".json", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  await renderContacts();
  loadUserInformation(currentUser);
  closePopup();
}

 /*
 ** get user id, compare users via mail, because there might be 2 persons with the same name
 */

function getUserId(email) {
  if (users.length > 0) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].email == email) {
        return users[i].id;
      }
    }
  } else {
    return -1; // Default Value -1 means User not found
  }
}

/*
** template for creating contact into contact list
*/

function contactTemplate(i, j) {
  return `<div id="user-container${i}">
            <div id="contact-containerID" class="contact-container" onclick="loadUserInformation(${i}); hideContactsListInResponsiveMode()">
            <div class="contact-list-ellipse">
               <div id="userColor${i}" class="ellipse-list initialsColor${j}">${getUserInitials(users[i].name)}</div>
            </div>
            <div class="contact">
                <div class="contact-list-name" id="contactName">${users[i].name}</div>
                <div class="contact-list-email" id="contactEmail">${users[i].email}</div>
            </div>
            </div>
            </div>
            `;
}

/*
** renders via templates the Contacts into the contact-list incl. the sorter-div/seperator
*/
  
async function renderContacts() {
  let html = "";
  let firstLetter = "0";
  let j = 1;

  await loadUsers("/users");

  for (let i = 0; i < users.length; i++) {
    if (users[i].name[0].toUpperCase() != firstLetter.toUpperCase()) {
      html += `<div class="contacts-first-letter-container"><span id="firstLetterOfContactName" class="contacts-first-letter">${users[
        i
      ].name[0].toUpperCase()}</span></div>
              <div class="border-container"> <div class="border"></div></div>`;

      firstLetter = users[i].name[0].toUpperCase();
    }

    html += contactTemplate(i, j);

    j++;
    if (j > 15) {
      j = 1;
    }
  }

  document.getElementById("contact-list").innerHTML = html;
}

/**
 * filters the first Letter (to upper case) from every word(name)
 * gets first Letter from first Name and first Letter from last Name
 */
function getUserInitials(username) {
  let result = username.trim().split(" ").map((wort) => wort[0].toUpperCase());

  if (username.split(" ").length > 1) {
    result = result[0] + result[result.length - 1];
  } else {
    result = result[0];
  }
  return result;
}

 /*
 ** load user information into user container
 */

async function loadUserInformation(id) {
  document.getElementById("contact-name").innerHTML = id == -1 ? "" : users[id].name;
  document.getElementById("contact-email").innerHTML = id == -1 ? "" : users[id].email;
  document.getElementById("contact-phone").innerHTML = id == -1 ? "" : users[id].phone;
  document.getElementById("ellipse").innerHTML = id == -1 ? "" : getUserInitials(users[id].name);

  if (id == -1) {
    document.getElementById("display-contactID").classList.add("d-none");
  } else {
    document.getElementById("display-contactID").classList.remove("d-none");

    let userEllipseColor = document.getElementById(`userColor${id}`).className.split(" ")[1];

    document.getElementById("ellipse").className = `ellipse ${userEllipseColor}`;

    highlightUser(id);
  }
  currentUser = id;
}

 /*
 ** hide contacts list in responsive mode
 */

function hideContactsListInResponsiveMode() {
  if (window.innerWidth <= 768) {
    document.getElementById("contact-list").classList.add("d-none");
    document.getElementById("add-contact-containerID").style.display = "none";
    document.getElementById("back-arrow-on-responsiveID").classList.remove("d-none");
    showContactsInDetailInResponsiveMode();
  }
}

 /*
 ** show contacts in detail in responsive mode
 */

function showContactsInDetailInResponsiveMode() {
  document.getElementById("display-contact-headerID").style.display = "flex";
  document.getElementById("display-contactID").style.display = "flex";
}

 /*
 ** show contact list back again in responsive mode
 */

function showContactListAgainInResponsiveMode() {
  if (window.innerWidth <= 768) {
    document.getElementById("display-contact-headerID").style.display = "none";
    document.getElementById("display-contactID").style.display = "none";
    document.getElementById("contact-list").classList.remove("d-none");
    document.getElementById("add-contact-containerID").style.display = "flex";
    document.getElementById("back-arrow-on-responsiveID").classList.add("d-none");
  }
}

 /*
 ** change background on selected user
 */

function changeBgOnSelectedUser(id) {
  document.getElementById("contact-containerID").classList.add("selected-user-color");
}

 /*
 ** initialize contacts
 */

async function initContacts() {
  await renderContacts();
  loadUserInformation(-1);
}

 /*
 ** highlight user
 */

function highlightUser(userIndex) {
  for (let i = 0; i < users.length; i++) {
    document.getElementById(`user-container${i}`).classList.remove("highlightUser");
  }
  document.getElementById(`user-container${userIndex}`).classList.add("highlightUser");
}
