const inputSearch = document.getElementById("inputSearch");
const selectedLang = document.querySelectorAll('input[name="langs"]');
const selectedOperatorType = document.querySelectorAll('input[name="operatorType"]');
const numbersOfDevFinded = document.querySelector('.numbersOfDevFinded');

const divDevsFiltered = document.querySelector(".devsFiltered");

inputSearch.addEventListener("input", searchDevs);

for (let i = 0; i < selectedLang.length; i++) {
  selectedLang[i].addEventListener("change", searchDevs);
}

for (let i = 0; i < selectedOperatorType.length; i++) {
  selectedOperatorType[i].addEventListener("change", searchDevs);
}

let allDevs = [];
let allDevsFiltered = [];

//get all devs from api e put then on array
async function getAllDevsFromAPI() {
  const res = await fetch("./backend/devs.json");
  const json = await res.json();
  // const res = await fetch("http://localhost:3001/devs");
  // allDevs = json.map(item => {
  allDevs = json.devs.map(item => {

    const lowerCaseName = item.name.toLowerCase();

    return {
      name: item.name,
      nameForSearch: removeAccentMarksFrom(lowerCaseName)
      .split("")
      .filter((char) => char !== " ")
      .join(""),
      picture: item.picture,
      programmingLanguages: item.programmingLanguages,
      programmingLanguagesForSearch: getProgrammingLanguagesFromPerson(item.programmingLanguages),
    };

  });

  console.log("Json Carregado!");
  searchDevs();
}

function getProgrammingLanguagesFromPerson(arrayLangs){
  let languagesArray = [];
  for (let i = 0; i < arrayLangs.length; i++) {
    languagesArray.push(arrayLangs[i].language);
  }
  languagesArray = languagesArray.sort();
  return languagesArray.join("").toLocaleLowerCase();
}

// código provido pelo professor
// https://codesandbox.io/s/search-countries-4dfus?file=/js/script.js
function removeAccentMarksFrom(text) {
  const WITH_ACCENT_MARKS = "áãâäàéèêëíìîïóôõöòúùûüñ".split("");
  const WITHOUT_ACCENT_MARKS = "aaaaaeeeeiiiiooooouuuun".split("");

  const newText = text
    .toLocaleLowerCase()
    .split("")
    .map((char) => {
      /**
       * Se indexOf retorna -1, indica
       * que o elemento não foi encontrado
       * no array. Caso contrário, indexOf
       * retorna a posição de determinado
       * caractere no array de busca
       */
      const index = WITH_ACCENT_MARKS.indexOf(char);

      /**
       * Caso o caractere acentuado tenha sido
       * encontrado, substituímos pelo equivalente
       * do array b
       */
      if (index > -1) {
        return WITHOUT_ACCENT_MARKS[index];
      }

      return char;
    })
    .join("");

  return newText;
}

getAllDevsFromAPI();

function searchDevs() {
  let operatorValue = [];
  let operatorValueTrim = [];
  let valE_OR = [];
  const valueSearched = inputSearch.value;

  for (let i = 0; i < selectedLang.length; i++) {
    if (selectedLang[i].checked) {
      operatorValue.push(selectedLang[i].value);
    }
  }
  
  operatorValueTrim = operatorValue.join("").toLocaleLowerCase();

  for (let i = 0; i < selectedOperatorType.length; i++) {
    if (selectedOperatorType[i].checked) {
      valE_OR.push(selectedOperatorType[i].value);
    }
  }

  allDevsFiltered = allDevs;

  if (valueSearched !== '') {
    allDevsFiltered = allDevs.filter((dev) => {
      if (dev.nameForSearch.toLowerCase().includes(valueSearched.trim())) {
        return dev;
      }
    });
  }

  if (valE_OR[0] === "or") {
    // OR

    allDevsFiltered = allDevsFiltered.filter((dev) => {
      for (let i = 0; i < dev.programmingLanguages.length; i++) {
        if (operatorValue.some(e => e === dev.programmingLanguages[i].language)) {
          return dev;
        }
      }
    });

  } else {
    // AND
    
    allDevsFiltered = allDevsFiltered.filter((dev) => {
      for (let i = 0; i < dev.programmingLanguages.length; i++) {
        if (operatorValueTrim === dev.programmingLanguagesForSearch) {
          return dev;
        }
      }
    });
  }
  
  if (!allDevsFiltered.length) {
    numbersOfDevFinded.innerHTML = '0';
    divDevsFiltered.innerHTML = '<p class="msgBlankDevs">Nenhum dev encontrado!</p>';
  }else{
    renderDevs();
  }

}

// draws devs in screen by append divs in the principal div
function renderDevs() {
  let devsFiltered = "";

  for (let i = 0; i < allDevsFiltered.length; i++) {
    devsFiltered += `
    <div>
      <img src="${allDevsFiltered[i].picture}" alt="${allDevsFiltered[i].name}" title="${allDevsFiltered[i].name}" class="avatar">
      <p>${allDevsFiltered[i].name}</p>
      <div class="imgLanguagesList">
    `;

    for (let j = 0; j < allDevsFiltered[i].programmingLanguages.length; j++) {
      devsFiltered += `<img src="/img-languages/${allDevsFiltered[i].programmingLanguages[j].language.toLowerCase()}.png" class="imgLanguage">`;
    }

    devsFiltered += `</div></div>`;
  }

  numbersOfDevFinded.innerHTML = allDevsFiltered.length;
  divDevsFiltered.innerHTML = devsFiltered;
}