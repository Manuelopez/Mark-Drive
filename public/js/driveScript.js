const socket = io();
mermaid.initialize({ startOnLoad: false });
marked.setOptions({
  gfm: true,
  breaks: true
});

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
const $markedContainer = document.getElementById('markedContainer');
let renderDELTA = 0;

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

loadPage().then((data) => {
  socket.emit('join', { username, room }, (error) => {
    if (error) {
      alert(error);
      location.href = '/home.html';
    }
  });
});

// socketIO
socket.on('getData', (data) => {
  socket.emit('recentData', $noteBody.value, room);
});

socket.on('contentData', ({ editorData }) => {
  const cursor = $noteBody.selectionStart;
  $noteBody.value = editorData;
  $noteBody.selectionEnd = cursor;
  generateMarkedContent();
});

socket.on('roomData', ({ users }) => {
  $usersInRoom.innerHTML = '';
  for (let user of users) {
    const div = document.createElement('div');
    div.setAttribute('class', 'user');
    div.innerText = user.username;
    $usersInRoom.appendChild(div);
  }
});

$noteBody.oninput = function () {
  socket.emit('editorValue', $noteBody.value);
};

// INER HTML FOR MARKED CONTENT

function generateMarkedContent() {
  let mermaid = generateMermaid($noteBody.value);
  let content = mermaid[0];
  let math = generateMath(content);
  content = marked(math[0]);

  for (let y of mermaid[1]) {
    content = content.replace('MARKDRIVEMERMAIDAPI', y);
  }
  for (let y of math[1]) {
    content = content.replace('MARKDRIVEMATHAPI', y);
  }
  $markedContainer.innerHTML = content;
}

function generateMermaid(sentence, array) {
  let x;
  let svg;
  let arr = [];
  if (array) {
    arr.push(...array);
  }
  if (sentence.match('```mermaid\n') && sentence.match('mermaid```')) {
    x = sentence.substring(
      sentence.indexOf('```mermaid'),
      sentence.indexOf('mermaid```')
    );

    x = x.replace('```mermaid', '');
    try {
      svg = renderMermaid(x.replace(/^\s+|\s+$/g, ''));
    } catch (e) {
      return [sentence, []];
    }

    arr.push(svg);

    x = sentence.replace(
      '```mermaid' + x + 'mermaid```',
      'MARKDRIVEMERMAIDAPI'
    );

    return generateMermaid(x, arr);
  } else {
    return [sentence, arr];
  }
}

function renderMermaid(x) {
  renderDELTA++;
  let svgA;
  try {
    mermaid.render('GRAPH' + renderDELTA, x, function (svgCode) {
      svgA = svgCode;
    });
  } catch (e) {
    return 'GRAPH DEFF INCORRECT';
  }
  return svgA;
}

function generateMath(sentence, array) {
  let x;
  let svg;
  let arr = [];
  if (array) {
    arr.push(...array);
  }
  if (sentence.match('```math\n') && sentence.match('math```')) {
    x = sentence.substring(
      sentence.indexOf('```math'),
      sentence.indexOf('math```')
    );

    x = x.replace('```math', '');
    try {
      svg = renderMath(x.replace(/^\s+|\s+$/g, ''));
    } catch (e) {
      return [sentence, []];
    }

    arr.push(svg);

    x = sentence.replace('```math' + x + 'math```', 'MARKDRIVEMATHAPI');

    return generateMath(x, arr);
  } else {
    return [sentence, arr];
  }
}

function renderMath(x) {
  return katex.renderToString(x, {
    throwOnError: false
  });
}
