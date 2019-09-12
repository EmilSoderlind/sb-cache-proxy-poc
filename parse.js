var request = require('request');
let xmlParser = require('xml2json');

var startDate = new Date()

const express = require('express')
const app = express()
const port = 3000

var articleList = undefined;

console.log("Parsing from SB-API starting.")
request('https://www.systembolaget.se/api/assortment/products/xml', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.info('Download time: %dms', new Date() - startDate)
      let xmlString = body;

      var start = new Date()
      let resultJSON = JSON.parse(xmlParser.toJson(xmlString));
      console.info('XML to JSON parse time: %dms', new Date() - start)

      articleList = resultJSON["artiklar"]["artikel"];


      var start = new Date()
      addAPKtoAllArticlceObjects(articleList)
      console.info('APK calculation time: %dms', new Date() - start)

      var start = new Date()
      articleList.sort(function(a, b) {
        return parseFloat(b.APK) - parseFloat(a.APK);
      });
      console.info('Sorting time: %dms', new Date() - start)

      console.info('Total time time: %dms', new Date() - startDate)

      console.log("\nAntal produkter: " + Object.keys(articleList).length)


      for(var i = 0; i<10; i++){
        console.log((i+1) + ". " + articleList[i].Namn + " " + articleList[i].APK)
      }

    }else{
      console.log("ERROR: \n" + response.statusCode + "-" + error)
    }
})

function addAPKtoAllArticlceObjects(articleList){
  var count = 0;

  for (var i = 0; i < articleList.length; i++) {
    addAPKtoArticleObject(articleList[i])
    //console.log(i +"/"+(articleList.length-1) + " APK: " + articleList[i].APK)
  }
}

function addAPKtoArticleObject(articleObject) {

  var price = parseFloat(articleObject.Prisinklmoms);
  var volume = parseFloat(articleObject.Volymiml);
  var alcohol = parseFloat(String(articleObject.Alkoholhalt).replace("%",""));

  if(Number.isNaN(price) || Number.isNaN(volume) || Number.isNaN(alcohol)){
    console.error("---------------------")
    console.error("Fatal error in addAPKtoArticleObject. A value is NaN.")
    console.error("Price: " + price);
    console.error("volume: " + volume);
    console.error("alcohol: " + alcohol);
    console.error("---------------------")
    return -1;
  }

  articleObject.APK = ((alcohol/100)*volume)/price;
}

function isFloat(n) {
    return n === +n && n !== (n|0);
}

function isInteger(n) {
    return n === +n && n === (n|0);
}

app.get('/', (req, res) => {res.json(articleList)})

app.get('/:numberOfArticles', (req, res) => {

  if(articleList == undefined){
    res.sendStatus(204)
  }else{
    var start = new Date()
    res.json(articleList.slice(0, req.params.numberOfArticles))
    console.info('Response time: %dms', new Date() - start)
  }

})
app.listen(port, () => console.log(`Listening on port ${port}!`))
