let whichPlayerTurn = document.getElementById("player-turn");
let gridCategoryBoxes = document.getElementsByClassName("grid-category");
let popUpBox = document.getElementById("overlay");
let popUpHeader = document.getElementById("popup-header");
let popUpContent = document.querySelector("#popup-content");
let answerForm = document.getElementById("answer-form");
let answerInput = document.getElementById("answer-input");
let betInput = document.getElementById("bet-input");
let submitButton = document.getElementById("submit-button");
let betButton = document.getElementById("bet-button");
let passButton = document.getElementById("pass-button");
let correctAnswerPrompt = document.getElementById("answer-correct");
let playerOneScoreDisplay = document.getElementById("player-one-score");
let playerTwoScoreDisplay = document.getElementById("player-two-score");
let finalCategoryTextBox = document.getElementById("final-category");
let finalQuestionTextBox = document.getElementById("final-question");
let notification = document.getElementById("notification");
let notification2 = document.getElementById("notification-two");
let scoreAvailableToBet = document.getElementById("score-to-bet");

let categoriesArray = [];
let firstRoundQuestionsArray = [];
let secondRoundQuestionsArray = [];
let lastRoundQuestion;
let firstRoundAnswersArray = [];
let secondRoundAnswersArray = [];
let lastRoundAnswer;
let lastRoundCategory;
let numberOfQuestionsGoneThrough = 0;
let playerOneBet;
let playerTwoBet;

let playerOne = {
  name: "Player One",
  score: 0,
  turnToPick: true,
  turnToGuess: true,
  hasGuessed: false,
};

/*****Note:****
I have whose turn it is to pick a question and whose turn it is to enter an answer
different values because I had trouble getting around  
the fact that both players could get a question wrong or pass  
but then it would still be the first player's turn to pick a question 
while it was player's two's turn last to guess. I was getting lost in if and elses statements
and this made my life easier.
*/

let playerTwo = {
  name: "Player Two",
  score: 0,
  turn: false,
  turnToPick: false,
  turnToGuess: false,
  hasGuessed: false,
};

let params = new URLSearchParams(document.location.search);
let roundNumber = parseInt(params.get("roundNumber"));
playerOne.name = params.get("playerOneName");
playerTwo.name = params.get("playerTwoName");
playerOne.score = parseInt(params.get("playerOneScore"));
playerTwo.score = parseInt(params.get("playerTwoScore"));
if (params.get("playerOneTurn") === "true") {
  playerOne.turnToPick = true;
  playerTwo.turnToPick = false;
} else if (params.get("playerTwoTurn") === "true") {
  playerTwo.turnToPick = true;
  playerOne.turnToPick = false;
}

if (roundNumber === 0){
  intro()
}

function intro(){
  popUpBox.style.display = "block";
  passButton.style.display = "none";
  answerInput.style.display = "none";
  answerInput.placeholder = "Player One's name"
  popUpHeader.textContent = "Welcome to Jeopardy 2.0!";
  popUpContent.textContent ="Thanks for playing - This is a two player game: answer questions, accumulate points, score more than your opponent to win!";
  submitButton.textContent = "Ok";
  submitButton.disabled = false;
  answerForm.addEventListener("click", playerNamesInput);

  function playerNamesInput(event){
    event.preventDefault();
    answerForm.removeEventListener("click", playerNamesInput);
    answerForm.reset();
    popUpContent.textContent = "First, let's get your names..."
    answerInput.style.display = "block";
    answerInput.placeholder = "Player One's name";
    answerForm.addEventListener("submit", submitName);
  }

  function submitName(event){
    event.preventDefault();
    answerForm.removeEventListener("submit", submitName);
    if (playerOne.name === null){
      console.log(answerInput.value)
      playerOne.name = answerInput.value;
      answerForm.reset();
      answerInput.placeholder = "Player Two's name";
      answerForm.addEventListener("submit", submitName);
    } else if (playerTwo.name === null){
      console.log(answerInput.value)
      playerTwo.name = answerInput.value;
      document.location = `/round-1.html?roundNumber=1\
&playerOneTurn=true\
&playerTwoTurn=false\
&playerOneScore=0\
&playerTwoScore=0\
&playerOneName=${playerOne.name}\
&playerTwoName=${playerTwo.name}`
    }
  } 
}

async function getData() {
  let questions = await fetch("json-file/placeholder-questions.json");
  let questionsJSON = await questions.json();
  let questionsArray = questionsJSON.placeholderQuestions;

  function findCategoriesName() {
    for (let questions of questionsArray) {
      if (categoriesArray.includes(questions.category) === false) {
        categoriesArray.push(questions.category);
      }
    }

    let gridCategoryBoxesArray = [...gridCategoryBoxes];

    gridCategoryBoxesArray.forEach((index, index2) => {
      index.textContent = categoriesArray[index2];
    });
  }

  findCategoriesName();

  function sortQuestions() {
    for (let i = 0; i < questionsArray.length; i++) {
      if (i === 60) {
        lastRoundQuestion = questionsArray[i].question;
        lastRoundAnswer = questionsArray[i].answer;
        lastRoundCategory = questionsArray[i].category;
      } else if (i > 29) {
        secondRoundQuestionsArray.push(questionsArray[i].question);
        secondRoundAnswersArray.push(questionsArray[i].answer);
      } else if (i <= 29) {
        firstRoundQuestionsArray.push(questionsArray[i].question);
        firstRoundAnswersArray.push(questionsArray[i].answer);
      }
    }
  }
  sortQuestions();
  if (roundNumber === 3) {
    return finalJeopardy();
  }
}
getData();

let gridBoxes = document.getElementsByClassName("grid-item");
let gridBoxesArray = [...gridBoxes];

gridBoxesArray.forEach((box) => {
  box.addEventListener("click", popupQuestion);
});

if (playerOne.turnToPick === true) {
  whichPlayerTurn.textContent = `${playerOne.name}, pick a question...`;
} else if (playerTwo.turnToPick === true) {
  whichPlayerTurn.textContent = `${playerTwo.name}, pick a question...`;
}

if(playerOneScoreDisplay){
playerOneScoreDisplay.textContent = `${playerOne.name}'s score: ${playerOne.score}`;
playerTwoScoreDisplay.textContent = `${playerOne.name}'s score: ${playerTwo.score}`;
}

function popupQuestion() {
  correctAnswerPrompt.textContent = ""
  let currentBox = this;
  let questionID = gridBoxesArray.indexOf(this);
  let boxScoreValue = parseInt(this.textContent);
  let currentAnswer;

  popUpBox.style.display = "block";

  if (playerOne.turnToPick === true) {
    playerOne.turnToGuess = true;
    playerTwo.turnToGuess = false;
    popUpHeader.textContent = `${playerOne.name}, here's your question:`;
  } else if (playerTwo.turnToPick === true) {
    playerTwo.turnToGuess = true;
    playerOne.turnToGuess = false;
    popUpHeader.textContent = `${playerTwo.name}, here's your question:`;
  }

  playerOne.hasGuessed = false;
  playerTwo.hasGuessed = false;

  if (roundNumber === 1) {
    popUpContent.textContent = firstRoundQuestionsArray[questionID];
    currentAnswer = firstRoundAnswersArray[questionID];
  } else if (roundNumber === 2) {
    popUpContent.textContent = secondRoundQuestionsArray[questionID];
    currentAnswer = secondRoundAnswersArray[questionID];
  } 

  console.log(currentAnswer);

  submitButton.disabled = false;
  passButton.disabled = false;

  answerForm.reset();
  answerForm.addEventListener("submit", checkAnswer);
  passButton.addEventListener("click", pass);

  function checkAnswer(event) {
    event.preventDefault();
    let answerEntered = answerInput.value;
    let saniAnswerEntered = answerEntered
      .toLowerCase()
      .trim()
      .replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, "");
    let sanitizedAnswer = currentAnswer
      .toLowerCase()
      .replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, "");
    if (saniAnswerEntered.includes(sanitizedAnswer)) {
      correctAnswer();
    } else {
      incorrectAnswer();
    }
  }

  function correctAnswer() {
    correctAnswerPrompt.textContent = "Correct!";
    submitButton.disabled = true;
    passButton.disabled = true;
    if (playerOne.turnToGuess === true) {
      playerOne.turnToPick = true;
      playerTwo.turnToPick = false;
      playerOne.score = playerOne.score + boxScoreValue;
      playerOneScoreDisplay.textContent = `${playerOne.name}'s score: ${playerOne.score}`;
      return setTimeout(goBack, 3000);
    } else if (playerTwo.turnToGuess === true) {
      playerTwo.turnToPick = true;
      playerOne.turnToPick = false;
      playerTwo.score = playerTwo.score + boxScoreValue;
      playerOneScoreDisplay.textContent = `${playerTwo.name}'s score: ${playerTwo.score}`;
      return setTimeout(goBack, 3000);
    }
  }

  function incorrectAnswer() {
    correctAnswerPrompt.textContent = "Incorrect...";

    if (playerOne.turnToGuess === true) {
      playerOne.hasGuessed = true;
      playerOne.turnToGuess = false;
      playerTwo.turnToGuess = true;
      playerOne.score = playerOne.score - boxScoreValue;
      if (playerOne.score < 0) {
        playerOne.score = 0;
      }
      playerOneScoreDisplay.textContent = `${playerOne.name}'s score: ${playerOne.score}`;
    } else if (playerTwo.turnToGuess === true) {
      playerTwo.hasGuessed = true;
      playerTwo.turnToGuess = false;
      playerOne.turnToGuess = true;
      playerTwo.score = playerTwo.score - boxScoreValue;
      if (playerTwo.score < 0) {
        playerTwo.score = 0;
      }
      playerOneScoreDisplay.textContent = `${playerTwo.name}'s score: ${playerTwo.score}`;
    }
    submitButton.disabled = true;
    passButton.disabled = true;
    setTimeout(askOtherPlayer, 2000);
  }

  function pass(event) {
    event.preventDefault();
    if (playerOne.hasGuessed === true && playerTwo.hasGuessed === true) {
      return giveAnswer();
    } else if (playerOne.turnToGuess === true) {
      playerOne.hasGuessed = true;
      playerOne.turnToGuess = false;
      playerTwo.turnToGuess = true;
      return askOtherPlayer();
    } else if (playerTwo.turnToGuess === true) {
      playerTwo.hasGuessed = true;
      playerTwo.turnToGuess = false;
      playerOne.turnToGuess = true;
      return askOtherPlayer();
    }
  }

  function askOtherPlayer() {
    answerForm.reset();
    correctAnswerPrompt.textContent = "";
    submitButton.disabled = false;
    passButton.disabled = false;

    if (playerOne.turnToGuess === true && playerOne.hasGuessed === false) {
      popUpHeader.textContent = `${playerOne.name}, do you have the answer?`;
    } else if (
      playerTwo.turnToGuess === true &&
      playerTwo.hasGuessed === false
    ) {
      popUpHeader.textContent = `${playerTwo.name}, do you have the answer?`;
    } else {
      giveAnswer();
    }
  }

  function giveAnswer() {
    submitButton.disabled = true;
    passButton.disabled = true;
    popUpHeader.textContent = `The answer was ${currentAnswer}!`;
    setTimeout(goBack, 3000);
  }

  function goBack() {
    numberOfQuestionsGoneThrough++;
    if (roundNumber === 1) {
      if (numberOfQuestionsGoneThrough === 3 || playerOne.score >= 2500 || playerTwo.score >= 2500
      ) {
        numberOfQuestionsGoneThrough = 0;
        return nextRound();
      }
    } else if (roundNumber === 2) {
      if ( numberOfQuestionsGoneThrough === 3 || playerOne.score >= 5000 || playerTwo.score >= 5000
      ) {
        return nextRound();
      }
    }
    answerForm.removeEventListener("submit", checkAnswer);
    passButton.removeEventListener("click", pass);
    popUpBox.style.display = "none";
    currentBox.removeEventListener("click", popupQuestion);
    currentBox.classList.add("grid-grayout");
    if (playerOne.turnToPick === true) {
      whichPlayerTurn.textContent = `${playerOne.name}, pick a question...`;
    } else if (playerTwo.turnToPick === true) {
      whichPlayerTurn.textContent = `${playerTwo.name}, pick a question...`;
    }
  }
}

function nextRound() {
  roundNumber++;
  popUpBox.style.display = "block";
  answerInput.style.display = "none";
  passButton.style.display = "none";
  popUpHeader.textContent = "Time to go to the next round!";
  popUpContent.textContent =
    "One of you have scored enough points. Or all the questions have been \
selected. Time to advance to the next round!";
  submitButton.textContent = "Ok";

  submitButton.disabled = false;

  submitButton.addEventListener("click", gotoNextRound);

  function gotoNextRound() {
    submitButton.removeEventListener("click", gotoNextRound);
    popUpBox.style.display = "none";
    answerInput.style.display = "block";
    passButton.style.display = "block";
    submitButton.textContent = "Guess";

    if (roundNumber === 2) {
      document.location = `/round-2.html?roundNumber=${roundNumber}\
&playerOneTurn=${playerOne.turnToPick}\
&playerTwoTurn=${playerTwo.turnToPick}\
&playerOneScore=${playerOne.score}\
&playerTwoScore=${playerTwo.score}\
&playerOneName=${playerOne.name}\
&playerTwoName=${playerTwo.name}`;
    } else if (roundNumber === 3) {
      document.location = `/final-jeopardy.html?roundNumber=${roundNumber}\
&playerOneTurn=${playerOne.turnToPick}\
&playerTwoTurn=${playerTwo.turnToPick}\
&playerOneScore=${playerOne.score}\
&playerTwoScore=${playerTwo.score}\
&playerOneName=${playerOne.name}\
&playerTwoName=${playerTwo.name}`;
    }
  }
}

function finalJeopardy() {
  let playerOneAnswer;
  let playerTwoAnswer;

  answerForm.reset();
  finalCategoryTextBox.textContent = `Category: ${lastRoundCategory}`;
  finalQuestionTextBox.textContent = "Enter the amount of points you would like to bet for the final question...";
  answerInput.style.display = "none";
  notification.textContent = "";
  if (playerOne.turnToPick === true) {
    whichPlayerTurn.textContent = `${playerOne.name}, your turn to bet...`;
    scoreAvailableToBet.textContent = `You have ${playerOne.score} points.`;
  } else if (playerTwo.turnToPick === true) {
    whichPlayerTurn.textContent = `${playerTwo.name}, your turn to bet...`;
    scoreAvailableToBet.textContent = `You have ${playerTwo.score} points.`;
  }

  answerForm.addEventListener("submit", placeBet);

  function placeBet(event) {
    event.preventDefault();
    answerForm.removeEventListener("submit", placeBet);
    if (isNaN(parseInt(betInput.value))) {
      notification.textContent = "Type in a number";
      return setTimeout(finalJeopardy, 2000);
    }

    if (playerOne.turnToPick === true) {
      if (betInput.value > playerOne.score) {
        notification.textContent = "You can't bet more points than you have...";
        return setTimeout(finalJeopardy, 2000);
      } else {
        playerOneBet = parseInt(betInput.value);
        playerOne.turnToPick = false;
        playerTwo.turnToPick = true;
        return finalJeopardy();
      }
    } else if (playerTwo.turnToPick === true) {
      if (betInput.value > playerTwo.score) {
        notification.textContent = "You can't bet more points than you have...";
        return setTimeout(finalJeopardy, 2000);
      } else {
        playerTwoBet = parseInt(betInput.value);
        betInput.style.display = "none";
        answerInput.style.display = "block";
        betButton.textContent = "Answer";
        return enterFinalAnswer();
      }
    }
  }

  function enterFinalAnswer() {
    scoreAvailableToBet.style.display = "none"
    finalQuestionTextBox.textContent = lastRoundQuestion;
    answerForm.reset();
    answerForm.addEventListener("submit", registerAnswer)

    if (playerOne.turnToGuess == true) {
      whichPlayerTurn.textContent = `Here's the question: ${playerOne.name}, your turn to answer...`;
    } else if (playerTwo.turnToGuess == true){
      whichPlayerTurn.textContent = `Here's the question: ${playerTwo.name}, your turn to answer...`;
    }
      
      function registerAnswer (event) {
        event.preventDefault();
        answerForm.removeEventListener("submit", registerAnswer)
        if (playerOne.turnToGuess == true) {
        playerOneAnswer = answerInput.value;
        playerOne.turnToGuess = false;
        playerTwo.turnToGuess = true;
        return enterFinalAnswer()
      } else if (playerTwo.turnToGuess == true){ 
        playerTwoAnswer = answerInput.value;
        return checkFinalAnswers()
      }
    }
  }

  function checkFinalAnswers() {
    let playerOneSaniAnswer = playerOneAnswer.toLowerCase().trim().replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, "");
    let playerTwoSaniAnswer = playerTwoAnswer.toLowerCase().trim().replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, "");
    let sanitizedAnswer = lastRoundAnswer.toLowerCase().replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, "");
    if (playerOneSaniAnswer.includes(sanitizedAnswer)){
      playerOne.score = playerOne.score + playerOneBet;
      notification.textContent = `${playerOne.name}, your answer was correct! \
Your score is now: ${playerOne.score}`;
    } else {
      playerOne.score = playerOne.score - playerOneBet;
      notification.textContent = `${playerOne.name}, your answer was incorrect... \
Your score is now: ${playerOne.score}`;
    }
    if (playerTwoSaniAnswer.includes(sanitizedAnswer)) {
      playerTwo.score = playerTwo.score + playerTwoBet;
      notification2.textContent = `${playerTwo.name}, your answer was correct! \
Your score is now: ${playerTwo.score}`;
    } else {
      playerTwo.score = playerTwo.score - playerTwoBet;
    notification2.textContent = `${playerTwo.name}, your answer was incorrect... \
Your score is now: ${playerTwo.score}`;
    }
    setTimeout(finalPopUp, 4000)
  }


  function finalPopUp() {

    popUpBox.style.display = "block";
    answerInput.style.display = "none";
    popUpHeader.textContent = "Time to go to the next round!";

    if (playerOne.score > playerTwo.score){
    popUpContent.textContent = "One of you have scored enough points. Or all the questions have been \
  selected. Time to advance to the next round!";
    } else if (playerTwo.score > playerOne.score){
      popUpContent.textContent = "One of you have scored enough points. Or all the questions have been \
      selected. Time to advance to the next round!";
    } else if (playerTwo.score === playerOne.score){
      popUpContent.textContent = "You are both equally worthy";
    }
    submitButton.textContent = "Ok";
    submitButton.disabled = false;
    submitButton.addEventListener("click", () => {
      document.location = "/index.html"
    });
  }
}
