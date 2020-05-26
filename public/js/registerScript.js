const $email = document.getElementById('emailID');
const $name = document.getElementById('nameID');
const $pass = document.getElementById('passID');
const $form = document.getElementById('formID');
if (localStorage.getItem('markDriveToken')) {
  loadPage();
}

async function loadPage() {
  const token = localStorage.getItem('markDriveToken');
  const data = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    }
  };
  try {
    const response = await fetch('/users/me', data);
    if (response.ok) {
      return (location.pathname = '/home.html');
    }
  } catch (error) {
    alert('error');
  }
}

async function signUP() {
  const userData = {
    email: $email.value,
    password: $pass.value,
    name: $name.value
  };
  const data = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  };
  try {
    const response = await fetch('/users', data);
    const responseData = await response.json();
    if (response.ok) {
      localStorage.setItem('markDriveToken', responseData.token);
      return (window.location.pathname = '/home.html');
    }
    console.log('error');
  } catch (error) {
    alert('error occuerd');
  }
}

$form.addEventListener('submit', (event) => {
  event.preventDefault();
  signUP();
});
