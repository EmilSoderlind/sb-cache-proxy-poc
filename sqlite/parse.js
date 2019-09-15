var request = require('request');
let xmlParser = require('xml2json');
var slugify = require('slugify')

var startDate = new Date()

const express = require('express')
const app = express()
const port = 3000

const sqlite3 = require('sqlite3').verbose();
var db;

var articleList = "";

function addURLtoArticlceObject(articleObject){
  var baseURL = "https:\//www.systembolaget.se/dryck";
  var categoryURL = "";
  var nameURL = "";
  var numberURL = articleObject.nr;

  // Get category-url-text
  switch(articleObject.Varugrupp.toLowerCase()) {
  case "rött vin":
    categoryURL = "roda-viner"
    break;
  case "blanddrycker":
    categoryURL = "cider-och-blanddrycker"
    break;
  case "cider":
    categoryURL = "cider-och-blanddrycker"
    break;
  case "vitt vin":
    categoryURL = "vita-viner"
    break;
  case "glögg och glühwein":
    categoryURL = "aperitif-dessert";
    break;
  case "öl":
    categoryURL = "ol";
    break;
  case "rosévin":
    categoryURL = "roseviner";
    break;
  case "blandlådor vin":
    categoryURL = "aperitif-dessert";
    break;
  case "smaksatt sprit":
    categoryURL = "sprit";
    break;
  case "sake":
    categoryURL = "aperitif-dessert";
    break;
  case "gin och genever":
    categoryURL = "sprit";
    break;
  case "whisky":
    categoryURL = "sprit";
    break;
  case "rom":
    categoryURL = "sprit";
    break;
  case "aperitif och dessert":
    categoryURL = "aperitif-dessert";
    break;
  case "vermouth":
    categoryURL = "aperitif-dessert";
    break;
  case "likör":
    categoryURL = "sprit";
    break;
  case "mousserande vin":
    categoryURL = "mousserande-viner";
    break;
  case "armagnac och brandy":
    categoryURL = "sprit";
    break;
  case "akvavit":
    categoryURL = "sprit";
    break;
  case "punsch":
    categoryURL = "sprit";
    break;
  case "anissprit":
    categoryURL = "sprit";
    break;
  case "akvavit och kryddat brännvin":
    categoryURL = "sprit";
    break;
  case "alkoholfritt":
    categoryURL = "alkoholfritt";
    break;
  case "cognac":
    categoryURL = "sprit";
    break;
  case "tequila och mezcal":
    categoryURL = "sprit";
    break;
  case "drinkar och cocktails":
    categoryURL = "sprit";
    break;
  case "calvados":
    categoryURL = "sprit";
    break;
  case "grappa och marc":
    categoryURL = "sprit";
    break;
  case "bitter":
    categoryURL = "sprit";
    break;
  case "vodka och brännvin":
    categoryURL = "sprit";
    break;
  case "frukt och druvsprit":
    categoryURL = "sprit";
    break;
  case "blå mousserande":
    categoryURL = "aperitif-dessert";
    break;
  case "rosé - lägre alkoholhalt":
    categoryURL = "roseviner";
    break;
  case "vita - lägre alkoholhalt":
    categoryURL = "vita-viner";
    break;
  case "röda - lägre alkoholhalt":
    categoryURL = "roda-viner";
    break;
  case "sprit av flera typer":
    categoryURL = "sprit";
    break;
  case "blå stilla":
    categoryURL = "aperitif-dessert";
    break;
  case "presentförpackningar":
    categoryURL = "presentartiklar";
    break;
  case "dryckestillbehör":
    categoryURL = "presentartiklar";
    break;
  default:
    console.log("Found new category type:" + articleObject.Varugrupp.toLowerCase())
    // code block
}

  // Get name-url-text
  nameURL = articleObject.Namn.toString().toLowerCase();
  nameURL = nameURL.replaceAll("\'","")
  nameURL = nameURL.replaceAll("!","")
  nameURL = slugify(nameURL);

  var createdURL = baseURL+"/"+categoryURL+"/"+nameURL+"-"+numberURL;
  articleObject.URL = createdURL;
  return createdURL;
}

function initializeDB(){
  console.log("Initialize DB")
  console.log("Trying to create Sqlite3 .DB file")

  db = new sqlite3.Database("./APK.db",
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if(err){
          console.log("ERROR in creating sqlite3 DB - " + err)
        }else{
          console.log("Created sqlite3 DB")
          createDB()
        }
          // do your thing
      });

      console.log("Initialize DB - DONE")
}

function createDB(){
  // open the database
  console.log("Trying to connect to sqlite3 DB")
  db = new sqlite3.Database('./APK.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error("error: " + err.message);
    }
    console.log('Connected to the APK database.');
  });

  console.log("Creating artikel table")
  db.serialize(() => {
    db.all(`CREATE TABLE artikel
              (nr integer primary key,
              Artikelid integer,
              Varnummer integer,
              Namn text,
              Namn2 text,
              Prisinklmoms REAL,
              Pant REAL,
              Volymiml REAL,
              PrisPerLiter REAL,
              Saljstart text,
              Utgatt text,
              Varugrupp text,
              Typ text,
              Stil text,
              Forpackning text,
              Forslutning text,
              Ursprung text,
              Ursprunglandnamn text,
              Producent text,
              Leverantor text,
              Argang integer,
              Provadargang text,
              Alkoholhalt REAL,
              Sortiment text,
              SortimentText text,
              Ekologisk text,
              Etiskt text,
              Koscher text,
              RavarorBeskrivning text,
              URL text,
              APK REAL);`, (err, rows) => {
      if (err) {
        console.error(err.message);
      }
      console.log(rows);
    });
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Closing the database connection.');
  });
}

// Add APK + URL to list of article objects
function processArticleObjects(articleList){
  var count = 0;

  db = new sqlite3.Database('./APK.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error("error: " + err.message);
    }
    console.log('Connected to the APK database.');
  });

  for (var i = 0; i < articleList.length; i++) {
    addURLtoArticlceObject(articleList[i])
    addAPKtoArticleObject(articleList[i])

    addArticleToDB(articleList[i])
  }

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Closing the database connection.');
  });

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

String.prototype.replaceAll = function(str1, str2, ignore){
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}


// Require connection to DB
function addArticleToDB(articleObject){

  /*
  db = new sqlite3.Database('./APK.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error("error: " + err.message);
    }
    console.log('Connected to the APK database.');
  });
  */

  var addArticleSQLQuery = "INSERT INTO artikel (nr,Artikelid,Varnummer,Namn,Namn2,Prisinklmoms,Pant,Volymiml,PrisPerLiter,Saljstart,Utgatt,Varugrupp,Typ,Stil,Forpackning,Forslutning,Ursprung,Ursprunglandnamn,Producent,Leverantor,Argang,Provadargang,Alkoholhalt,Sortiment,SortimentText,Ekologisk,Etiskt,Koscher,RavarorBeskrivning,URL,APK) VALUES (\""+
  articleObject.nr +"\",\""+
  articleObject.Artikelid +"\",\""+
  articleObject.Varnummer +"\",\""+
  articleObject.Namn +"\",\""+
  articleObject.Namn2 +"\",\""+
  articleObject.Prisinklmoms +"\",\""+
  articleObject.Pant +"\",\""+
  articleObject.Volymiml +"\",\""+
  articleObject.PrisPerLiter +"\",\""+
  articleObject.Saljstart +"\",\""+
  articleObject.Utgått +"\",\""+
  articleObject.Varugrupp +"\",\""+
  articleObject.Typ +"\",\""+
  articleObject.Stil +"\",\""+
  articleObject.Forpackning +"\",\""+
  articleObject.Forslutning +"\",\""+
  articleObject.Ursprung +"\",\""+
  articleObject.Ursprunglandnamn +"\",\""+
  articleObject.Producent +"\",\""+
  articleObject.Leverantor +"\",\""+
  articleObject.Argang +"\",\""+
  articleObject.Provadargang +"\",\""+
  articleObject.Alkoholhalt.replace("%","") +"\",\""+
  articleObject.Sortiment +"\",\""+
  articleObject.SortimentText +"\",\""+
  articleObject.Ekologisk +"\",\""+
  articleObject.Etiskt +"\",\""+
  articleObject.Koscher +"\",\""+
  articleObject.RavarorBeskrivning +"\",\""+
  articleObject.URL.replaceAll("\"","") +"\","+
  articleObject.APK +");"

  addArticleSQLQuery = addArticleSQLQuery.replaceAll("[object Object]","null");
  addArticleSQLQuery = addArticleSQLQuery.replaceAll("\"\"","\"");
  addArticleSQLQuery = addArticleSQLQuery.replaceAll(" \"", "");
  addArticleSQLQuery = addArticleSQLQuery.replaceAll("\" ", "");
  addArticleSQLQuery = addArticleSQLQuery.replaceAll("\"null\"", "null");
  addArticleSQLQuery = addArticleSQLQuery.replaceAll("\"undefined\"", "null");
  addArticleSQLQuery = addArticleSQLQuery.replaceAll("\", "," ");


  db.serialize(() => {
    db.all(addArticleSQLQuery, (err, rows) => {
      if (err) {
        console.log("Adding to DB Error:")
        console.error(err.message);
        console.log("Query: " + addArticleSQLQuery)
      }
      //console.log("Adding article: " + rows);
    });
  });

  /*
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Closing the database connection.');
  });
  */

}

function parseSB_API(){
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
        processArticleObjects(articleList)
        console.info('APK + URL processing time: %dms', new Date() - start)

        var start = new Date()
        articleList.sort(function(a, b) {
          return parseFloat(b.APK) - parseFloat(a.APK);
        });
        console.info('Sorting time: %dms', new Date() - start)

        console.info('Total time: %dms', new Date() - startDate)

        console.log("DONE\nAntal produkter: " + Object.keys(articleList).length + "\n")

      }else{
        console.log("ERROR: \n" + response.statusCode + "-" + error)
      }
  })
}

function main(){

  app.get('/dump', (req, res) => {
    res.set('Content-Type', 'text/html');
    var listHtml = "<!DOCTYPE html><html lang=\"en\"><head><title>APK DUMP</title><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><link rel=\"stylesheet\" href=\"https:\/\/maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css\"><script src=\"https:\//ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js\"></script><script src=\"https:\//maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js\"></script></head><body>";
    for(var i = 0; i<500; i++){
      var prod = articleList[i];
      listHtml = listHtml + "<li class=\"list-group-item\">"+ (i+1) +". "+ prod.Namn +" " + prod.Prisinklmoms + " Kr  <a href="+addURLtoArticlceObject(prod)+">"+addURLtoArticlceObject(prod)+"</a></li>"
    }
    res.send('<div class=\"container\"><h2>TOP 10 APK</h2><ul class=\"list-group\">' + listHtml + '</ul></div></body></html>');
  })

  app.get('/db/', (req, res) => {


    db.serialize(() => {
      db.all(`SELECT * FROM artikel ORDER BY APK DESC;`, (err, rows) => {
        if (err) {
          console.error(err.message);
        }
        console.log(rows);
        res.send(rows);
      });
    });

  })

  app.get('/', (req, res) => {
    if(articleList == undefined){
      res.sendStatus(204)
    }else{
      var start = new Date()
      res.json(articleList)
      console.info('Response time: %dms', new Date() - start)
    }
  })

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

  initializeDB();

  parseSB_API()

}

main();
