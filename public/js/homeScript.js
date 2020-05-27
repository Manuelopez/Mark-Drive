//divs
const $userDiv = document.getElementById('userDiv');
const $notesArrDiv = document.getElementById('notesArrDiv');
const $sharedArrDiv = document.getElementById('sharedArrDiv');

//user inputs
const $form = document.getElementById('noteCreate');
const $noteTitle = document.getElementById('noteTitle');
const $logout = document.getElementById('logoutID');
const $logoutAll = document.getElementById('logoutAllID');
const $noteType = document.getElementById('selectID');

//constant
let USERNAME;
let EMAIL;
const TOKEN = localStorage.getItem('markDriveToken');

loadPage();
async function loadPage() {
  const data = {
    method: 'GET',
    headers: {
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
  const name = document.createElement('h1');
  USERNAME = user.user.name;
  EMAIL = user.user.email;
  name.innerText = user.user.name;
  const email = document.createElement('h3');
  $userDiv.appendChild(name);

  $userDiv.appendChild(email);
}

function loadNotesData(notes, shared) {
  if (!shared) {
    for (let note of notes) {
      createNoteDiv(note, note.nType);
    }
  } else {
    for (let note of notes) {
      createShareNoteDiv(note, note.nType);
    }
  }
}

function createShareNoteDiv(note, nType) {
  let linkElement = '/drive.html?';
  const div = document.createElement('div');
  div.setAttribute('class', 'note');
  div.id = `div${note._id}`;
  if (nType != 'note') {
    div.setAttribute('class', 'note slides');
    linkElement = '/driveSlides.html?';
  }

  const a = document.createElement('a');
  a.innerText = note.title;
  const link = btoa(`id=${note._id}&name=${EMAIL}`);
  a.href = `${linkElement + link}`;
  a.setAttribute('class', 'dropbtn');

  const share = document.createElement('button');
  share.innerText = 'Share';
  share.id = note._id;
  share.onclick = shareNote;

  const unfollow = document.createElement('button');
  unfollow.innerText = 'Unfollow';
  unfollow.id = note._id;
  unfollow.onclick = unfollowShareNote;

  const drop = document.createElement('div');
  drop.setAttribute('class', 'dropContent');
  drop.append(share);
  drop.append(unfollow);

  div.appendChild(a);
  div.appendChild(drop);

  $sharedArrDiv.appendChild(div);
}

function createNoteDiv(note, nType) {
  let linkElement = '/drive.html?';
  const div = document.createElement('div');
  div.setAttribute('class', 'note');
  div.id = `div${note._id}`;

  if (nType != 'note') {
    linkElement = '/driveSlides.html?';
    div.setAttribute('class', 'note slides');
  }

  const a = document.createElement('a');
  a.innerText = note.title;
  const link = btoa(`id=${note._id}&name=${EMAIL}`);
  a.href = `${linkElement + link}`;
  a.setAttribute('class', 'dropbtn');

  const del = document.createElement('button');
  del.innerText = 'Delete';
  del.id = note._id;
  del.onclick = deleteNote;

  const share = document.createElement('button');
  share.innerText = 'Share';
  share.id = note._id;
  share.onclick = shareNote;

  const unshare = document.createElement('button');
  unshare.innerText = 'Unshare';
  unshare.id = note._id;
  unshare.onclick = removeShareOwned;

  const unshareAll = document.createElement('button');
  unshareAll.innerText = 'Unshare All';
  unshareAll.id = note._id;
  unshareAll.onclick = removeAllShare;

  const drop = document.createElement('div');
  drop.setAttribute('class', 'dropContent');
  drop.appendChild(share);
  drop.appendChild(unshare);
  drop.appendChild(unshareAll);
  drop.appendChild(del);

  div.appendChild(a);

  div.appendChild(drop);

  // div.appendChild(document.createElement('br'));
  $notesArrDiv.appendChild(div);
}

async function removeAllShare() {
  const data = {
    method: 'POST',
    headers: {
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
    body: JSON.stringify({ title: $noteTitle.value, nType: $noteType.value })
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

async function logoutUser() {
  const data = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  };
  try {
    const response = await fetch('/users/logout', data);
    if (response.ok) {
      localStorage.removeItem('markDriveToken');
      return (location.pathname = '/');
    }
  } catch (error) {
    console.log('Error occuerd');
  }
}

async function logoutAllUser() {
  const data = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  };
  try {
    const response = await fetch('/users/logoutAll', data);
    if (response.ok) {
      localStorage.removeItem('markDriveToken');
      return (location.pathname = '/');
    }
  } catch (error) {
    console.log('Error occuerd');
  }
}

$form.addEventListener('submit', (event) => {
  event.preventDefault();
  createNote();
});

$logout.addEventListener('click', () => {
  logoutUser();
});

$logoutAll.addEventListener('click', () => {
  logoutAllUser();
});
