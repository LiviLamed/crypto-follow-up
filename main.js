'use strict';

//navBar - replace content in Main Content Div

const mainContent = document.getElementById("page-main-content")
const currenciesMainContent = document.getElementById("currencies-main-content")
const reportsMainContent = document.getElementById("reports-main-content")
const aboutMainContent = document.getElementById("about-main-content")
const cardsContainer = document.getElementById('cards-container');
const searchInput = document.getElementById("search-bar")
const allSwitchButtons = document.getElementsByClassName('follow-coin-in-report-switch')


// const modal = new bootstrap.modal('coins-limitation-dialog');
// modal.show()

init()

let allCoins = []
let coinsToDisplay = []





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
    const coins = await getCoins()
    allCoins = coins;
    coinsToDisplay = allCoins;
    dynamicNavBar()
    displayCoins()
    
    chosenCoins = allCoins.splice(0, 5)
    console.log(chosenCoins)
    displayGraph()
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
    console.log(url)
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

// function getFollowedInReportCoins() {

//     const chosenCoins = allCoins.filter(coin => {

//     })
// }



let chosenCoins = []



function updateChosenCoins() {
    const chosenCoinsIds = []
        
   

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
        return chosenCoinsIds.find((id)=> {
            return coin.id === id
        })
    })


    console.log(chosenCoins)
    displayGraph()

    return true

}


function showDialog() {
    const myModal = document.getElementById('coins-limitation-dialog')
    const myInput = document.getElementById('myInput')

    myModal.modal('show')
}



   
 function displayGraph() {

     var chart = new CanvasJS.Chart("chartContainer", {
	animationEnabled: true,
	title:{
		text: "Live - Livi's Crypto Report"
         },
	axisX: {
		valueFormatString: "YYYY/MM/DD"
	},
	axisY: {
		title: "Value For USD",
		suffix: "$"
	},
	legend:{
		cursor: "pointer",
		fontSize: 16,
		itemclick: toggleDataSeries
	},
	toolTip:{
		shared: true
	},
	data: [{
		name: chosenCoins[0].name,
		type: "spline",
		yValueFormatString: "######.## ",
		showInLegend: true,
		dataPoints: [
			{ x: new Date(2017,6,24), y: 31 },
			{ x: new Date(2017,6,25), y: 31 },
			{ x: new Date(2017,6,26), y: 29 },
			{ x: new Date(2017,6,27), y: 29 },
			{ x: new Date(2017,6,28), y: 31 },
			{ x: new Date(2017,6,29), y: 30 },
			{ x: new Date(2017,6,30), y: 29 }
		]
	},
           {
		name: chosenCoins[1].name,
		type: "spline",
		yValueFormatString: "######.## ",
		showInLegend: true,
		dataPoints: [
			{ x: new Date(2017,6,24), y: 10 },
			{ x: new Date(2017,6,25), y: 31 },
			{ x: new Date(2017,6,26), y: 29 },
			{ x: new Date(2017,6,27), y: 20 },
			{ x: new Date(2017,6,28), y: 31 },
			{ x: new Date(2017,6,29), y: 30 },
			{ x: new Date(2017,6,30), y: 29 }
		]
	},
	{
		name: chosenCoins[2].name,
		type: "spline",
		yValueFormatString: "#0.## °C",
		showInLegend: true,
		dataPoints: [
			{ x: new Date(2017,6,24), y: 20 },
			{ x: new Date(2017,6,25), y: 20 },
			{ x: new Date(2017,6,26), y: 25 },
			{ x: new Date(2017,6,27), y: 25 },
			{ x: new Date(2017,6,28), y: 25 },
			{ x: new Date(2017,6,29), y: 25 },
			{ x: new Date(2017,6,30), y: 25 }
		]
	},
           {
		name: chosenCoins[3].name,
		type: "spline",
		yValueFormatString: "######.## ",
		showInLegend: true,
		dataPoints: [
			{ x: new Date(2017,6,24), y: 31 },
			{ x: new Date(2017,6,25), y: 50 },
			{ x: new Date(2017,6,26), y: 29 },
			{ x: new Date(2017,6,27), y: 33 },
			{ x: new Date(2017,6,28), y: 31 },
			{ x: new Date(2017,6,29), y: 21 },
			{ x: new Date(2017,6,30), y: 29 }
		]
	},
	{
		name: chosenCoins[4].name,
		type: "spline",
		yValueFormatString: "#0.## °C",
		showInLegend: true,
		dataPoints: [
			{ x: new Date(2017,6,24), y: 22 },
			{ x: new Date(2017,6,25), y: 19 },
			{ x: new Date(2017,6,26), y: 23 },
			{ x: new Date(2017,6,27), y: 24 },
			{ x: new Date(2017,6,28), y: 24 },
			{ x: new Date(2017,6,29), y: 23 },
			{ x: new Date(2017,6,30), y: 23 }
		]
	}]
});
chart.render();

function toggleDataSeries(e){
	if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
		e.dataSeries.visible = false;
	}
	else{
		e.dataSeries.visible = true;
	}
	chart.render();
}

}



