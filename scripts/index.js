let playerTurn = document.getElementById("player-turn");
let gridCategoryBoxes = document.getElementsByClassName("grid-category");
let popUpBox = document.getElementById("overlay");
let popUpHeader = document.getElementById("popup-header");
let popUpContent = document.querySelector("#popup-content");
let answerForm = document.getElementById("answer-form");
let answerInput = document.getElementById("answer-input");
let submitButton = document.getElementById("submit-button");
let passButton = document.getElementById("pass-button");
let answerCorrect = document.getElementById("answer-correct");
let playerOneScoreDisplay = document.getElementById("player-one-score");
let playerTwoScoreDisplay = document.getElementById("player-two-score");

let categoriesArray = [];
let firstRoundQuestionsArray = [];
let secondRoundQuestionsArray = [];
let lastRoundQuestion;
let firstRoundAnswersArray = [];
let secondRoundAnswersArray = [];
let lastRoundAnswer;
let numberOfQuestionsGoneThrough = 0;

let playerOne = {
  name: "Player One",
  score: 0,
  turnToPick: true,
  turnToGuess: true,
  hasGuessed: false,
};

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
playerOne.score = parseInt(params.get("playerOneScore"));
playerTwo.score = parseInt(params.get("playerTwoScore"));
if (params.get("playerOneTurn") === "true") {
  playerOne.turnToPick = true;
  playerTwo.turnToPick = false;
} else if (params.get("playerTwoTurn") === "true") {
  playerTwo.turnToPick = true;
  playerOne.turnToPick = false;
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
}
getData();

let gridBoxes = document.getElementsByClassName("grid-item");
let gridBoxesArray = [...gridBoxes];

gridBoxesArray.forEach((box) => {
  box.addEventListener("click", popupQuestion);
});

if (playerOne.turnToPick === true) {
  playerTurn.textContent = `${playerOne.name}, pick a question...`;
} else if (playerTwo.turnToPick === true) {
  playerTurn.textContent = `${playerTwo.name}, pick a question...`;
}

function popupQuestion() {
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
    console.log();
    console.log(secondRoundAnswersArray[questionID]);
    console.log(questionID);
  } else if (roundNumber === 3) {
    popUpContent.textContent = lastRoundQuestion;
    currentAnswer = lastRoundAnswer;
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
    answerCorrect.textContent = "Correct!";
    submitButton.disabled = true;
    passButton.disabled = true;
    if (playerOne.turnToGuess === true) {
      playerOne.turnToPick = true;
      playerTwo.turnToPick = false;
      playerOne.score = playerOne.score + boxScoreValue;
      playerOneScoreDisplay.textContent = `Player 1 Score: ${playerOne.score}`;
      return setTimeout(goBack, 3000);
    } else if (playerTwo.turnToGuess === true) {
      playerTwo.turnToPick = true;
      playerOne.turnToPick = false;
      playerTwo.score = playerTwo.score + boxScoreValue;
      playerTwoScoreDisplay.textContent = `Player 2 Score: ${playerTwo.score}`;
      return setTimeout(goBack, 3000);
    }
  }

  function incorrectAnswer() {
    answerCorrect.textContent = "Incorrect...";

    if (playerOne.turnToGuess === true) {
      playerOne.hasGuessed = true;
      playerOne.turnToGuess = false;
      playerTwo.turnToGuess = true;
      playerOne.score = playerOne.score - boxScoreValue;
      if (playerOne.score < 0) {
        playerOne.score = 0;
      }
      playerOneScoreDisplay.textContent = `Player 1 Score: ${playerOne.score}`;
    } else if (playerTwo.turnToGuess === true) {
      playerTwo.hasGuessed = true;
      playerTwo.turnToGuess = false;
      playerOne.turnToGuess = true;
      playerTwo.score = playerTwo.score - boxScoreValue;
      if (playerTwo.score < 0) {
        playerTwo.score = 0;
      }
      playerTwoScoreDisplay.textContent = `Player 2 Score: ${playerTwo.score}`;
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
    answerCorrect.textContent = "";
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
      if (numberOfQuestionsGoneThrough === 1 || playerOne.score >= 2500 || playerTwo.score >= 2500) {
        numberOfQuestionsGoneThrough = 0;
        return nextRound();
      }
    } else if (roundNumber === 2) {
      if (numberOfQuestionsGoneThrough === 1 || playerOne.score >= 5000 || playerTwo.score >= 5000) {
        return nextRound();
      }
    }
    answerForm.removeEventListener("submit", checkAnswer);
    passButton.removeEventListener("click", pass);
    popUpBox.style.display = "none";
    currentBox.removeEventListener("click", popupQuestion);
    currentBox.classList.add("grid-grayout");
    if (playerOne.turnToPick === true) {
      playerTurn.textContent = `${playerOne.name}, pick a question...`;
    } else if (playerTwo.turnToPick === true) {
      playerTurn.textContent = `${playerTwo.name}, pick a question...`;
    }
  }
}

function nextRound() {
  roundNumber++;
  popUpBox.style.display = "block";
  answerInput.style.display = "none";
  passButton.style.display = "none";
  popUpHeader.textContent = "Time to go to the next round!";
  popUpContent.textContent = "One of you have scored enough points. Or all the questions have been \
selected. Time to advance to the next round!";
  submitButton.textContent = "Ok"

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
      &playerTwoScore=${playerTwo.score}`;
    } else if (roundNumber === 3) {
      document.location = `/final-jeopardy.html?roundNumber=${roundNumber}\
      &playerOneTurn=${playerOne.turnToPick}\
      &playerTwoTurn=${playerTwo.turnToPick}\
      &playerOneScore=${playerOne.score}\
      &playerTwoScore=${playerTwo.score}`;
    }
  }
}  
