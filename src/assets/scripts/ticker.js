let endpoint = 'https://aims2health-webserver.herokuapp.com';

$.ajax({
  type: "GET",
  url: endpoint + "/landingeapp/api/ticker/tickerList",
  contentType: "application/json",
  dataType: 'json',
  success: function (result) {
    let tickerTemplate = $.templates("#tickerTemplate");
    let tickerhtmlOutput = tickerTemplate.render(result.tickerList);
    $("#tickerList").html(tickerhtmlOutput);
  },
  error: function (xhr, status, error) {
    console.log("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText);
  }
});