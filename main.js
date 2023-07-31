'use strict';

//navBar - replace content in Main Content Div

const mainContent = document.getElementById("page-main-content")
const currenciesMainContent = document.getElementById("currencies-main-content")
const reportsMainContent = document.getElementById("reports-main-content")
const aboutMainContent = document.getElementById("about-main-content")
const cardsContainer = document.getElementById('cards-container');
const searchInput = document.getElementById("search-bar")
const allSwitchButtons = document.getElementsByClassName('follow-coin-in-report-switch')
const modalBody = document.getElementById('modal-body')
const allModalSwitches = document.getElementsByClassName('coin-in-modal');
const allCollapses = document.getElementsByClassName('collapse');
const allCards = document.getElementsByClassName('card')



let allCoins = []
let coinsToDisplay = []
let chosenCoins = []
let intervalId;
let coinsData = []
let chart;

window.addEventListener('scroll', reveal)

function reveal() {
    const reveals = document.querySelectorAll('.reveal');

    for(const i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const revealTop = reveals[i].getBoundingClientRect().top;
        const revealPoint = 300;

        if(revealTop < windowHeight - revealPoint) {
            reveals[i].classList.add('active')
        } else {
            reveals[i].classList.remove('active')

        }
    }
}

init()

searchInput.addEventListener("input", (e) => {
    const searchValue = e.target.value;

    if (searchValue) {
        coinsToDisplay = allCoins.filter((coin) => {
            return coin.name.toLowerCase().includes(searchValue.toLowerCase()) || coin.symbol.toLowerCase().includes(searchValue.toLowerCase())
        })
    } else {
        coinsToDisplay = allCoins
    }
    displayCurrencies()
    displayCoins()
})

async function init() {
    try {
        const coins = await getCoins('usd')
        allCoins = coins;
    } catch (err) {
        console.log('Error has accured in init function:', err.stack);
    } finally {
        coinsToDisplay = allCoins;
        dynamicNavBar()
        displayCoins()
    }
}


function dynamicNavBar() {
    const currenciesLink = document.getElementById("currencies-link");
    const reportsLink = document.getElementById("reports-link");
    const aboutLink = document.getElementById("about-link");

    currenciesLink.addEventListener("click", displayCurrencies);
    reportsLink.addEventListener("click", displayReports);
    aboutLink.addEventListener("click", displayAbout);
}

function displayCurrencies() {
    currenciesMainContent.style.display = 'block';
    reportsMainContent.style.display = 'none'
    aboutMainContent.style.display = 'none';
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null;
    }
    for (const switchButton of allSwitchButtons) {
        switchButton.checked = false;
    }
    chosenCoins = []
}

function displayReports() {
    currenciesMainContent.style.display = 'none'
    reportsMainContent.style.display = 'block'
    aboutMainContent.style.display = 'none'

    const chartContainer = document.getElementById('chart-container')
    const noChosenCoinsMessage = document.getElementById('no-chosen-coins-message')

    if (chosenCoins.length) {
        chartContainer.style.display = 'block'
        noChosenCoinsMessage.style.display = 'none'
        displayChart()
        intervalId = setInterval(updateChart, 2000)
    } else {
        chartContainer.style.display = 'block'
        noChosenCoinsMessage.style.display = 'block'
        if (chart) {
            coinsData = []
            chart.destroy()
            chart = null;
        }
    }
}

function displayAbout() {
    currenciesMainContent.style.display = 'none'
    reportsMainContent.style.display = 'none'
    aboutMainContent.style.display = 'block'
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null;
    }
}

async function getCoins(currency) {
    try {
        const url = new URL('https://api.coingecko.com/api/v3/coins/markets')
        url.searchParams.append('vs_currency', `${currency}`)
        url.searchParams.append('order', 'market_cap_desc')
        // changed to 50 coins in the query parameter
        url.searchParams.append('per_page', '50')
        url.searchParams.append('page', '1')

        //for test purposes you may use data.json attached to this file -using this URL instead of the url above
        // const url = new URL('/assets/data.json', window.origin)
        const response = await fetch(url);
        const coins = await response.json();
        return coins;
    } catch (err) {
        console.log('Error has accured in getCoins function:', err.stack);
    }
}

async function getCoinInfo(coinId, btnElement) {
    try {
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

        $(btnElement).closest('.card').toggleClass('open-card')
    } catch (err) {
        console.log('Error has accured in getCoinInfo function:', err.stack);
    }

}


async function displayCoins() {
    try {
        const coins = coinsToDisplay;
        if (coinsToDisplay.length === 0) {
            cardsContainer.innerHTML = '<p id="no-results-message" class="no-results-message">No Results...</p>'
        } else {
            let html = ''

            for (const coin of coins) {


                html += `
                <div class="col-lg-2 col-md-3 col-sm-6 col-12">   
                    <div class="card reveal" id="card-${coin.id}">
                        <img src="${coin.image}" class="card-img-top coin-card-image" alt="${coin.image}">
                        <div class="form-check form-switch">
                            <input class="form-check-input follow-coin-in-report-switch" type="checkbox" onclick="updateChosenCoins(allSwitchButtons)" role="switch" id="${coin.id}" name="${coin.id}">
                        </div>
                        <div class="card-body">
                            <h5 class="card-symbol">${coin.symbol}</h5>
                            <h6 class="card-title">${coin.name}</h6>
                        
                            <p>
                                <button onclick="getCoinInfo('${coin.id}', this)" class=" more-info-btn" type="button" data-bs-toggle="collapse" data-bs-target="#coin-collapse-${coin.id}" aria-expanded="false" aria-controls="collapseExample">
                                More Info
                                </button>
                            </p>
                            <div class="collapse card-collapse" id="coin-collapse-${coin.id}">
                        
                                <div class="card-body">
                                    <table>
                                        
                                        
                                        <tbody>
                                            <tr table-primary>
                                                <th id="card-info-dollar" class="table-primary dollar-th">$</th>
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
    } catch (err) {
        console.log('Error has accrued in displayCoins function:', err.stack);
    }
}


// switchButtons parameter may be all switch buttons in main page or the ones displayed in the modal
function updateChosenCoins(switchButtons) {
    let chosenCoinsIds = []

    let numberOfOnSwitches = 0
    for (const switchButton of switchButtons) {
        const coinId = switchButton.id

        if (switchButton.checked) {
            chosenCoinsIds.push(coinId)
            numberOfOnSwitches++
            if (numberOfOnSwitches > 5) {
                chosenCoins = allCoins.filter((coin) => {
                    return !!chosenCoinsIds.find((id) => {
                        return coin.id === id
                    })
                })

                displayCoinsInModal()
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
}


function showDialog() {
    $('#coins-limitation-dialog').modal('show')
}

function displayCoinsInModal() {
    let html = ''
    for (const coin of chosenCoins) {
        html += `
        <div class="col-lg-2 col-md-3 col-sm-6 col-12">   
            <div class="card">
                <img src="${coin.image}" class="card-img-top coin-card-image" alt="${coin.image}">
                <div class="form-check form-switch">
                    <input class="form-check-input coin-in-modal" type="checkbox" checked onclick="updateChosenCoins(allModalSwitches)" role="switch" id="${coin.id}" name="${coin.id}">
                </div>
                <div class="card-body">
                <h5 class="card-title">${coin.symbol}</h5>
                <h6 class="card-title">${coin.name}</h6>
                </div>
            </div>
  
        </div>`
    }
    html += `<button type="button" class="btn btn-info" onclick="goToReportFromModal()">Go To Report</button>    `
    html += `<button type="button" class="btn btn-info" onclick="closeModal()">Cancel</button>    `
    modalBody.innerHTML = html;
}

function closeModal() {
    for (const switchButton of allSwitchButtons) {
        switchButton.checked = false;
    }
    chosenCoins = []
    $('#coins-limitation-dialog').modal('hide')
}

function goToReportFromModal() {
    if (chosenCoins.length <= 5) {
        $('#coins-limitation-dialog').modal('hide')
        displayReports()
    }
}

function displayChart() {
    if (chart) {
        coinsData = []
        chart.destroy()
        chart = null;
    }
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
    try {
        allCoins = await getCoins('usd')
        chosenCoins = allCoins.filter((coin) => {
            return !!chosenCoins.find((chosenCoin) => {
                return coin.id === chosenCoin.id
            })
        })


    } catch (err) {
        console.log('Error has accrued in updateChart function:', err.stack);
    } finally {
        for (const coin of chosenCoins) {

            const coinData = coinsData.find((data) => data.id === coin.id)
            coinData.dataPoints.push({ x: new Date(), y: coin.current_price })
        }


        //TTl = 20 seconds. chart shows 10 data points replaced every 2 sec
        if (coinsData.length > 10) {
            coinsData.shift()
        }

        chart.render()

    }
}

console.log(allCards)

const handleMouseMove = e => {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect(),
        x = e.clientX = rect.left,
        y = e.clientY = rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
}


for (const card of allCards) {
    card.onmousemove = e => handleMouseMove(e);
}

