let categoriesArray = [];
let firstRoundQuestionsArray = [];
let secondRoundQuestionsArray = [];
let lastRoundQuestion;
let firstRoundAnswersArray = [];
let secondRoundAnswersArray = [];
let lastRoundAnswer;

async function getData() {
  let questions = await fetch("json-file/placeholder-questions.json");
  let questionsJSON = await questions.json();
  let questionsArray = questionsJSON.placeholderQuestions;

  function findCategories() {
    for (let questions of questionsArray) {
      if (categoriesArray.includes(questions.category) === false) {
        categoriesArray.push(questions.category);
      }
    }
    let gridCategoryBoxes = document.getElementsByClassName("grid-category");
    let gridCategoryBoxesArray = [...gridCategoryBoxes];
    gridCategoryBoxesArray.forEach((index, index2) => {
      index.textContent = categoriesArray[index2];
    });
  }

  findCategories();

  function getQuestions() {
    for (let i = 0; i < questionsArray.length; i++) {
      if (i === 60) {
        lastRoundQuestion = questionsArray[i].question;  
        lastRoundAnswer = questionsArray[i].answer;
      } else if (i > 29) {
        secondRoundQuestionsArray.push(questionsArray[i].question);
        secondRoundAnswersArray = questionsArray[i].answer;
      } else if (i <= 29) {
        firstRoundQuestionsArray.push(questionsArray[i].question);
        firstRoundAnswersArray.push(questionsArray[i].answer);
    }
  }
}

  getQuestions();

}

getData();

let gridBoxes = document.getElementsByClassName("grid-item");
let gridBoxesArray = [...gridBoxes]

gridBoxesArray.forEach((box) => {box.addEventListener("click", popupQuestion)})

function popupQuestion(){

  let questionID = gridBoxesArray.indexOf(this)
  let questionDisplayBox = document.getElementById("overlay");
  questionDisplayBox.style.display = 'block';
  let questionContent = document.querySelector("#question-content")
  questionContent.textContent = firstRoundQuestionsArray[questionID]
  
  let answerForm = document.getElementById("answer-form");
  let answerInput = document.getElementById("answer-input");
  let submitButton = document.getElementById("submit-button");
  let answerCorrect = document.getElementById("answer-correct");

  answerForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let answerEntered = answerInput.value;
    console.log(answerEntered)
    let saniAnswerEntered = answerEntered.toLowerCase().trim();
    let answerEnteredArray = saniAnswerEntered.split(" ")

      if (answerEnteredArray.includes(firstRoundAnswersArray[questionID])){
        answerCorrect.textContent = "Correct!";
      } else {
        answerCorrect.textContent = "Incorrect...";
      }


  });
}





