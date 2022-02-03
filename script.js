// Yu-Gi-Oh API from: https://db.ygoprodeck.com/api-guide/
//          Endpoint: https://db.ygoprodeck.com/api/v7/cardinfo.php

// set URL API endpoint constant
const URL = "cardinfo.php";
const searchBar = document.getElementById('searchBar');
let searchedCardList = document.getElementById("searchedCardList");
let artContainer = document.getElementById("getAltArt");
let cardImage = document.getElementById("cardImage");
let cardList = [];

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
        searchedCardList.style.height = "0px";
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
    // console.log(dataURL);
    try {
        localStorage.setItem(`${cardName}${i}`, dataURL);
    } catch (e) {
        // if local storage is full
        // if errors match
        if (e == QUOTA_EXCEEDED_ERR) {
            alert('Local Storage is full!');
            // clear all of the local storage
            localStorage.clear();
            localStorage.setItem(`${cardName}${i}`, dataURL);
        }
    }
    // localStorage.setItem(`${cardName}${i}`, dataURL);
}

// function to store all images and output the first
function getImage(cardImageGallery, cardName) {
    if (localStorage.getItem(`${cardName}${0}`) == null) {
        // for loop to convert imageURLs to DataURLs and store all of the possible card arts
        for (let i = 0; i < cardImageGallery.length; i++) {
            storeImage(cardImageGallery[i].image_url, cardName, i);
        }
        // output first card art using URL
        cardImage.src = cardImageGallery[0].image_url;
        // console.log("This should appear if a new card is being stored into local storage.");
    } else {
        // output first card art using localStorage after it has been stored
        cardImage.src = localStorage.getItem(`${cardName}${0}`);
        // console.log("This should appear if a card is being pulled from local storage.");
    }
}

function showCard(clickedID) {
    let cardInfo = ``;
    let cardImageOut = ``;
    let extra = document.getElementById("extra");
    let altCardLen = artContainer.children.length;
    let extraPick, getAltArt;
    // output card information by searching for it using for of loop
    for (let card of cardList.data) {
        if (card.id == clickedID) {
            cardInfo +=
                `
            <h3>${card.name}</h3>
            <h6">${card.type}</h6>
            <h6>${card.race}</h6>
            <p>${card.desc}</p>
            `;
            // switch to check for card type output
            switch (true) {
                case (card.type.includes("Pendulum")):
                    cardInfo +=
                        `
                    <p>ATK / ${card.atk}   DEF / ${card.def}</p>
                    <p>Scales: ${card.scale}</p>
                    `;
                    document.getElementById("cardInfo").innerHTML = cardInfo;
                    break;
                case (card.type.includes("Link")):
                    cardInfo +=
                        `
                    <p>ATK / ${card.atk}   LINK-${card.linkval}</p>
                    <p>Link Arrows: </p>
                    `;
                    document.getElementById("cardInfo").innerHTML = cardInfo;
                    break;
                case (card.type.includes("Spell") || card.type.includes("Trap")):
                    document.getElementById("cardInfo").innerHTML = cardInfo;
                    break;
                default:
                    cardInfo +=
                        `
                    <p>ATK / ${card.atk}   DEF / ${card.def}</p>
                    `;
                    document.getElementById("cardInfo").innerHTML = cardInfo;
            }
            // function to check if card image is already stored in localStorage and output first image
            getImage(card.card_images, card.name);
            // check for alternate card art
            if (extra) {
                for (let k = 1; k < altCardLen; k++) {
                    extraPick = artContainer.querySelectorAll("div");
                    extraPick[1].remove();
                    console.log(extra);
                    console.log("Clear alternate card art and then load new alternate art.");
                }
            }
            if (card.card_images.length > 1) {
                for (let j = 1; j < card.card_images.length; j++) {
                    getAltArt = localStorage.getItem(`${card.name}${j}`);
                    cardImageOut +=
                        `
                        <div class="carousel-item" id="extra">
                            <img src="${getAltArt}" class="image-fluid w-50 mx-auto d-block">
                        </div>
                        `;
                }
            }
            // Output Card alternate card art
            // if more card arts exist, insert string of html
            artContainer.insertAdjacentHTML("beforeend", cardImageOut);
            // Reset search to clear results when card has been clicked on
            searchedNameOut = ``;
            searchedCardList.style.height = "0px";
            break;
        }
    }
}

// run aync function to retrieve API information
getAPI(URL);