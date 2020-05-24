//divs
const $userDiv = document.getElementById('userDiv');
const $notesArrDiv = document.getElementById('notesArrDiv');
const $sharedArrDiv = document.getElementById('sharedArrDiv');

//user inputs
const $form = document.getElementById('noteCreate');
const $noteTitle = document.getElementById('noteTitle');

//constant
let USERNAME;
let EMAIL;

const TOKEN = localStorage.getItem('markDriveToken');

loadPage();
async function loadPage() {
  const data = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`
    }
  };
  try {
    const userResponse = await fetch('/users/me', data);
    const userResponseData = await userResponse.json();
    if (userResponseData.error) {
      return (location.pathname = '/');
    }
    const notesResponse = await fetch('/notes', data);
    const notesResponseData = await notesResponse.json();

    const sharedResponse = await fetch('/share/me', data);
    const sharedResponseData = await sharedResponse.json();

    loadUserData(userResponseData);
    loadNotesData(notesResponseData.note, false);
    loadNotesData(sharedResponseData.note, true);
    document.body.style.opacity = '1';
  } catch (error) {
    alert('error');
  }
}

function loadUserData(user) {
  const name = document.createElement('h3');
  USERNAME = user.user.name;
  EMAIL = user.user.email;
  name.innerHTML = 'Username: ' + user.user.name;
  const email = document.createElement('h3');
  email.innerHTML = 'Email: ' + user.user.email;
  $userDiv.appendChild(name);

  $userDiv.appendChild(email);
}

function loadNotesData(notes, shared) {
  if (!shared) {
    for (let note of notes) {
      const div = document.createElement('div');
      div.setAttribute('class', 'note');
      div.id = `div${note._id}`;

      const a = document.createElement('a');
      a.innerHTML = note.title;
      a.href = `/drive.html?id=${note._id}&name=${USERNAME}`;

      const del = document.createElement('button');
      del.innerHTML = 'Delete';
      del.id = note._id;
      del.onclick = deleteNote;

      const share = document.createElement('button');
      share.innerHTML = 'Share';
      share.id = note._id;
      share.onclick = shareNote;

      const unshare = document.createElement('button');
      unshare.innerHTML = 'Unshare';
      unshare.id = note._id;
      unshare.onclick = removeShareOwned;

      const unshareAll = document.createElement('button');
      unshareAll.innerHTML = 'Unshare All';
      unshareAll.id = note._id;
      unshareAll.onclick = removeAllShare;

      div.appendChild(a);
      div.appendChild(share);
      div.appendChild(unshare);
      div.appendChild(unshareAll);
      div.appendChild(del);

      div.appendChild(document.createElement('br'));
      $notesArrDiv.appendChild(div);
    }
  } else {
    for (let note of notes) {
      const div = document.createElement('div');
      div.setAttribute('class', 'note');
      div.id = `div${note._id}`;

      const a = document.createElement('a');
      a.innerHTML = note.title;
      a.href = `/drive.html?id=${note._id}&name=${USERNAME}`;

      const share = document.createElement('button');
      share.innerHTML = 'Share';
      share.id = note._id;
      share.onclick = shareNote;

      const unfollow = document.createElement('button');
      unfollow.innerHTML = 'Unfollow';
      unfollow.id = note._id;
      unfollow.onclick = unfollowShareNote;

      div.appendChild(a);
      div.append(share);
      div.append(unfollow);
      div.appendChild(document.createElement('br'));
      $sharedArrDiv.appendChild(div);
    }
  }
}

async function removeAllShare() {
  const data = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`
    }
  };
  try {
    const response = await fetch(`/share/removeAll/${this.id}`, data);
  } catch (error) {
    console.log('Error occuerd');
  }
}

async function removeShareOwned() {
  const unshareEmail = prompt('Eneter email to remove');
  const data = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ email: unshareEmail })
  };
  try {
    const response = await fetch(`/share/remove/${this.id}`, data);
  } catch (error) {
    console.log('Error occuerd');
  }
}

async function unfollowShareNote() {
  const data = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ email: EMAIL })
  };

  try {
    const response = await fetch(`/share/remove/${this.id}`, data);

    if (response.ok) {
      const div = document.getElementById(`div${this.id}`);
      div.parentNode.removeChild(div);
    }
  } catch (error) {
    console.log('error occuerd');
  }
}

async function shareNote() {
  const shareEmail = prompt('Enter email to share');
  const data = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ email: shareEmail })
  };
  try {
    const response = await fetch(`/share/${this.id}`, data);
  } catch (error) {
    console.log('Error occured');
  }
}

async function deleteNote() {
  const data = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`
    }
  };
  try {
    const response = await fetch(`/notes/${this.id}`, data);
    const responseData = await response.json();
    if (responseData.error) {
      return console.log('could not delete');
    }

    const div = document.getElementById(`div${this.id}`);
    div.parentNode.removeChild(div);
  } catch (error) {
    console.log('error occured');
  }
}

async function createNote() {
  const data = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`
    },
    body: JSON.stringify({ title: $noteTitle.value })
  };
  try {
    const response = await fetch('/notes', data);
    const responseData = await response.json();
    if (responseData.error) {
      return console.log('could not create Note');
    }
    loadNotesData([responseData.note]);
  } catch (error) {
    console.log('error occured');
  }
}

$form.addEventListener('submit', (event) => {
  event.preventDefault();
  createNote();
});
