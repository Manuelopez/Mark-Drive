$source = document.getElementById('source');

let queryString;
try {
  queryString = new URLSearchParams(atob(location.search.substring(1)));
} catch (error) {
  location.pathname = '/';
}

const TOKEN = localStorage.getItem('markDriveToken');
const room = queryString.get('id');
const username = queryString.get('name');

loadPage().then((data) => {
  const slideshow = remark.create();
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
      return console.log();
    }
    location.pathname = '/home.html';
  } catch (error) {
    alert('error');
    location.pathname = '/home.html';
  }
}

function loadNote({ body }) {
  $source.innerHTML = body;
}
