// Yu-Gi-Oh API from: https://db.ygoprodeck.com/api-guide/
//          Endpoint: https://db.ygoprodeck.com/api/v7/cardinfo.php

// set URL API endpoint constant
const URL = "cardinfo.php";
const searchBar = document.getElementById('searchBar');
let searchedCardList = document.getElementById("searchedCardList");
let cardList = [];

// console.log(searchBar);
// EventListner to track key inputs
searchBar.addEventListener('keyup', (search) => {
    const searchString = search.target.value.toLowerCase();
    const filteredNames = cardList.data.filter(cards => cards.name.toLowerCase().includes(searchString));
    
    let searchedNameOut = ``;

    // loop through array to output names
    for (let i = 0; i < filteredNames.length; i++) {
        searchedNameOut +=
        `
        <li id="${filteredNames[i].id}" onClick="showCard(this.id)">${filteredNames[i].name}</li>
        `;
        if (i > 30) {
            break;
        }
    }
    
    // style search results as user types
    searchedCardList.style.height = "200px";
    searchedCardList.style.overflowX = "hidden";
    searchedCardList.style.overflowY = "auto";

    // clear search results if search is empty
    if(searchString.length == 0) {
        searchedNameOut = ``;
        searchedCardList.style.height = "0px"
    }

    searchedCardList.innerHTML = searchedNameOut;
});

// retrieve api information as json object using fetch
async function getAPI(URL) {
    let res = await fetch(URL);
    cardList = await res.json();

    console.log(cardList);
    showCard("35809262");
}

function showCard(clickedID) {
    let cardInfo = ``;
    // output card information by searching for it using for of loop
    for (let card of cardList.data) {
        if (card.id == clickedID) {
            cardInfo +=
            `
            <h2>${card.name}</h2>
            <h5">${card.type}</h5>
            <p>${card.desc}</p>
            `;
            if (card.type !== "Spell Card" && card.type !== "Trap Card") {
                cardInfo +=
                `
                <p>ATK / ${card.atk}  DEF / ${card.def}</p>
                `;
            }
            document.getElementById("cardImage").src = card.card_images[0].image_url
            document.getElementById("cardInfo").innerHTML = cardInfo;
            searchedNameOut = ``;
            searchedCardList.style.height = "0px"
            break;
        }
    }
}

// run the function
getAPI(URL);