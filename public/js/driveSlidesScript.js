const socket = io();

// CONSTANTS
let queryString;
try {
  queryString = new URLSearchParams(atob(location.search.substring(1)));
} catch (error) {
  location.pathname = '/';
}
const TOKEN = localStorage.getItem('markDriveToken');
const room = queryString.get('id');
const username = queryString.get('name');

//USER INPUTS
const $noteTitle = document.getElementById('noteTitle');
const $noteBody = document.getElementById('noteBody');
const $saveNote = document.getElementById('saveNote');
const $usersInRoom = document.getElementById('usersInRoom');

const $renderSlides = document.getElementById('slides');

loadPage().then((data) => {
  socket.emit('join', { username, room }, (error) => {
    if (error) {
      alert(error);
      location.href = '/home.html';
    }
  });
});

async function loadPage() {
  const data = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  };
  try {
    const response = await fetch(`/notes/${room}`, data);
    const responseData = await response.json();
    if (response.ok) {
      loadNote(responseData.note);
      return (document.body.style.opacity = '1');
    }
    location.pathname = '/home.html';
  } catch (error) {
    alert('error');
    location.pathname = '/home.html';
  }
}

function loadNote({ title, body }) {
  $noteTitle.value = title;
  $noteBody.value = body;
}

$saveNote.onclick = saveNote;
async function saveNote() {
  const data = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ title: $noteTitle.value, body: $noteBody.value })
  };

  try {
    await fetch(`/notes/${room}`, data);
  } catch (error) {
    alert(error);
  }
}

$renderSlides.addEventListener('click', () => {
  saveNote().then(() => {
    location.pathname = '/slides.html';
  });
});

// socketIO
socket.on('getData', (data) => {
  socket.emit('recentData', $noteBody.value, room);
});

socket.on('contentData', ({ editorData }) => {
  $noteBody.value = editorData;
});

socket.on('roomData', ({ users }) => {
  $usersInRoom.innerHTML = '';
  for (let user of users) {
    const div = document.createElement('div');
    div.innerText = user.username;
    $usersInRoom.appendChild(div);
  }
});

$noteBody.oninput = function () {
  socket.emit('editorValue', $noteBody.value);
};
