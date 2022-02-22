// Yu-Gi-Oh API from: https://db.ygoprodeck.com/api-guide/
//          Endpoint: https://db.ygoprodeck.com/api/v7/cardinfo.php

// set URL API endpoint constant
// URL endpoint downloaded to test locally
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
        // limit search results to 15 search results
        if (i > 15) {
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
    // run showCard function with ID to output default card on start
    showCard("89943723");
}

// async function to fetch image from Google Cloud URL and convert/store as DataURL
async function storeImage(cardURL, cardName, i) {
    let blob = await fetch(cardURL).then(r => r.blob());
    let dataURL = await new Promise(resolve => {
        let reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
    // if local storage is full, clear local storage
    try {
        localStorage.setItem(`${cardName}${i}`, dataURL);
    } catch (e) {
        // if local storage is full/if errors match
        if (e == QUOTA_EXCEEDED_ERR) {
            alert('Local Storage is full!');
            // clear all of the local storage
            localStorage.clear();
            localStorage.setItem(`${cardName}${i}`, dataURL);
        }
    }
}

// function to store all images and output the first
function getImage(cardImageGallery, cardName) {
    let cardImageOut = ``
    let extra = document.getElementById("extra");
    let altCardLen = artContainer.children.length;
    let extraPick, getAltArt;
    // if the image is not already in localStorage, first time outputting will output from GoogleCloud URL
    if (localStorage.getItem(`${cardName}${0}`) == null) {
        // for loop to convert imageURLs to DataURLs and store all of the possible card arts
        for (let i = 0; i < cardImageGallery.length; i++) {
            storeImage(cardImageGallery[i].image_url, cardName, i);
        }
        // output first card art using URL
        cardImage.src = cardImageGallery[0].image_url;
        // output alternate art from GoogleCloud URL if they exists
        if (extra) {
            // first clear alt art if it exists
            for (let k = 2; k <= altCardLen; k++) {
                extraPick = artContainer.querySelectorAll("div");
                extraPick[1].remove();
            }
            extraPick[0].className = "carousel-item active";
        }
        // create HTML for alt art if it exists
        if (cardImageGallery.length > 1) {
            for (let j = 1; j < cardImageGallery.length; j++) {
                cardImageOut +=
                    `
                    <div class="carousel-item" id="extra">
                        <img src="${cardImageGallery[j].image_url}" class="image-fluid w-50 mx-auto d-block">
                    </div>
                    `;
            }
        }
        artContainer.insertAdjacentHTML("beforeend", cardImageOut);
    } else {
        // else: if card art is already stored  
        // output first card art using localStorage after it has been stored
        cardImage.src = localStorage.getItem(`${cardName}${0}`);
        // clear alt art if they exists
        if (extra) {
            for (let k = 2; k <= altCardLen; k++) {
                extraPick = artContainer.querySelectorAll("div");
                extraPick[1].remove();
            }
            extraPick[0].className = "carousel-item active";
        }
        // create HTML if alt art exists
        if (cardImageGallery.length > 1) {
            for (let j = 1; j < cardImageGallery.length; j++) {
                getAltArt = localStorage.getItem(`${cardName}${j}`);
                cardImageOut +=
                    `
                    <div class="carousel-item" id="extra">
                        <img src="${getAltArt}" class="image-fluid w-50 mx-auto d-block">
                    </div>
                    `;
            }
        }
        artContainer.insertAdjacentHTML("beforeend", cardImageOut);
    }
}

function showCard(clickedID) {
    let cardInfo = ``;
    let card = cardList.data.find(card => card.id == clickedID);
    // output card information by searching for it using .find function
    // create HTML to output using clicked card information
    cardInfo +=
        `
        <h3>${card.name}</h3>
        <h6">${card.type}</h6>
        <h6>${card.race}</h6>
        <hr>
        <p>${card.desc}</p>
        <hr>
        `;
    // switch to check for card type output
    switch (true) {
        case (card.type.includes("Pendulum")):
            cardInfo +=
                `
                <p><b>ATK</b> / ${card.atk} &nbsp;&nbsp; DEF / <b>${card.def}</b></p>
                <p>Scales: ${card.scale}</p>
                `;
            document.getElementById("cardInfo").innerHTML = cardInfo;
            break;
        case (card.type.includes("Link")):
            cardInfo +=
                `
                <p><b>ATK</b> / ${card.atk} &nbsp;&nbsp; <b>LINK</b>-${card.linkval}</p>
                <p><b>Link Arrows</b>: 
                `;
            for (let d = 0; d < card.linkmarkers.length; d++) {
                cardInfo += `${card.linkmarkers[d]}	&nbsp;&nbsp;`;
            }
            cardInfo += `</p>`;
            document.getElementById("cardInfo").innerHTML = cardInfo;
            break;
        case (card.type.includes("Spell") || card.type.includes("Trap")):
            document.getElementById("cardInfo").innerHTML = cardInfo;
            break;
        default:
            cardInfo +=
                `
                <p><b>ATK</b> / ${card.atk} &nbsp;&nbsp; DEF / <b>${card.def}</b></p>
                `;
            document.getElementById("cardInfo").innerHTML = cardInfo;
    }
    // run getImage to output/store images
    getImage(card.card_images, card.name);
    // reset search bar and remove search results
    searchedNameOut = ``;
    searchedCardList.style.height = "0px";
}

// run aync function to retrieve API information
getAPI(URL);