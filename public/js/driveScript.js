// CONSTANTS
let queryString;
try {
  queryString = new URLSearchParams(atob(location.search.substring(1)));
} catch (error) {
  location.pathname = '/';
}
const TOKEN = localStorage.getItem('markDriveToken');
const NOTEID = queryString.get('id');
const USERNAME = queryString.get('name');

//USER INPUTS
const $noteTitle = document.getElementById('noteTitle');
const $noteBody = document.getElementById('noteBody');
const $saveNote = document.getElementById('saveNote');

loadPage();
async function loadPage() {
  const data = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  };
  try {
    const response = await fetch(`/notes/${NOTEID}`, data);
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
