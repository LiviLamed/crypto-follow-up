'use strict';

//navBar - replace content in Main Content Div

const mainContent = document.getElementById("page-main-content")
const currenciesMainContent = document.getElementById("currencies-main-content")
const reportsMainContent = document.getElementById("reports-main-content")
const aboutMainContent = document.getElementById("about-main-content")
const cardsContainer = document.getElementById('cards-container');


init()

let allCoins = []
let coinsToDisplay = []


const searchInput = document.getElementById("search-bar")


searchInput.addEventListener("input", (e) => {
    const searchValue = e.target.value;

    if (searchValue) {
        coinsToDisplay = allCoins.filter((coin) => {
            return coin.name.toLowerCase().includes(searchValue.toLowerCase()) || coin.symbol.toLowerCase().includes(searchValue.toLowerCase())
        })
    } else {
        coinsToDisplay = allCoins
    }

    displayCoins()

})



async function init() {
    console.log("Lyle is")
    const coins = await getCoins()
    allCoins = coins;
    coinsToDisplay = allCoins;
    dynamicNavBar()
    displayCoins()


}


function dynamicNavBar() {
    const currenciesLink = document.getElementById("currencies-link");
    const reportsLink = document.getElementById("reports-link");
    const aboutLink = document.getElementById("about-link");

    currenciesLink.addEventListener("click", displayCurrencies);
    reportsLink.addEventListener("click", displayReports);
    aboutLink.addEventListener("click", displayAbout);

    function displayCurrencies() {
        currenciesMainContent.style.display = 'block';
        reportsMainContent.style.display = 'none'
        aboutMainContent.style.display = 'none';
    }

    function displayReports() {
        currenciesMainContent.style.display = 'none'
        reportsMainContent.style.display = 'block'
        aboutMainContent.style.display = 'none'
    }

    function displayAbout() {
        currenciesMainContent.style.display = 'none'
        reportsMainContent.style.display = 'none'
        aboutMainContent.style.display = 'block'
    }



}


async function getCoins() {
    const url = new URL('https://api.coingecko.com/api/v3/coins/markets')
    url.searchParams.append('vs_currency', 'usd')
    url.searchParams.append('order', 'market_cap_desc')
    // changed to 50 coins in the query parameter
    url.searchParams.append('per_page', '50')
    url.searchParams.append('page', '1')

    const response = await fetch(url);
    const coins = await response.json();
    return coins;
}

async function getCoinInfo(coinId) {
    console.log(coinId)
    const url = new URL(`https://api.coingecko.com/api/v3/coins/${coinId}`)
    const response = await fetch(url)
    const coinInfo = await response.json()
    console.log(coinInfo)

    const coinPriceUsd = coinInfo.market_data.current_price.usd;
    const coinPriceIls = coinInfo.market_data.current_price.ils;
    const coinPriceEur = coinInfo.market_data.current_price.eur;

    const coinPriceContainerUsd = document.getElementById(`coin-usd-price-${coinId}`)
    const coinPriceContainerIls = document.getElementById(`coin-ils-price-${coinId}`)
    const coinPriceContainerEur = document.getElementById(`coin-eur-price-${coinId}`)

    coinPriceContainerUsd.innerHTML = coinPriceUsd.toFixed(2);
    coinPriceContainerIls.innerHTML = coinPriceIls.toFixed(2);
    coinPriceContainerEur.innerHTML = coinPriceEur.toFixed(2);

}


async function displayCoins() {
    const coins = coinsToDisplay;
    if (coinsToDisplay.length === 0) {
        cardsContainer.innerHTML = '<p id="no-results-message">No Results...</p>'
    } else {
        let html = ''

        for (const coin of coins) {


            html += `
            <div class="col-lg-2 col-md-3 col-sm-6 col-12">   
            <div class="card">
                <img src="${coin.image}" class="card-img-top coin-card-image" alt="${coin.image}">
                <div class="form-check form-switch">
                    <input class="form-check-input follow-coin-in-report-switch" type="checkbox" onclick="canFollowCoinInReport()" role="switch" id="flexSwitchCheckDefault">
                </div>
                <div class="card-body">
                <h5 class="card-title">${coin.symbol}</h5>
                <h6 class="card-title">${coin.name}</h6>
                
                <p>
                    <button onclick="getCoinInfo('${coin.id}')" class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#coin-collapse-${coin.id}" aria-expanded="false" aria-controls="collapseExample">
                    More Info
                    </button>
                </p>
                <div class="collapse" id="coin-collapse-${coin.id}">
                
                    <div class="card card-body">
                    <table>
                        <thead >
                            <th id="card-info-dollar" class="table-primary">$</th>
                            <th id="card-info-shekel">₪</th>
                            <th id="card-info-euro">€</th>
                        </thead>
                        
                        <tbody>
                            <tr table-primary>
                                <td id="coin-usd-price-${coin.id}"></td>
                                <td id="coin-ils-price-${coin.id}"></td>
                                <td id="coin-eur-price-${coin.id}"></td>                         
                            </tr>

                        </tbody>

                    </table>
                    </div>
                </div>
                </div>
            </div>
        </div>        
        `
        }
        cardsContainer.innerHTML = html;

    }


}


function canFollowCoinInReport() {
    console.log('switch changed')
    const allSwitchButtons = document.getElementsByClassName('follow-coin-in-report-switch')
    let numberOfOnSwitches = 0


    for (const switchButton of allSwitchButtons) {
        if (switchButton.checked) {
            numberOfOnSwitches++
            if (numberOfOnSwitches > 5) {
                console.log("you have 6 now")
                return false;
            }
        }
    }
    return true

}

canFollowCoinInReport()

