var questions = [
  "Dit is voor lol en de eigenaar is niet verantwoordelijk voor enige schade. Ga je hiermee akkoord? (Typ 'ja' om door te gaan):",
  "Weet je zeker dat je door wilt gaan? (Typ 'ja' om door te gaan, 'nee' om te annuleren):"
];

var typingSpeed = 50;
var logoutSites = null;

function typeQuestion() {
  var currentQuestion = localStorage.getItem('currentQuestion');
  var questionNumber = currentQuestion === null ? 0 : parseInt(currentQuestion);
  var question = questions[questionNumber];
  
  var shell = document.getElementById('shell');
  var inputField = "<input type='text' id='input' onkeyup='checkInput(event)'>";
  var prompt = "<span class='prompt'>user@website:</span> ";

  shell.innerHTML += "<p class='question'>" + prompt + "</p>";

  var questionElement = document.createElement('p');
  questionElement.className = 'question';
  shell.appendChild(questionElement);

  var i = 0;
  var interval = setInterval(function() {
      if (i < question.length) {
          questionElement.innerHTML += question.charAt(i);
          i++;
      } else {
          clearInterval(interval);
          questionElement.innerHTML += inputField;
          document.getElementById('input').focus();
      }
  }, typingSpeed);
}

function checkInput(event) {
  if (event.key === 'Enter') {
      var input = document.getElementById('input').value.trim().toLowerCase();

      if (input === 'ja') {
          var currentQuestion = localStorage.getItem('currentQuestion');
          var questionNumber = currentQuestion === null ? 0 : parseInt(currentQuestion);
          
          if (questionNumber < questions.length - 1) {
              questionNumber++;
              localStorage.setItem('currentQuestion', questionNumber);
              document.getElementById('shell').innerHTML = '';
              typeQuestion();
          } else {
              document.getElementById('shell').innerHTML += "<p>Doorgaan...</p>";
              logoutFromAllSites();
          }
      } else if (input === 'nee') {
          document.getElementById('shell').innerHTML += "<p>Actie geannuleerd.</p>";
      } else {
          document.getElementById('shell').innerHTML += "<p>Ongeldige invoer. Typ 'ja' om door te gaan, 'nee' om te annuleren.</p>";
      }
  }
}

function logoutFromAllSites() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        logoutSites = JSON.parse(xhr.responseText).logout_sites;
        logoutNextSite();
      } else {
        console.error('Fout bij laden van de configuratie. Statuscode: ' + xhr.status);
      }
    }
  };

  // Laad de logout informatie uit het JSON-bestand
  xhr.open('GET', 'config.json', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send();
}

function logoutNextSite() {
  if (!logoutSites || Object.keys(logoutSites).length === 0) {
    return;
  }
  
  var siteName = Object.keys(logoutSites)[0];
  var logoutUrl = logoutSites[siteName];
  
  document.getElementById('shell').innerHTML += "<p>Uitloggen bij " + siteName + "...</p>";
  
  // Open een nieuw tabblad om uit te loggen
  var newTab = window.open(logoutUrl, '_blank');
  
  // Wacht 2 seconden en sluit het nieuwe tabblad
  setTimeout(function() {
    newTab.close();
    document.getElementById('shell').innerHTML += "<p>" + siteName + " uitgelogd.</p>";
    
    // Verwijder de verwerkte site uit de lijst
    delete logoutSites[siteName];
    
    // Ga door met uitloggen bij de volgende site
    logoutNextSite();
  }, 2000);
}

// Start het vraag- en uitlogproces
typeQuestion();
