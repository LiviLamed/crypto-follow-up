'use strict';

//navBar - replace content in Main Content Div

const mainContent = document.getElementById("page-main-content")
const currenciesMainContent = document.getElementById("currencies-main-content")
const reportsMainContent = document.getElementById("reports-main-content")
const aboutMainContent = document.getElementById("about-main-content")
const cardsContainer = document.getElementById('cards-container');
const searchInput = document.getElementById("search-bar")
const allSwitchButtons = document.getElementsByClassName('follow-coin-in-report-switch')
//setTimeout(() => {

// modal.show()

//console.log(modal)    
//}, 3000)

init()

let allCoins = []
let coinsToDisplay = []
let intervalId;





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
    const coins = await getCoins('usd')
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
       if(intervalId){
        clearInterval(intervalId)
        intervalId = null;
       } 

    }

    function displayReports() {

        currenciesMainContent.style.display = 'none'
        reportsMainContent.style.display = 'block'
        aboutMainContent.style.display = 'none'

        const chartContainer = document.getElementById('chart-container')
        const noChosenCoinsMessage = document.getElementById('no-chosen-coins-message')
        
        if(chosenCoins.length){
            chartContainer.style.display = 'block'
            noChosenCoinsMessage.style.display = 'none'
            displayChart()
            intervalId = setInterval(updateChart, 2000)
        } else {
            chartContainer.style.display = 'none'
            noChosenCoinsMessage.style.display = 'block'
            
        }
    }

    function displayAbout() {
        currenciesMainContent.style.display = 'none'
        reportsMainContent.style.display = 'none'
        aboutMainContent.style.display = 'block'
        if(intervalId){
            clearInterval(intervalId)
            intervalId = null;
           } 
    }



}


async function getCoins(currency) {
    // // const url = new URL('https://api.coingecko.com/api/v3/coins/markets')
    // url.searchParams.append('vs_currency', `${currency}`)
    // url.searchParams.append('order', 'market_cap_desc')
    // // changed to 50 coins in the query parameter
    // url.searchParams.append('per_page', '50')
    // url.searchParams.append('page', '1')

    const url = new URL('/assets/data.json', window.origin)
    const response = await fetch(url);
    const coins = await response.json();
    return coins;
}


async function getCoinInfo(coinId) {

    const url = new URL(`https://api.coingecko.com/api/v3/coins/${coinId}`)
    const response = await fetch(url)
    const coinInfo = await response.json()


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
                    <input class="form-check-input follow-coin-in-report-switch" type="checkbox" onclick="updateChosenCoins()" role="switch" id="${coin.id}" name="${coin.id}">
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
                        
                        
                        <tbody>
                            <tr table-primary>
                                 <th id="card-info-dollar" class="table-primary">$</th>
                                 <td id="coin-usd-price-${coin.id}"></td>

                            </tr>

                            <tr table-primary>
                                <th id="card-info-shekel">₪</th>
                                <td id="coin-ils-price-${coin.id}"></td>
                            </tr>

                            <tr table-primary>
                                <th id="card-info-euro">€</th>
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


let chosenCoins = []



function updateChosenCoins() {
    let chosenCoinsIds = []



    let numberOfOnSwitches = 0
    for (const switchButton of allSwitchButtons) {
        const coinId = switchButton.id

        if (switchButton.checked) {
            chosenCoinsIds.push(coinId)
            numberOfOnSwitches++
            if (numberOfOnSwitches > 5) {
                showDialog()

                return false;
            }
        }
    }

    chosenCoins = allCoins.filter((coin) => {
        return !!chosenCoinsIds.find((id) => {
            return coin.id === id
        })
    })


    updateCardsInModal()
    

    return true

}


function showDialog() {
    $('#coins-limitation-dialog').modal('toggle')

}

function updateCardsInModal() {
    const modalCardsContainer = document.getElementById('modal-body')

    let html = ''
    for (const coin of chosenCoins) {
        html += `
        <div class="col-lg-2 col-md-3 col-sm-6 col-12">   
        <div class="card">
            <img src="${coin.image}" class="card-img-top coin-card-image" alt="${coin.image}">
            <div class="form-check form-switch">
                <input class="form-check-input follow-coin-in-report-switch" type="checkbox" onclick="canFollowCoinInReport()" role="switch" id="switch-${coin.id}" name="${coin.id}">
            </div>
            <div class="card-body">
            <h5 class="card-title">Btn</h5>
            <h6 class="card-title">Bitcoin</h6>
            
            <p>
                <button onclick="getCoinInfo('${coin.id}')" class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#coin-collapse-${coin.id}" aria-expanded="false" aria-controls="collapseExample">
                More Info
                </button>
            </p>
            <div class="collapse" id="coin-collapse-${coin.id}">
            
                <div class="card card-body">
                <table>
                    
                    
                    <tbody>
                        <tr table-primary>
                            <th id="card-info-dollar" class="table-primary">$</th>
                            <td id="coin-usd-price-${coin.id}"></td>

                        </tr>

                        <tr table-primary>
                            <th id="card-info-shekel">₪</th>
                            <td id="coin-ils-price-${coin.id}"></td>
                        </tr>

                        <tr table-primary>
                            <th id="card-info-euro">€</th>
                            <td id="coin-eur-price-${coin.id}"></td>                         
                        </tr>
                    </tbody>

                </table>
                </div>
            </div>
          </div>
        </div>
    </div>
  
  </div>`
    }

    modalCardsContainer.innerHTML = html;
}



let coinsData = []
let chart;


function displayChart() {
    if(chart) {
        coinsData = []
        chart.destroy()
        chart = null;
    }
    console.log('display chart called')
    for (const coin of chosenCoins) {
        const coinData = {
            name: coin.name,
            id: coin.id,
            type: "spline",
            yValueFormatString: "######.##",
            showInLegend: true,
            dataPoints: [{
                x: new Date(),
                y: coin.current_price
            }]

        }
        coinsData.push(coinData)


    }


    chart = new CanvasJS.Chart("chart-container", {
        animationEnabled: true,
        title: {
            text: "Live - Livi's Crypto Report"
        },
        axisX: {
            valueFormatString: "HH:mm:ss"
        },
        axisY: {
            title: "Value For USD",
            suffix: "$"
        },
        legend: {
            cursor: "pointer",
            fontSize: 16,
            itemclick: toggleDataSeries
        },
        toolTip: {
            shared: true
        },
        data: coinsData
    });



    chart.render();



    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        }
        else {
            e.dataSeries.visible = true;
        }
        chart.render();
    }

}



async function updateChart() {
    allCoins = await getCoins('usd')
    chosenCoins = allCoins.filter((coin) => {
        return !!chosenCoins.find((chosenCoin) => {
            return coin.id === chosenCoin.id
        })
    })
    



    for(const coin of chosenCoins) {
        
        const coinData = coinsData.find((data) => data.id === coin.id)
        console.log('updateChart logged: ', coinData)
        coinData.dataPoints.push({x: new Date(), y: coin.current_price})
    }
        chart.render()

    
        // coinsData.push(coinData)

        // //display 20 data-points in chart
        // if (coinsData.length > 20) {
        //     coinsData.shift()
        // }
        // chart.data = coinsData;

        // chart.render()


}




// setInterval (() => updateChart(), 2000);



