
async function getData() {
  let questions = await fetch("json-file/placeholder-questions.json");
  let questionsJSON = await questions.json();
  let questionsArray = questionsJSON.placeholderQuestions;

  let categoriesArray = [];
  let firstRoundQuestionsArray = [];
  let secondRoundQuestionsArray = [];
  let lastRoundQuestion;

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
      } else if (i <= 29) {
        firstRoundQuestionsArray.push(questionsArray[i].question);
      } else if (i > 29) {
        secondRoundQuestionsArray.push(questionsArray[i].question);
      }
    }
  }

  getQuestions();

}

getData();

let gridBoxes = document.getElementsByClassName("grid-item one");
let gridBoxesArray = [...gridBoxes]

gridBoxesArray.forEach((box) => {box.addEventListener("click", popupQuestion)})

function popupQuestion(){
  let questionDisplayBox = document.getElementById("overlay")
  questionDisplayBox.style.display = 'block'
  let questionID = this.id;
  console.log (questionID)
}



