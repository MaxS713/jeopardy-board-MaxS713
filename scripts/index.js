/*******Thanks for reviewing my code - the project should be relatively functional
But these are things that still need some work and that I didn't have time to do yet:

- The way some answers are checked can be quite unfair - ex: Sea horse instead of Seahorse, 
sputnik instead of Sputnik 1, washington, instead of George Washington - etc...
Need to write a better function that would be more forgiving in those cases. 
Also maybe in some cases if the ortograph is not quite correct, the answer could still pass.

- There's a problem with the score requirement needed to go from round 2 to round 3 - 
it said it needed to be 5000, but I wasn't sure if it was for the round only or total. That being said,
the score in the second round should in theory accumulate twice as fast. So a player, say, that already 
came in with 2500 points could get there easily. Perhaps I should put in a variable that keeps track
of the score for the round only, not total.

-In general the CSS and html can still be improved for a better user experience,
and responsiveness is not quite optimized yet. Plenty of code refractoring could be done as well.
*/

//Defining all the DOM elements I will need to manipulate throughout the script
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

//Defining other variables that will be manipulated throughout the script
let firstRoundCategories = [];
let secondRoundCategories = [];
let finalRoundCategory;
let firstRoundQuestionsList = [];
let secondRoundQuestionsList = [];
let lastRoundQuestion;
let firstRoundAnswersArray = [];
let secondRoundAnswersArray = [];
let lastRoundAnswer;
let lastRoundCategory;
let numberOfQuestionsGoneThrough = 0;
let playerOneBet;
let playerTwoBet;
let currentBox;
let questionID;
let boxScoreValue;
let currentAnswer;
let dailyDoubleBoxID1;
let dailyDoubleBoxID2;
let fetchDataLoop = 1;
let categoriesAlreadyUsed = [];

//Creating the players as objects with different attributes
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

/****Note:****
I have whose turn it is to pick a question and whose turn it is to enter an answer
different values because I had trouble getting around  
the fact that both players could get a question wrong or pass  
but then it would still be the first player's turn to pick a question 
while it was player's two's turn last to guess. 
I was getting lost in lots of if and elses statements
and this made my life easier.
****/

//Fetching information and parameters passed over in the URL
//The player's name, score, whose turn it is, which round we're in
//and which categories have already been used
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
if (params.get("categoriesAlreadyUsed") !== null) {
  categoriesAlreadyUsed = params.get("categoriesAlreadyUsed").split(" ");
}

//If the game hasn't started yet a.k.a "round = 0" parameter was passed
//over by the home page url
//then an intro pop up happens to introduce the game and get the players' names
if (roundNumber === 0) {
  intro();
}

//Pop up introduction to the game
function intro() {
  //series of DOM reasignement for the
  //popup box to look as needed
  popUpBox.style.display = "block";
  passButton.style.display = "none";
  answerInput.style.display = "none";
  answerInput.placeholder = "Player One's name";
  whichPlayerTurn.textContent = "";
  playerOneScoreDisplay.textContent = "";
  playerTwoScoreDisplay.textContent = "";

  //text content that introduces the game
  popUpHeader.textContent = "Welcome to Jeopardy 2.0!";
  popUpContent.textContent =
    "Thanks for playing - This is a two player game: answer questions, accumulate points, score more than your opponent to win!";

  //When the player clicks the "OK" button,
  //the function to gather the player's name starts
  submitButton.textContent = "Ok"; //
  submitButton.disabled = false;
  answerForm.addEventListener("click", playerNamesInput);

  //function to asks for the players' names
  function playerNamesInput(event) {
    event.preventDefault();
    answerForm.removeEventListener("click", playerNamesInput);
    /*This is just for safety, I found that if I don't remove the event listeners 
when they're not needed anymore, sometimes they can be triggered 
at an unwanted moment later on...*/

    //The form resets and the input box appears and asks
    //for the players' names, one at a time
    answerForm.reset();
    popUpContent.textContent = "First, let's get your names...";
    answerInput.style.display = "block";
    answerInput.placeholder = "Player One's name";

    /*This little useful piece of code, makes it that the submit button is only clickable 
if a value is being entered, avoiding empty strings to be submitted - I have it for most input situations*/
    submitButton.disabled = true;
    answerInput.addEventListener("input", (event) => {
      if (event.target.value.trim()) {
        //if there's a value the button is enabled and vice versa
        submitButton.disabled = false;
      } else {
        submitButton.disabled = true;
      }
    });

    answerForm.addEventListener("submit", submitName);
    //On submission, the function to register the names is triggered
  }

  //Function to register the players' names
  function submitName(event) {
    event.preventDefault();
    answerForm.removeEventListener("submit", submitName);

    //If the name is still the default - the submission value is assigned to the player's name
    if (playerOne.name === "Player One") {
      playerOne.name = answerInput.value;
      answerForm.reset();
      answerInput.placeholder = "Player Two's name";
      answerForm.addEventListener("submit", submitName); //Then a second submission is expected for the second player
    } else if (playerTwo.name === "Player Two") {
      playerTwo.name = answerInput.value;

      //Once both player names have been registered, then the
      //pages refreshes with the new information
      //This time, round = 1, so the intro will be skipped and the game will start
      document.location = `round-1.html?roundNumber=1\ 
&playerOneTurn=true\
&playerTwoTurn=false\
&playerOneScore=0\
&playerTwoScore=0\
&playerOneName=${playerOne.name}\
&playerTwoName=${playerTwo.name}`;
    }
  }
}

//this sections decides whic
let listOfCategoriesAvailable = [
  "General Knowledge",
  "Books",
  "Film",
  "Music",
  "Musicals & Theatres",
  "Television",
  "Video Games",
  "Board Games",
  "Science & Nature",
  "Computers",
  "Mathematics",
  "Mythology",
  "Sports",
  "Geography",
  "History",
  "Politics",
  "Art",
  "Celebreties",
  "Animals",
  "Vehicles",
  "Comics",
  "Gadgets",
  "Japanese Anime & Manga",
  "Cartoon & Animations",
];

let shuffledListOfCategories = [];

categoriesAlreadyUsed.forEach((category) => {
  listOfCategoriesAvailable.splice(parseInt(category), 1);
});

function shuffleCategories() {
  for (var i = listOfCategoriesAvailable.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = listOfCategoriesAvailable[i];
    listOfCategoriesAvailable[i] = listOfCategoriesAvailable[j];
    listOfCategoriesAvailable[j] = temp;
  }
  shuffledListOfCategories = listOfCategoriesAvailable;
}
shuffleCategories();

listOfCategoriesAvailable = [
  "General Knowledge",
  "Books",
  "Film",
  "Music",
  "Musicals & Theatres",
  "Television",
  "Video Games",
  "Board Games",
  "Science & Nature",
  "Computers",
  "Mathematics",
  "Mythology",
  "Sports",
  "Geography",
  "History",
  "Politics",
  "Art",
  "Celebreties",
  "Animals",
  "Vehicles",
  "Comics",
  "Gadgets",
  "Japanese Anime & Manga",
  "Cartoon & Animations",
];

let categoryNumbersList = [];
let finalCategoryNumber;

if (roundNumber === 1) {
  categoryNumbersList = [];
  for (let i = 0; i < 6; i++) {
    firstRoundCategories.push(shuffledListOfCategories[i]);
  }
  firstRoundCategories.forEach((category) => {
    categoriesAlreadyUsed.push(listOfCategoriesAvailable.indexOf(category));
    categoryNumbersList.push(
      (listOfCategoriesAvailable.indexOf(category) + 9).toString()
    );
  });
} else if (roundNumber === 2) {
  categoryNumbersList = [];
  for (let i = 0; i < 6; i++) {
    secondRoundCategories.push(shuffledListOfCategories[i]);
  }
  secondRoundCategories.forEach((category) => {
    categoriesAlreadyUsed.push(listOfCategoriesAvailable.indexOf(category));
    categoryNumbersList.push(
      (listOfCategoriesAvailable.indexOf(category) + 9).toString()
    );
  });
} else if (roundNumber === 3) {
  finalRoundCategory = shuffledListOfCategories[0];
  finalCategoryNumber = (listOfCategoriesAvailable.indexOf(finalRoundCategory) + 9).toString();
}

//This coming function fetches data from "Ninja API"
//for each category and each round a pull is made
//the information is pushed and stored in those three variables

let questionsData;
let firstRoundQuestionsDataList = [];
let secondRoundQuestionsDataList = [];

async function getData() {
  if (roundNumber === 1) {
    popUpBox.style.display = "block";
    passButton.style.display = "none";
    submitButton.style.display = "none";
    answerInput.style.display = "none";
    //text content that introduces the game
    popUpHeader.textContent = "Please Wait!";
    popUpContent.textContent = "Loading questions...";
    for (let i = 0; i < 6; i++) {
      questionsData = await fetch(
        `https://opentdb.com/api.php?amount=5&category=${categoryNumbersList[i]}&difficulty=easy&type=multiple&encode=base64`
      );
      questionsData = await questionsData.json();
      firstRoundQuestionsDataList.push(questionsData.results);
    }
    popUpBox.style.display = "none";
    passButton.style.display = "block";
    submitButton.style.display = "block";
    answerInput.style.display = "block";
  }

  if (roundNumber === 2) {
    popUpBox.style.display = "block";
    passButton.style.display = "none";
    submitButton.style.display = "none";
    answerInput.style.display = "none";
    //text content that introduces the game
    popUpHeader.textContent = "Please Wait!";
    popUpContent.textContent = "Loading questions...";

    for (let i = 0; i < 6; i++) {
      questionsData = await fetch(
        `https://opentdb.com/api.php?amount=5&category=${categoryNumbersList[i]}&difficulty=easy&type=multiple&encode=base64`
      );
      questionsData = await questionsData.json();
      secondRoundQuestionsDataList.push(questionsData.results);
    }
    popUpBox.style.display = "none";
    passButton.style.display = "block";
    submitButton.style.display = "block";
    answerInput.style.display = "block";
  }

  if (roundNumber === 3) {
    popUpBox.style.display = "block";
    submitButton.style.display = "none";
    answerInput.style.display = "none";
    //text content that introduces the game
    popUpHeader.textContent = "Please Wait!";
    popUpContent.textContent = "Loading questions...";
    questionsData = await fetch(
      `https://opentdb.com/api.php?amount=5&category=${finalCategoryNumber}&difficulty=easy&type=multiple&encode=base64`
    );
    lastRoundQuestion = await questionsData.json();
    lastRoundQuestion = lastRoundQuestion.results
    popUpBox.style.display = "none";
    submitButton.style.display = "block";
  }

  //reorganizes the fetched data into a list
  //where the questions are in order of apearance of the grid
  let questionsList = [];
  let j = 0;
  let k = 0;

  if (roundNumber === 1) {
    i = 0;
    k = 0;
    questionsList = [];
    for (let i = 0; i < 30; i++) {
      questionsList.push(firstRoundQuestionsDataList[j][k]);
      j++;
      if (j === 6) {
        j = 0;
        k++;
      }
    }
  }

  if (roundNumber === 2) {
    i = 0;
    k = 0;
    questionsList = [];
    for (let i = 0; i < 30; i++) {
      questionsList.push(secondRoundQuestionsDataList[j][k]);
      j++;
      if (j === 6) {
        j = 0;
        k++;
      }
    }
  }

  if (roundNumber === 3) {
    i = 0;
    k = 0;
    questionsList = [];
    questionsList.push(lastRoundQuestion[0]);
  }

  //sorts through the question list and distributes them
  //into separate lists for each round
  for (let i = 0; i < questionsList.length; i++) {
    if (roundNumber === 3) {
      lastRoundQuestion = atob(questionsList[i].question);
      lastRoundAnswer = atob(questionsList[i].correct_answer);
    } else if (roundNumber === 2) {
      secondRoundQuestionsList.push(atob(questionsList[i].question));
      secondRoundAnswersArray.push(atob(questionsList[i].correct_answer));
    } else if (roundNumber === 1) {
      firstRoundQuestionsList.push(atob(questionsList[i].question));
      firstRoundAnswersArray.push(atob(questionsList[i].correct_answer));
    }
  }
}

//the whole function to fetch and sort the questions is called
if (roundNumber !== 0) {
  getData();
}

//this takes the list of category boxes html elements in the DOM
//and converts it into an array
let gridCategoryBoxesArray = [...gridCategoryBoxes];

//then this goes through the array of category boxes and for each one,
//it adds the name of the category as the text content
if (roundNumber === 1) {
  gridCategoryBoxesArray.forEach((index, index2) => {
    index.textContent = firstRoundCategories[index2];
  });
} else if (roundNumber === 2) {
  gridCategoryBoxesArray.forEach((index, index2) => {
    index.textContent = secondRoundCategories[index2];
  });
}

/*before getting through any further lines of code
  and the start of round 1 and 2
  this checks if we're on the final round, and sends you there now
  because its code functions differently*/
if (roundNumber === 3) {
  finalJeopardy();
}

//some preliminary code before the answering of questions

//while we here, we will create two random number between
//0 and 29 to be our daily double grid IDs
function assignDailyDouble() {
  dailyDoubleBoxID1 = Math.floor(Math.random() * 30);
  dailyDoubleBoxID2 = Math.floor(Math.random() * 30);
  while (dailyDoubleBoxID1 === dailyDoubleBoxID2) {
    //for the rare instance that the two random numbers are the same, the second one is rolled again
    dailyDoubleBoxID2 = Math.floor(Math.random() * 30);
  }
}
//fucntion to create the daily double numbers is called
assignDailyDouble();

//checks who's turn it is and notify at the top of the page
if (playerOne.turnToPick === true) {
  whichPlayerTurn.textContent = `${playerOne.name}, pick a question...`;
} else if (playerTwo.turnToPick === true) {
  whichPlayerTurn.textContent = `${playerTwo.name}, pick a question...`;
}

//displays the current score of each player
if (playerOneScoreDisplay) {
  playerOneScoreDisplay.textContent = `${playerOne.name}'s score: ${playerOne.score}`;
  playerTwoScoreDisplay.textContent = `${playerTwo.name}'s score: ${playerTwo.score}`;
}

//this gets every box from the grid and assigns them to an array
let gridBoxes = document.getElementsByClassName("grid-item");
let gridBoxesArray = [...gridBoxes];
//then for each one of this box, we will create an event listener
//that when clicked, the question will pop up
gridBoxesArray.forEach((box) => {
  box.addEventListener("click", askQuestion);
});

//the question prompt triggered by each event listener
function askQuestion() {
  //we need to know, which box has been clicked so we can know which question to ask
  currentBox = this;
  questionID = gridBoxesArray.indexOf(this);
  boxScoreValue = parseInt(this.textContent); //+this registers the number of points the question is worth
  // by looking at the number content already there

  // this quickly checks if we're dealing with a daily double
  if (questionID === dailyDoubleBoxID1 || questionID === dailyDoubleBoxID2) {
    dailyDoubleAlert(); //if we are, the user is alerted
  } else {
    displayQuestion(); //if not, basic display of the question is trigerred
  }
}

//a popup for the daily double and doubles the value of the box
function dailyDoubleAlert() {
  boxScoreValue = boxScoreValue * 2;
  correctAnswerPrompt.textContent = "";
  popUpBox.style.display = "block";
  popUpHeader.textContent = "This box is a Daily Double!";
  popUpContent.textContent = "The score value is doubled!";
  answerForm.style.display = "none";
  setTimeout(() => {
    answerForm.style.display = "block";
    displayQuestion();
  }, 3000); //then after a timeout the question is displayed
}

//this displays the question
function displayQuestion() {
  correctAnswerPrompt.textContent = ""; //making sure the notification of a correct answer is empty
  popUpBox.style.display = "block"; // the popup appears

  playerOne.hasGuessed = false;
  playerTwo.hasGuessed = false;
  //reseting these values that check if a player has already guessed during callbacks

  //depending on whose turn it is, displays the name in the header
  if (playerOne.turnToPick === true) {
    playerOne.turnToGuess = true; //these values are a little redundant but there are there
    playerTwo.turnToGuess = false; //to keep track of who's guessing!
    popUpHeader.textContent = `${playerOne.name}, here's your question:`;
  } else if (playerTwo.turnToPick === true) {
    playerTwo.turnToGuess = true;
    playerOne.turnToGuess = false;
    popUpHeader.textContent = `${playerTwo.name}, here's your question:`;
  }

  //depending on which round we're in - gets the question and answers
  //from the questions arrays defined earlier, thanks to the box ID also defined earlier
  if (roundNumber === 1) {
    popUpContent.textContent = firstRoundQuestionsList[questionID];
    currentAnswer = firstRoundAnswersArray[questionID];
  } else if (roundNumber === 2) {
    popUpContent.textContent = secondRoundQuestionsList[questionID];
    currentAnswer = secondRoundAnswersArray[questionID];
  }

  //allows the user to enter an answer
  answerForm.reset();
  submitButton.disabled = true;
  passButton.disabled = false;
  passButton.addEventListener("click", pass); //if the user clicks on pass, we're sent to the pass function
  answerForm.addEventListener("submit", checkAnswer);
  //if the user submits the form, we're sent to the function to check on the answer

  //block of code that makes sure an input is present before allowing a user to click submit
  answerInput.addEventListener("input", (event) => {
    if (event.target.value.trim()) {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  });
}

//this function checks if the answer is correct
function checkAnswer(event) {
  event.preventDefault();

  let answerEntered = answerInput.value; //this gets the value entered from the form

  //both the correct answer and the user's answer are "sanitized" - extra spaces are removed and
  //all punctuation marks are also removed...
  // ====> found this beautiful length of punctuation marks online that captures them all!
  let saniAnswerEntered = answerEntered
    .toLowerCase()
    .trim()
    .replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, "");
  let sanitizedAnswer = currentAnswer
    .toLowerCase()
    .replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, "");

  //then the answers are compared and we are sent to different function depending on a valid answer or no
  if (saniAnswerEntered.includes(sanitizedAnswer)) {
    correctAnswer();
  } else {
    incorrectAnswer();
  }
}

//in case of a valid answer, the user is notified
//the value of the box is added to to the score of the person who guessed,
//and after a timeout we are sent back to the grid
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
    playerTwoScoreDisplay.textContent = `${playerTwo.name}'s score: ${playerTwo.score}`;
    return setTimeout(goBack, 3000);
  }
}

//if the answer is not correct, the score value is deducted instead
//then we're sent to a function to ask the other player
function incorrectAnswer() {
  correctAnswerPrompt.textContent = "Incorrect...";
  if (playerOne.turnToGuess === true) {
    playerOne.hasGuessed = true;
    playerOne.turnToGuess = false;
    playerTwo.turnToGuess = true;
    playerOne.score = playerOne.score - boxScoreValue;

    playerOneScoreDisplay.textContent = `${playerOne.name}'s score: ${playerOne.score}`;
  } else if (playerTwo.turnToGuess === true) {
    playerTwo.hasGuessed = true;
    playerTwo.turnToGuess = false;
    playerOne.turnToGuess = true;
    playerTwo.score = playerTwo.score - boxScoreValue;
    playerTwoScoreDisplay.textContent = `${playerTwo.name}'s score: ${playerTwo.score}`;
  }
  submitButton.disabled = true;
  passButton.disabled = true;
  setTimeout(askOtherPlayer, 2000);
}

//in case the pass button has been clicked
//the turn to guess are switched, and the other player gets asked the question
function pass(event) {
  event.preventDefault();
  correctAnswerPrompt.textContent = "";
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

//this function simply resets the form and asks the other player if
//he has the answer, in case the other player passed, or gave an incorrect answer
function askOtherPlayer() {
  answerForm.reset();
  correctAnswerPrompt.textContent = "";
  submitButton.disabled = true;
  passButton.disabled = false;

  if (playerOne.turnToGuess === true && playerOne.hasGuessed === false) {
    popUpHeader.textContent = `${playerOne.name}, do you have the answer?`;
  } else if (playerTwo.turnToGuess === true && playerTwo.hasGuessed === false) {
    popUpHeader.textContent = `${playerTwo.name}, do you have the answer?`;
  } else {
    giveAnswer();
  }
}

// if both players passed or gave an incorrect answer, the game reveals what the answer was
function giveAnswer() {
  submitButton.disabled = true;
  passButton.disabled = true;
  popUpHeader.textContent = `The answer was ${currentAnswer}!`;
  setTimeout(goBack, 3000);
}

//this functions makes the popup box go away
function goBack() {
  numberOfQuestionsGoneThrough++;

  //if all the questions have been answered or if a certain score has been reached
  //we advance to the next round
  if (roundNumber === 1) {
    if (
      numberOfQuestionsGoneThrough === 30 ||
      playerOne.score >= 2500 ||
      playerTwo.score >= 2500
    ) {
      numberOfQuestionsGoneThrough = 0;
      return nextRound();
    }
  } else if (roundNumber === 2) {
    if (
      numberOfQuestionsGoneThrough === 30 ||
      playerOne.score >= 5000 ||
      playerTwo.score >= 5000
    ) {
      return nextRound();
    }
  }

  //this make the popup box disapear
  answerForm.removeEventListener("submit", checkAnswer);
  passButton.removeEventListener("click", pass);
  popUpBox.style.display = "none";

  //then the question box we've just been through is "grayed out"
  //and it can't be clicked anymore
  currentBox.removeEventListener("click", askQuestion);
  currentBox.classList.add("grid-grayout");

  //depending on whose turn it is to pick, the player is notified and they can pick again...
  if (playerOne.turnToPick === true) {
    whichPlayerTurn.textContent = `${playerOne.name}, pick a question...`;
  } else if (playerTwo.turnToPick === true) {
    whichPlayerTurn.textContent = `${playerTwo.name}, pick a question...`;
  }
}

//this functions notifies the users we're advancing to the next round
function nextRound() {
  roundNumber++;
  popUpBox.style.display = "block";
  answerInput.style.display = "none";
  passButton.style.display = "none";
  correctAnswerPrompt.textContent = "";
  popUpHeader.textContent = "Time to go to the next round!";
  popUpContent.textContent =
    "One of you have scored enough points or all the questions have been \
selected. Time to advance to the next round!";
  submitButton.textContent = "Ok";

  submitButton.disabled = false;
  submitButton.addEventListener("click", gotoNextRound);

  //after the notification is dismissed
  //the popup disapears and an url to the next round is generated
  //with some parameters to pass through - players name, score, etc...
  function gotoNextRound() {
    submitButton.removeEventListener("click", gotoNextRound);
    popUpBox.style.display = "none";
    answerInput.style.display = "block";
    passButton.style.display = "block";
    submitButton.textContent = "Guess";
    if (roundNumber === 2) {
      document.location = `/round-2.html?roundNumber=2\
&playerOneTurn=${playerOne.turnToPick}\
&playerTwoTurn=${playerTwo.turnToPick}\
&playerOneScore=${playerOne.score}\
&playerTwoScore=${playerTwo.score}\
&playerOneName=${playerOne.name}\
&playerTwoName=${playerTwo.name}\
&categoriesAlreadyUsed=${categoriesAlreadyUsed.join("+")}`;
    } else if (roundNumber === 3) {
      document.location = `/final-jeopardy.html?roundNumber=3\
&playerOneTurn=true\
&playerTwoTurn=false\
&playerOneScore=${playerOne.score}\
&playerTwoScore=${playerTwo.score}\
&playerOneName=${playerOne.name}\
&playerTwoName=${playerTwo.name}\
&categoriesAlreadyUsed=${categoriesAlreadyUsed.join("+")}`;
    }
  }
}

//this was it for the first and second round,
//this function is for the functionality of the final round
//which is a litte different
function finalJeopardy() {
  answerInput.style.display = "none";
  let playerOneAnswer; // we will store the answers of both players in these variables.
  let playerTwoAnswer;

  //first the players are asked how much they want to bet
  answerForm.reset();
  answerInput.style.display = "none";
  finalCategoryTextBox.textContent = `Category: ${finalRoundCategory}`;
  finalQuestionTextBox.textContent =
    "Enter the amount of points you would like to bet for the final question...";
  
  notification.textContent = "";
  if (playerOne.turnToPick === true) {
    whichPlayerTurn.textContent = `${playerOne.name}, your turn to bet...`;
    scoreAvailableToBet.textContent = `You have ${playerOne.score} points.`;
    //the players are told how many points they have available to wager
  } else if (playerTwo.turnToPick === true) {
    whichPlayerTurn.textContent = `${playerTwo.name}, your turn to bet...`;
    scoreAvailableToBet.textContent = `You have ${playerTwo.score} points.`;
  }

  answerForm.addEventListener("submit", placeBet);
  betButton.disabled = true;
  betInput.addEventListener("input", (event) => {
    if (event.target.value.trim()) {
      betButton.disabled = false;
    } else {
      betButton.disabled = true;
    }
  });

  //on submission, a function to store the bet values is triggered
  function placeBet(event) {
    event.preventDefault();
    answerForm.removeEventListener("submit", placeBet);
    if (isNaN(parseInt(betInput.value))) {
      notification.textContent = "Type in a number"; //error message in case NaN has been entered
      return setTimeout(finalJeopardy, 2000);
    }
    if (playerOne.turnToPick === true) {
      if (betInput.value > playerOne.score) {
        notification.textContent = "You can't bet more points than you have...";
        //error message in case more than available to bet has been entered
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

  //this allows the players to input their answers to the final questions
  function enterFinalAnswer() {
    scoreAvailableToBet.style.display = "none";
    finalQuestionTextBox.textContent = lastRoundQuestion;
    answerForm.reset();
    answerForm.addEventListener("submit", registerAnswer);

    betButton.disabled = true;
    answerInput.addEventListener("input", (event) => {
      if (event.target.value.trim()) {
        betButton.disabled = false;
      } else {
        betButton.disabled = true;
      }
    });

    if (playerOne.turnToGuess == true) {
      whichPlayerTurn.textContent = `Here's the question: ${playerOne.name}, your turn to answer...`;
    } else if (playerTwo.turnToGuess == true) {
      whichPlayerTurn.textContent = `Here's the question: ${playerTwo.name}, your turn to answer...`;
    }

    //this function stores each answer given for each player
    function registerAnswer(event) {
      event.preventDefault();
      answerForm.removeEventListener("submit", registerAnswer);
      if (playerOne.turnToGuess == true) {
        playerOneAnswer = answerInput.value;
        playerOne.turnToGuess = false;
        playerTwo.turnToGuess = true;
        return enterFinalAnswer();
      } else if (playerTwo.turnToGuess == true) {
        playerTwoAnswer = answerInput.value;
        return checkFinalAnswers();
      }
    }
  }

  //this function checks if the given answers are correct
  function checkFinalAnswers() {
    //each answers given are sanitized
    let playerOneSaniAnswer = playerOneAnswer
      .toLowerCase()
      .trim()
      .replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, "");
    let playerTwoSaniAnswer = playerTwoAnswer
      .toLowerCase()
      .trim()
      .replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, "");
    let sanitizedAnswer = lastRoundAnswer
      .toLowerCase()
      .replace(/['!"#$%&\\'()\*+,\-\.\/:;<=>?@\[\\\]\^_`{|}~']/g, "");

    //the answer is compared to the correct answer
    if (playerOneSaniAnswer.includes(sanitizedAnswer)) {
      playerOne.score = playerOne.score + playerOneBet; //then the amount of the bet is added to the score
      notification.textContent = `${playerOne.name}, your answer was correct! \
Your score is now: ${playerOne.score}`;
    } else {
      playerOne.score = playerOne.score - playerOneBet;
      //the amount of the bet is removed from the score if the answer is incorrect
      notification.textContent = `${playerOne.name}, your answer was incorrect... \ 
Your score is now: ${playerOne.score}`;
    }
    if (playerTwoSaniAnswer.includes(sanitizedAnswer)) {
      //same for the second player
      playerTwo.score = playerTwo.score + playerTwoBet;
      notification2.textContent = `${playerTwo.name}, your answer was correct! \
Your score is now: ${playerTwo.score}`;
    } else {
      playerTwo.score = playerTwo.score - playerTwoBet;
      notification2.textContent = `${playerTwo.name}, your answer was incorrect... \
Your score is now: ${playerTwo.score}`;
    }
    setTimeout(finalPopUp, 4000);
  }

  //this final popup debriefs the game, compares the scores and displays who won
  function finalPopUp() {
    popUpBox.style.display = "block";
    answerInput.style.display = "none";
    popUpHeader.textContent = "Congratulations!";

    if (playerOne.score > playerTwo.score) {
      popUpContent.textContent = `${playerOne.name}, you won with a score of ${playerOne.score}. \
Click Ok to go back to the home page.`;
    } else if (playerTwo.score > playerOne.score) {
      popUpContent.textContent = `${playerTwo.name}, you won with a score of ${playerTwo.score}. \
Click Ok to go back to the home page.`;
    } else if (playerTwo.score === playerOne.score) {
      //the rare eventuality of both players having the same score is also possible
      popUpContent.textContent = `You both won with an equal score of ${playerOne.score}. \
You are both equally worthy! Click Ok to go back to the home page.`;
    }
    submitButton.textContent = "Ok";
    submitButton.disabled = false;
    submitButton.addEventListener("click", () => {
      document.location = "/index.html"; //clicking the final button returns to the home page
    });
  }
}
