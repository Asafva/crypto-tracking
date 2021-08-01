$(document).ready(function () {
    $("#menu a").click(function () {
        $(this).tab('show');
    });

    getCache(displayCards, alert, "https://api.coingecko.com/api/v3/coins/");

    function displayCards(data) {
        checkedCards = JSON.parse(localStorage.getItem("liveReports"))
        if (checkedCards == null)
            checkedCards = [];
        counter = 0;
        for (const card of data) {
            counter++; if (counter > 100) break;
            $("#cardsList").append(`
                <div class= "col" symbol="`+ card.symbol + `" cardid="` + card.id + `">
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">` + card.name + `</h5>
                        <div class="form-check form-switch card-toggle">
                        <label for=""><input class="form-check-input card-checkbox" type="checkbox" cardid="`+ card.id + `" ` + (checkedCards.includes(card.symbol) ? `checked="checked"` : "") + `></label>
                    </div>
                            <br>
                                <p class="card-text">`+ card.symbol + `</p>
                                <p>
                                <button class="btn btn-primary" type="button" data-bs-toggle="collapse" onclick="loadMoreInfo('`+ card.id + `')"
                                    data-bs-target="#card-info-`+ counter + `" aria-expanded="false"
                                    aria-controls="card-info-`+ counter + `">
                                    More Info
                                </button>
                            </p>
                            <div class="collapse" id="card-info-`+ counter + `">
                                <div class="card card-body"  id="card-body-` + card.id + `">
                               
                                </div>
                            </div>
                
                        </div>
                    </div>
             `);

        }
        let checkboxes = $(':checkbox').on('change', function (e) {
            checkedCards = JSON.parse(localStorage.getItem("liveReports"))
            if (checkedCards == null)
                checkedCards = [];
            let max = 5;
            let maxChecked = checkboxes.filter(':checked').length > max;

            if (maxChecked) {
                $(this).prop("checked", false);
                $("#pending-card").val($(this).attr("cardid"))
                showMaxCoinAlert(checkedCards)
            }

            saveCheckedCards();
        });
        $("#live-reports").append();

        $("#about").append(`
                 <h3>
                 Personal Info:
                 </h1>
                 <div>
                 Name: Asaf
                 </br>
                 Last Name: Wallach
                 </br>
                 Date Of Birth: 13/09/1996
                 </br>
                </div>
                <h3>
                John Bryce Project 2:
                </h3>
                <div>
                 In this project i had to take multiple api requests, and show a list of coins using Ajax.
                 By showing the user the list of coins he can see this coin picture, and its price in Euro,Dollar and ILS.
                 </br>
                 The assingment was to wirte the code in JQuery.
                 </div>
                 `);

        $("#searchBox").on("keyup", function () {
            var value = $(this).val().toLowerCase();
            $("#cardsList > *").filter(function () {
                $(this).toggle($(this).attr('symbol') == value || value == "");
            });
        });
        $("#coinListPop").append(`
        <div> `+ checkedCards + `</br> </div>
        `)

    };

});

function loadMoreInfo(coinId) {
    $("#card-body-" + coinId).html(`<div class="loader"></div>`);
    getCache(updateCardInfo, alert, "https://api.coingecko.com/api/v3/coins/" + coinId);
}
function updateCardInfo(card) {
    console.log(card);
    let body = ` <p class="card-text">` + card.id + `</p>
    <p><img src=`+ card.image.small + `></p>


    <p class="card-text">`+ "Dollar: " + card.market_data.current_price.usd + "$" + `</p>
    <p class="card-text">`+ "Euro: " + card.market_data.current_price.eur + "€" + `</p>
    <p class="card-text">`+ "ILS: " + card.market_data.current_price.ils + "₪" + `</p>
    `;
    $("#card-body-" + card.id).html(body);
}

function getCache(callback, errorCallback, requestUrl) {
    cache = JSON.parse(localStorage.getItem(requestUrl));
    let currentTime = new Date().getTime()
    if (cache != null && Date.parse(cache.time) + (2 * 60 * 1000) > currentTime) {
        callback(cache.data);
    }
    else {
        $.ajax({
            url: requestUrl,
            success: data => updateCache(data, requestUrl, callback),
            error: err => errorCallback(err)
        });
    }

}

function updateCache(data, requestUrl, callback) {
    const cacheArray = { data: data, time: new Date() };
    const CacheItem = JSON.stringify(cacheArray);
    localStorage.setItem(requestUrl, CacheItem);
    callback(data);

}

document.onreadystatechange = function () {
    if (document.readyState !== "complete") {
        document.querySelector("body").style.visibility = "hidden";
        document.querySelector("#loader").style.visibility = "visible";
    } else {
        document.querySelector("#loader").style.display = "none";
        document.querySelector("body").style.visibility = "visible";
    }
};

$(function () {
    $('[data-popup-close]').on('click', function (e) {
        var targeted_popup_class = jQuery(this).attr('data-popup-close');
        $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);

        e.preventDefault();
    });
});

function showMaxCoinAlert(checkedCards) {
    let pendingCard = $("#pending-card").val()
    let pendingCardSymbol = $("#cardsList div[cardid=" + pendingCard + "]").attr("symbol")
    $(".popup[data-popup='coins-popup'] .popup-inner p code").html(pendingCardSymbol)

    $("#checked-list").html("")
    $('[data-popup="coins-popup"]').fadeIn(350);
    for (let i = 0; i < checkedCards.length; i++) {
        $("#checked-list").append(`
        <div class="form-check form-switch">`+ checkedCards[i] + ` <input class="form-check-input checked-item" cardid="` + $("#cardsList div[symbol=" + checkedCards[i] + "]").attr("cardid") + `" type="checkbox" checked="checked">
        </div>
            `)
    }
    $('input.checked-item').on('change', function (e) {
        let cardToDelete = $(e.target).attr("cardid")
        $("input.card-checkbox[cardid='" + cardToDelete + "']").prop("checked", false);
        let pendingCard = $("#pending-card").val()
        $("input.card-checkbox[cardid='" + pendingCard + "']").prop("checked", true);
        $('[data-popup="coins-popup"]').fadeOut(350);

        saveCheckedCards();
    });
}

var chart;
$(function () {
    let dps = []; // dataPoints
    let chartData = [];
    let updateInterval = -1;
    $('.nav-item a').on('shown.bs.tab', function (event) {
        if (updateInterval != -1) {
            clearInterval(updateInterval)
            updateInterval = -1
        }
    });
    $('.nav-item a.reports').on('shown.bs.tab', function (event) {

        checkedCards = JSON.parse(localStorage.getItem("liveReports"))
        if (checkedCards == null)
            checkedCards = [];


        while (chartData.length > 0) {
            chartData.pop();
        }
        dps = [];
        for (let i = 0; i < checkedCards.length; i++) {
            let empty = [];
            dps.push(empty);
            chartData.push(
                {
                    name: checkedCards[i],
                    xValueType: "dateTime",
                    xValueFormatString: "HH:mm:ss",
                    yValueFormatString: "$#######.##",
                    dataPoints: dps[i],
                    type: "stackedArea",
                    showInLegend: true,

                }
            )
        }

        updateChart();

        updateInterval = setInterval(function () { updateChart(); }, 2000);
        let x = $(event.target).text()

        if (x == "Live Reports")
            chart.render()
    });

    let options = {
        title: {
            text: "Selected Coins"
        },
        axisX: {
            title: "Time Stamp",
            valueFormatString: "HH:mm:ss"
        },
        axisY: {
            title: "Coin Value"

        },
        toolTip: {
            shared: true,
        },
        legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries
        },

        data: chartData

    };
    chart = new CanvasJS.Chart("chartContainer", options)
    chart.render();

    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) == "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }




    let updateChart = function () {

        $.ajax({
            url: "https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + checkedCards.join(",") + "&tsyms=USD",
            success: function (data) {

                checkedCards = JSON.parse(localStorage.getItem("liveReports"))
                if (checkedCards == null)
                    checkedCards = [];
                let time = new Date();
                for (let i = 0; i < checkedCards.length; i++) {

                    dps[i].push({
                        x: time.getTime(),
                        y: data[checkedCards[i].toUpperCase()]["USD"]

                    });
                }
                chart.render();
            },
            error: err => console.log(err)
        });

    };
});
function saveCheckedCards() {
    checkedCards = [];
    $(".card-checkbox:checked").each(function () {
        checkedCards.push($(this).closest("div.col").attr("symbol"))
    });
    localStorage.setItem("liveReports", JSON.stringify(checkedCards))
}


function siteErro() {

}