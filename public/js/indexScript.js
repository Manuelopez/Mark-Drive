$email = document.getElementById('emailID');
$pass = document.getElementById('passID');
$form = document.getElementById('formID');

if (localStorage.getItem('markDriveToken')) {
  auth();
}

async function auth() {
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
    const responseData = await response.json();
    if (responseData.error) {
      return console.log('invalid token');
    }
    location.pathname = '/home.html';
  } catch (error) {
    alert('error');
  }
}

$form.addEventListener('submit', (event) => {
  event.preventDefault();
  loginUser();
});

async function loginUser() {
  const userData = { email: $email.value, password: $pass.value };
  const data = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  };
  try {
    const response = await fetch('/users/login', data);
    const responseData = await response.json();

    if (responseData.error) {
      alert('invalid credantials');
    } else {
      localStorage.setItem('markDriveToken', responseData.token);
      window.location.pathname = '/home.html';
    }
  } catch (error) {
    alert('error occuerd');
  }
}
