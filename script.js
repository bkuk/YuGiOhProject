// Yu-Gi-Oh API from: https://db.ygoprodeck.com/api-guide/
//          Endpoint: https://db.ygoprodeck.com/api/v7/cardinfo.php

// set URL API endpoint constant
const URL = "cardinfo.php";
const searchBar = document.getElementById('searchBar');
let searchedCardList = document.getElementById("searchedCardList");
let cardImage = document.getElementById("cardImage")
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
    if (searchString.length == 0) {
        searchedNameOut = ``;
        searchedCardList.style.height = "0px"
    }
    // Output the searched name results
    searchedCardList.innerHTML = searchedNameOut;
});

// retrieve api information as json object using fetch
async function getAPI(URL) {
    let res = await fetch(URL);
    cardList = await res.json();
    // console.log(cardList);
    // run showCard function with ID to output default card on start
    showCard("89943723");
}

// async function to fetch image from Google Cloud URL and convert/store as DataURL
// since localStorage only allows the storage of strings
async function storeImage(cardURL, cardName, i) {
    let blob = await fetch(cardURL).then(r => r.blob());
    let dataURL = await new Promise(resolve => {
        let reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
    console.log(dataURL);
    localStorage.setItem(`${cardName}${i}`, dataURL);
}

function showCard(clickedID) {
    let cardInfo = ``;
    let cardImageOut = ``;
    let getAltArt;
    // output card information by searching for it using for of loop
    for (let card of cardList.data) {
        if (card.id == clickedID) {
            cardInfo +=
            `
            <h2>${card.name}</h2>
            <h5">${card.type}</h5>
            <p>${card.desc}</p>
            `;
            // if statement to check if card type is spell or trap
            if (card.type !== "Spell Card" && card.type !== "Trap Card") {
                cardInfo +=
                `
                <p>ATK / ${card.atk}  DEF / ${card.def}</p>
                `;
            }
            // if statement to check if card image is already stored in localStorage
            if (localStorage.getItem(`${card.name}${0}`) == null) {
                // for loop to convert imageURLs to DataURLs and store all of the possible card arts
                for (let i = 0; i < card.card_images.length; i++) {
                    storeImage(card.card_images[i].image_url, card.name, i);
                }
                console.log("This shouldn't appear.");
            }
            console.log(card.card_images.length);
            // Output Card Image
            // document.getElementsById("extra").remove();                         // clear alternate card art HTML elements

            cardImage.src = localStorage.getItem(`${card.name}${0}`);           // start new if new card is clicked on
            if (card.card_images.length > 0) {
                for (let j = 1; j < card.card_images.length; j++) {
                    getAltArt = localStorage.getItem(`${card.name}${j}`);
                    cardImageOut +=
                    `
                    <div class="carousel-item">
                        <img src="${getAltArt}" id="extra" class="image-fluid w-50 mx-auto d-block">
                    </div>
                    `;
                    document.getElementById("getAltArt").insertAdjacentHTML("beforeend", cardImageOut);
                }
            }

            // Output Card Information
            document.getElementById("cardInfo").innerHTML = cardInfo;
            // Reset search to clear results when card has been clicked on
            searchedNameOut = ``;
            searchedCardList.style.height = "0px";
            break;
        }
    }
}

// run the function
getAPI(URL);