const body = document.querySelector('body');

const footerElement = `
  <footer>
    <h4>Powered by</h4>
    <p>
      <a href="https://github.com/EmilNilsson12/newsletter-backend"><img width="100" src="./imgs/heroku-logo_200pxh.png"></a>
    </p>
    <p>
      <a href="https://github.com/EmilNilsson12/newsletter-backend"><img width="100" src="./imgs/mongoDB-logo_200pxh.png"></a>
    </p>
    <p>
      <a href="https://github.com/EmilNilsson12/newsletter-frontend"><img width="100" src="./imgs/github-pages-logo.png"></a>
    </p>
  </footer>
  `;

// Check if someone is logged in
let aUserIsLoggedIn = localStorage.getItem('loggedInUser');
if (aUserIsLoggedIn) {
  loadSettingsPage();
} else {
  loadLoginPage();
}

function loadLoginPage() {
  body.innerHTML = `
    <header>
      <h1>Nyhetsbrevtjänsten</h1>
      <p>Välkommen till Nyhetsbrevtjänsten</p>
      <p>Vårt mål är att samla alla dina prenumerationer på ett ställe. Våran <strong>intuitiva inställningspanel</strong> gör det enklare än någonsin att se över alla dina inställningar på en gång.</p>
    </header>
    <main id="guest-page">
      <div>
        <h2>Registera dig:</h2>
        <form id="register-form" onsubmit="event.preventDefault()">
          <div class="input-fields">
            <div>
              <label for="email">Email</label>
              <label for="password">Lösenord</label>
              <label for="password-confirm">Bekräfta lösenord</label>
              <label for="subscribe">Prenumerera</label>
            </div>
            <div>
              <input
                type="email"
                name="email"
                id="email-reg"
                placeholder="example@site.com"
                required
              />
              <input
                type="password"
                name="password"
                id="password-reg"
                required
              />
              <input
                type="password"
                name="password-confirm"
                id="password-confirm"
                required
              />
              <input
                type="checkbox"
                name="subscribe"
                id="subscribe"
              />
            </div>
          </div>
          <input type="submit" value="Registrera dig" />
          <div id="feedback-reg"></div>
        </form>
      </div>
      <div>
        <h2>Logga in:</h2>
        <form id="login-form" onsubmit="event.preventDefault()">
          <div class="input-fields">
            <div>
              <label for="email">Email</label>
              <label for="password">Lösenord</label>
            </div>
            <div>
              <input
                type="email"
                name="email"
                id="email-login"
                placeholder="example@site.com"
                required
              />
              <input
                type="password"
                name="password"
                id="password-login"
                required
              />
            </div>
          </div>
          <input type="submit" value="Logga in" />
          <div id="feedback-login"></div>
        </form>
      </div>
    </main>
    ${footerElement}`;

  const regForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

  regForm.addEventListener('submit', () => {
    if (
      document.getElementById('password-reg').value ===
      document.getElementById('password-confirm').value
    ) {
      let newUser = {
        email: document.getElementById('email-reg').value,
        password: document.getElementById('password-reg').value,
        subscribed: document.getElementById('subscribe').checked,
      };

      fetch('https://emils-mi-newsletter.herokuapp.com/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })
        .then((res) => res.json())
        .then((data) => {
          if (typeof data == 'string') {
            document.getElementById('feedback-reg').innerHTML = data;
          } else {
            document.getElementById(
              'feedback-reg'
            ).innerHTML = `The user "${data.email}" is now registered!`;

            // Fill login-form with values from reg-form
            document.getElementById('email-login').value = document.getElementById(
              'email-reg'
            ).value;
            document.getElementById('password-login').value = document.getElementById(
              'password-reg'
            ).value;

            // Call login function
            login();
          }
        });
    } else {
      document.getElementById('feedback-reg').innerHTML = 'Passwords have to match!';
    }
  });

  loginForm.addEventListener('submit', login);
  function login() {
    let allegedUser = {
      email: document.getElementById('email-login').value,
      password: document.getElementById('password-login').value,
    };

    fetch('https://emils-mi-newsletter.herokuapp.com/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(allegedUser),
    })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data == 'string') {
          document.getElementById('feedback-login').innerHTML = data;
        } else {
          localStorage.setItem('loggedInUser', JSON.stringify(data));
          loadSettingsPage();
        }
      });
  }
}

function loadSettingsPage() {
  let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  body.innerHTML = `
    <header>
      <h1>Inställningar</h1>
      <p>Välkommen <strong>${loggedInUser.email}</strong>!</p>
    </header>
    <main id="settings-page">
      <form id="user-settings" onsubmit="event.preventDefault()">
        <h2>Vill du prenumerera på vårt nyhetsbrev?</h2>
        <div>
          <label for="newsletter">Prenumererad</label>
          <input type="checkbox" name="newsletter" id="newsletter"/>
        </div>
        <div>
          <input type="submit" value="Spara dessa inställningar">
          <span id="settings-feedback">
          </span>
        </div>
      </form>
      <div>
        <button id="logout">Logga ut</button>
      </div>
    </main>
    ${footerElement}`;

  let userSettings = {
    id: loggedInUser.id,
  };

  if (loggedInUser.subscribed) {
    document.getElementById('newsletter').checked = true;
  }

  document.getElementById('user-settings').addEventListener('submit', () => {
    document.getElementById('settings-feedback').innerHTML = '';
    userSettings.subscribed = document.getElementById('newsletter').checked;
    fetch('https://emils-mi-newsletter.herokuapp.com/users/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userSettings),
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById('settings-feedback').innerHTML = 'Settings saved!';
      });
  });

  document.getElementById('logout').addEventListener('click', () => {
    localStorage.clear();
    loadLoginPage();
  });
}
