var request = require('request');
let xmlParser = require('xml2json');
var slugify = require('slugify')

var fs = require("fs");
var os = require("os");

var startDate = new Date()

const express = require('express')
const app = express()
const port = 3000

// Postgres
const { Client } = require('pg')

var client = new Client({
  host: 'localhost',
  port: 5433,
})

function runPostgresSQLquery(query){

    client.connect(err => {
      if (err) {
        console.error('connection error', err.stack)
      } else {
        console.log('connected')
        // callback


        client.query(query, (err, res) => {
          if (err) {
            console.log(err.stack)
          } else {
            console.log(res.rows)
            client.end();
            return res.rows
          }
        })



      }
    })


}




// SQLITE
const sqlite3 = require('sqlite3').verbose();
var db;
var memDB = new sqlite3.Database(':memory:');

var articleList = "";


// Removing quotation marks from numbers in JSON object + set alkoholhalt as number
// Maybe remove?
function removeQMFromNumbers(articleObject){
  articleObject.Pant = Number(articleObject.Pant)
  articleObject.nr = Number(articleObject.nr)
  articleObject.Artikelid = Number(articleObject.Artikelid)
  articleObject.Varnummer = Number(articleObject.Varnummer)
  articleObject.Prisinklmoms = Number(articleObject.Prisinklmoms)
  articleObject.Volymiml = Number(articleObject.Volymiml)
  articleObject.PrisPerLiter = Number(articleObject.PrisPerLiter)
  articleObject.Argang = Number(articleObject.Argang)
  articleObject.Etiskt = Number(articleObject.Etiskt)
  articleObject.Ekologisk = Number(articleObject.Ekologisk)
  articleObject.Alkoholhalt = parseFloat(String(articleObject.Alkoholhalt).replace("%",""));
}

// If field is undefined - Set to null. (To make same output as SQL - look similar)
// Maybe remove?
function setEmptyFieldsToNull(articleObject){
  if(JSON.stringify(articleObject.nr) == "null"){
    articleObject.nr  = "null";
  }
  if(JSON.stringify(articleObject.Artikelid) == "null"){
    articleObject.Artikelid  = "null";
  }
  if(JSON.stringify(articleObject.Varnummer) == "null"){
    articleObject.Varnummer  = "null";
  }
  if(JSON.stringify(articleObject.Namn) == "null"){
    articleObject.Namn  = "null";
  }
  if(JSON.stringify(articleObject.Namn2) == "null"){
    articleObject.Namn2  = "null";
  }
  if(JSON.stringify(articleObject.Prisinklmoms) == "null"){
    articleObject.Prisinklmoms  = "null";
  }
  if(JSON.stringify(articleObject.Pant) == "null"){
    articleObject.Pant  = "null";
  }
  if(JSON.stringify(articleObject.Volymiml) == "null"){
    articleObject.Volymiml  = "null";
  }
  if(JSON.stringify(articleObject.PrisPerLiter) == "null"){
    articleObject.PrisPerLiter  = "null";
  }
  if(JSON.stringify(articleObject.Saljstart) == "null"){
    articleObject.nSaljstartr  = "null";
  }
  if(JSON.stringify(articleObject.Utgått) == "null"){
    articleObject.Utgått  = "null";
  }
  if(JSON.stringify(articleObject.Varugrupp) == "null"){
    articleObject.Varugrupp  = "null";
  }
  if(JSON.stringify(articleObject.Typ) == "null"){
    articleObject.Typ  = "null";
  }
  if(JSON.stringify(articleObject.Stil) == "null"){
    articleObject.Stil  = "null";
  }
  if(JSON.stringify(articleObject.Forpackning) == "null"){
    articleObject.Forpackning  = "null";
  }
  if(JSON.stringify(articleObject.Forslutning) == "null"){
    articleObject.Forslutning  = "null";
  }
  if(JSON.stringify(articleObject.Ursprung) == "null"){
    articleObject.Ursprung  = "null";
  }
  if(JSON.stringify(articleObject.Ursprunglandnamn) == "null"){
    articleObject.Ursprunglandnamn  = "null";
  }
  if(JSON.stringify(articleObject.Producent) == "null"){
    articleObject.Producent  = "null";
  }
  if(JSON.stringify(articleObject.Leverantor) == "null"){
    articleObject.Leverantor  = "null";
  }
  if(JSON.stringify(articleObject.Argang) == "null"){
    articleObject.Argang  = "null";
  }
  if(JSON.stringify(articleObject.Provadargang) == "null"){
    articleObject.Provadargang  = "null";
  }
  if(JSON.stringify(articleObject.Alkoholhalt) == "null"){
    articleObject.Alkoholhalt  = "null";
  }
  if(JSON.stringify(articleObject.Sortiment) == "null"){
    articleObject.Sortiment  = "null";
  }
  if(JSON.stringify(articleObject.SortimentText) == "null"){
    articleObject.SortimentText  = "null";
  }
  if(JSON.stringify(articleObject.Ekologisk) == "null"){
    articleObject.Ekologisk  = "null";
  }
  if(JSON.stringify(articleObject.Etiskt) == "null"){
    articleObject.Etiskt  = "null";
  }
  if(JSON.stringify(articleObject.Koscher) == "null"){
    articleObject.Koscher  = "null";
  }
  if(JSON.stringify(articleObject.RavarorBeskrivning) == "null"){
    articleObject.RavarorBeskrivning  = "null";
  }
}

// Create and set .URL attribute in article JSON-objects
// URL leads to the articles www.systembolaget.se/... page
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
  nameURL = nameURL.replaceAll("-and-","-")

  var createdURL = baseURL+"/"+categoryURL+"/"+nameURL+"-"+numberURL;
  articleObject.URL = createdURL;
  return createdURL;
}

function initializeDBFile(){
  console.log("Initialize DB")

  console.log("Trying to create Sqlite3 .DB file")

  db = new sqlite3.Database("./APK.db",
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err) => {
        if(err){
          console.log("ERROR in creating sqlite3 DB - " + err)
        }else{
          console.log("Created sqlite3 DB")

          createDBFile()
          createDB(db)
        }
          // do your thing
      });

      console.log("Initialize DB - DONE")
}

function createDBFile(){

  db = new sqlite3.Database('./APK.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error("error: " + err.message);
    }
    console.log('Connected to the APK database.');
  });

}

// Create Artikel-table in Sqlite3 DB-file
function createDB(dbObj){
  // open the database
  console.log("Trying to connect to sqlite3 DB")

  console.log("Creating artikel table")
  dbObj.serialize(() => {
    dbObj.all(`CREATE TABLE artikel (nr integer primary key, artikelid integer,varnummer integer,namn text,namn2 text,prisinklmoms real,pant real,volymiml real,prisperliter real,saljstart text,utgatt text,varugrupp text,typ text,stil text,forpackning text,forslutning text,ursprung text,ursprunglandnamn text,producent text,leverantor text,argang integer,provadargang text,alkoholhalt real,sortiment text,sortimentText text,ekologisk real,etiskt real,koscher text,ravarorbeskrivning text,url text,apkmedpant real, apk real);`, (err, rows) => {
      if (err) {console.error(err.message)}
    });
  });
}

function createPostgresDB(){
  // open the database
  console.log("Trying to connect to postgres DB")




  console.log("Creating artikel table - postgres")


  runPostgresSQLquery(`CREATE TABLE artikel (nr text, artikelid text,varnummer text,namn text,namn2 text,prisinklmoms real,pant real,volymiml real,prisperliter real,saljstart text,utgatt text,varugrupp text,typ text,stil text,forpackning text,forslutning text,ursprung text,ursprunglandnamn text,producent text,leverantor text,argang text,provadargang text,alkoholhalt real,sortiment text,sortimentText text,ekologisk real,etiskt real,koscher text,ravarorbeskrivning text,url text,apkmedpant real, apk real);`);

}

// Add APK + URL to list of article objects
function processArticleObjects(articleList){
  console.log("processArticleObjects()")
  var count = 0;

  db = new sqlite3.Database('./APK.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error("error: " + err.message);
    }
  });

  // Find max APK to calculate APKScore
  var maxAPKFound = 0;

  for (var i = 0; i < articleList.length; i++) {
    addURLtoArticlceObject(articleList[i])
    addAPKtoArticleObject(articleList[i])
    removeQMFromNumbers(articleList[i])
    setEmptyFieldsToNull(articleList[i])

    // Max APK to calculate APKScore
    if(articleList[i].APK > maxAPKFound){
      maxAPKFound = articleList[i].APK
    }
    console.log("processing.")
  }

  // Setting APKScore
  for (var i = 0; i < articleList.length; i++) {
    console.log("adding apk-score.")
    articleList[i].APKScore = Math.ceil((articleList[i].APK/maxAPKFound)*100)
  }

  console.log("adding to sqlite-mem")
  addArticlesToDB(memDB,articleList);
  console.log("adding to sqlite-disk")
  addArticlesToDB(db,articleList);
  console.log("adding to sqlite-postgres")
  addArticlesToPostgresDB(articleList);
}

function addAPKtoArticleObject(articleObject) {

  var price = parseFloat(articleObject.Prisinklmoms);
  var volume = parseFloat(articleObject.Volymiml);
  var alcohol = parseFloat(String(articleObject.Alkoholhalt).replace("%",""));
  var pant = articleObject.Pant;

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

  if(pant == undefined){
    articleObject.APKMedPant = articleObject.APK
  }else{
    articleObject.APKMedPant = ((alcohol/100)*volume)/(price + parseFloat(pant));
  }
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

// Add JSON-list of articles to Sqlite3 DB-file.
// Require connection to DB (db-variable has to be assigned and connected)
function addArticlesToDB(dbObj, articleList){

  addAllArticlesSQLQuery = "INSERT INTO artikel (nr,Artikelid,Varnummer,Namn,Namn2,Prisinklmoms,Pant,Volymiml,PrisPerLiter,Saljstart,Utgatt,Varugrupp,Typ,Stil,Forpackning,Forslutning,Ursprung,Ursprunglandnamn,Producent,Leverantor,Argang,Provadargang,Alkoholhalt,Sortiment,SortimentText,Ekologisk,Etiskt,Koscher,RavarorBeskrivning,URL,APKMedPant,APK) VALUES";

  for(var index = 0; index < articleList.length; index++){
    var addArticleSQLQuery =  "("+
    articleList[index].nr +",\""+
    articleList[index].Artikelid +"\",\""+
    articleList[index].Varnummer +"\",\""+
    articleList[index].Namn +"\",\""+
    articleList[index].Namn2 +"\",\""+
    articleList[index].Prisinklmoms +"\",\""+
    articleList[index].Pant +"\",\""+
    articleList[index].Volymiml +"\",\""+
    articleList[index].PrisPerLiter +"\",\""+
    articleList[index].Saljstart +"\",\""+
    articleList[index].Utgått +"\",\""+
    articleList[index].Varugrupp +"\",\""+
    articleList[index].Typ +"\",\""+
    articleList[index].Stil +"\",\""+
    articleList[index].Forpackning +"\",\""+
    articleList[index].Forslutning +"\",\""+
    articleList[index].Ursprung +"\",\""+
    articleList[index].Ursprunglandnamn +"\",\""+
    articleList[index].Producent +"\",\""+
    articleList[index].Leverantor +"\",\""+
    articleList[index].Argang +"\",\""+
    articleList[index].Provadargang +"\","+
    articleList[index].Alkoholhalt +",\""+
    articleList[index].Sortiment +"\",\""+
    articleList[index].SortimentText +"\",\""+
    articleList[index].Ekologisk +"\",\""+
    articleList[index].Etiskt +"\",\""+
    articleList[index].Koscher +"\",\""+
    articleList[index].RavarorBeskrivning +"\",\""+
    articleList[index].URL.replaceAll("\"","") +"\","+
    articleList[index].APKMedPant +","+
    articleList[index].APK +")"

    addArticleSQLQuery = addArticleSQLQuery.replaceAll("[object Object]","null");
    addArticleSQLQuery = addArticleSQLQuery.replaceAll("\"\"","\"");
    addArticleSQLQuery = addArticleSQLQuery.replaceAll(" \"", "");
    addArticleSQLQuery = addArticleSQLQuery.replaceAll("\" ", "");
    addArticleSQLQuery = addArticleSQLQuery.replaceAll("\"null\"", "null");
    addArticleSQLQuery = addArticleSQLQuery.replaceAll("\"undefined\"", "null");
    addArticleSQLQuery = addArticleSQLQuery.replaceAll("\", "," ");

    if(index != (articleList.length-1)){
      addArticleSQLQuery = addArticleSQLQuery + ",";
    }
    addAllArticlesSQLQuery = addAllArticlesSQLQuery + addArticleSQLQuery;
  }

  addAllArticlesSQLQuery = addAllArticlesSQLQuery + ";"

  dbObj.serialize(() => {
    dbObj.all(addAllArticlesSQLQuery, (err, rows) => {
      if (err) {
        console.log("Adding to DB Error:")
        console.error(err.message);
      }

      console.log("Articles added to DB");
      console.log("Parse + DB time: %dms", new Date() - startDate)
    });
  });
}

function addArticlesToPostgresDB(articleList){

  addAllArticlesSQLQuery = "INSERT INTO artikel (nr,artikelid,varnummer,namn,namn2,prisinklmoms,pant,volymiml,prisperliter,saljstart,utgatt,varugrupp,typ,stil,forpackning,forslutning,ursprung,ursprunglandnamn,producent,leverantor,argang,provadargang,alkoholhalt,sortiment,sortimenttext,ekologisk,etiskt,koscher,ravarorbeskrivning,url,apkmedpant,apk) VALUES";

  for(var index = 0; index < articleList.length; index++){
    var addArticleSQLQuery =  "('"+
    articleList[index].nr +"','"+
    articleList[index].Artikelid +"','"+
    articleList[index].Varnummer +"','"+
    String(articleList[index].Namn).replaceAll("\'","") +"','"+
    String(articleList[index].Namn2).replaceAll("\'","") +"','"+
    articleList[index].Prisinklmoms +"','"+
    articleList[index].Pant +"','"+
    articleList[index].Volymiml +"','"+
    articleList[index].PrisPerLiter +"','"+
    articleList[index].Saljstart +"','"+
    articleList[index].Utgått +"','"+
    articleList[index].Varugrupp +"','"+
    articleList[index].Typ +"','"+
    articleList[index].Stil +"','"+
    articleList[index].Forpackning +"','"+
    articleList[index].Forslutning +"','"+
    String(articleList[index].Ursprung).replaceAll("\'","") +"','"+
    String(articleList[index].Ursprunglandnamn).replaceAll("\'","") +"','"+
    String(articleList[index].Producent).replaceAll("\'","") +"','"+
    String(articleList[index].Leverantor).replaceAll("\'","") +"','"+
    articleList[index].Argang +"','"+
    articleList[index].Provadargang +"',"+
    articleList[index].Alkoholhalt +",'"+
    articleList[index].Sortiment +"','"+
    articleList[index].SortimentText +"','"+
    articleList[index].Ekologisk +"','"+
    articleList[index].Etiskt +"','"+
    articleList[index].Koscher +"','"+
    String(articleList[index].RavarorBeskrivning).replaceAll("\'","") +"','"+
    articleList[index].URL.replaceAll("'","") +"',"+
    articleList[index].APKMedPant +","+
    articleList[index].APK +")"

    addArticleSQLQuery = addArticleSQLQuery.replaceAll("[object Object]","null");
    addArticleSQLQuery = addArticleSQLQuery.replaceAll("''","'");
    addArticleSQLQuery = addArticleSQLQuery.replaceAll(" '", "");
    addArticleSQLQuery = addArticleSQLQuery.replaceAll("' ", "");
    addArticleSQLQuery = addArticleSQLQuery.replaceAll("'null'", "null");
    addArticleSQLQuery = addArticleSQLQuery.replaceAll("'undefined'", "null");
    addArticleSQLQuery = addArticleSQLQuery.replaceAll("', "," ");

    if(index != (articleList.length-1)){
      addArticleSQLQuery = addArticleSQLQuery + ",";
    }
    addAllArticlesSQLQuery = addAllArticlesSQLQuery + addArticleSQLQuery;
  }

  addAllArticlesSQLQuery = addAllArticlesSQLQuery + ";"

  console.log("Trying to send query: " + addAllArticlesSQLQuery)


      client.connect(err => {
        console.log("in client.connect(err =>");
        if (err) {
          console.error('connection error', err.stack)
        } else {
          console.log('Connected to postgres: Trying to run addAllArticlesSQLQuery')
          // callback


          client.query(addAllArticlesSQLQuery, (err, res) => {
            if (err) {
              console.log("error from sending postgres-query: " + err.stack)
            } else {
              console.log("succesfully ran postgres-query!")
              console.log(res.rows)

              client.end()
              console.log("Articles added to postgres-DB");
              console.log("Parse + DB time: %dms", new Date() - startDate)
            }
          })

        }
      })

  /*
  dbObj.serialize(() => {
    dbObj.all(addAllArticlesSQLQuery, (err, rows) => {
      if (err) {
        console.log("Adding to DB Error:")
        console.error(err.message);
      }

      console.log("Articles added to DB");
      console.log("Parse + DB time: %dms", new Date() - startDate)
    });
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

        // Remove ":s from number attributes

        var start = new Date()
        processArticleObjects(articleList)

        var start = new Date()
        articleList.sort(function(a, b) {
          return parseFloat(b.APK) - parseFloat(a.APK);
        });

        console.info('Sorting time: %dms', new Date() - start)
        console.info('APK + URL processing time: %dms', new Date() - start)
        console.info('Total parse time: %dms', new Date() - startDate)
        console.log("DONE\nAntal produkter: " + Object.keys(articleList).length + "\n")

      }else{
        console.log("ERROR: \n" + response.statusCode + "-" + error)
      }
  })
}

function openEndPoints(){

  // HTML endpoint with top 500 from ARRAY
  app.get('/dump', (req, res) => {
    res.set('Content-Type', 'text/html');
    var listHtml = "<!DOCTYPE html><html lang='en'><head><title>APK DUMP</title><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><link rel='stylesheet' href='https:\/\/maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css'><script src='https:\//ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js'></script><script src='https:\//maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js'></script></head><body>";
    for(var i = 0; i<18000; i++){
      var prod = articleList[i];
      listHtml = listHtml + "<li class='list-group-item'>"+ (i+1) +". "+ prod.Namn +" " + prod.APKScore + " APK-Score (1-100)  <a href="+addURLtoArticlceObject(prod)+">"+addURLtoArticlceObject(prod)+"</a></li>"
    }
    res.send("<div class='container'><h2>TOP APK</h2><ul class='list-group'>' + listHtml + '</ul></div></body></html>");
  })

  // Return top :numberOfArticles from SQLITE3 in-memory
  app.get('/sqlite-mem/:numberOfArticles', (req, res) => {
    var start = new Date()

    var starthr = process.hrtime()
    memDB.serialize(() => {
          memDB.all(`SELECT * FROM artikel ORDER BY APK DESC LIMIT `+ req.params.numberOfArticles +`;`, (err, rows) => {
            if (err) {
              console.error(err.message);
            }
            res.send(rows);

            var endhr = process.hrtime();

            var starthrMS = starthr[0] * 1000000 + starthr[1] / 1000
            var endhrMS = endhr[0] * 1000000 + endhr[1] / 1000
            var elapsedMs = endhrMS - starthrMS;

            var fileName = "results/m2_"+req.params.numberOfArticles+".txt";
            fs.appendFileSync(fileName, (elapsedMs)+"\n");

            console.info('Sqlite3 (in-memory) | #articles: '+ req.params.numberOfArticles +' | Response time: ' + elapsedMs)

          });
        });
  })

  // Return top :numberOfArticles from SQLITE3 DB-file.
  app.get('/sqlite-disk/:numberOfArticles', (req, res) => {
    var start = new Date()

    var starthr = process.hrtime()

    db = new sqlite3.Database('./APK.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          console.error("error: " + err.message);
        }
        db.serialize(() => {
          db.all(`SELECT * FROM artikel ORDER BY APK DESC LIMIT `+ req.params.numberOfArticles +`;`, (err, rows) => {
            if (err) {
              console.error(err.message);
            }
            res.send(rows);

            var endhr = process.hrtime();

            var starthrMS = starthr[0] * 1000000 + starthr[1] / 1000
            var endhrMS = endhr[0] * 1000000 + endhr[1] / 1000
            var elapsedMs = endhrMS - starthrMS;

            var fileName = "results/m3_"+req.params.numberOfArticles+".txt";
            fs.appendFileSync(fileName, (elapsedMs)+"\n");

            console.info('Sqlite3 (from disk) | #articles: '+ req.params.numberOfArticles +' | Response time: ' + elapsedMs)

            db.close((err) => {
              if (err) {
                return console.error(err.message);
              }
            });
          });
        });
      });
  })


    // Return top :numberOfArticles from POSTGRES
    app.get('/postgres/:numberOfArticles', (req, res) => {

      // ---
      var starthr = process.hrtime()

      var start = new Date()

      client = new Client({
        host: 'localhost',
        port: 5433,
      })

      client.connect(err => {
        if (err) {
          console.error('connection error', err.stack)
        } else {

          var query = `SELECT * FROM artikel ORDER BY APK DESC LIMIT `+ req.params.numberOfArticles +`;`

          client.query(query, (err, result) => {
            if (err) {
              console.log(err.stack)
            } else {
              res.send(result.rows);
              var endhr = process.hrtime();

              var starthrMS = starthr[0] * 1000000 + starthr[1] / 1000
              var endhrMS = endhr[0] * 1000000 + endhr[1] / 1000
              var elapsedMs = endhrMS - starthrMS;

              var fileName = "results/m4_"+req.params.numberOfArticles+".txt";
              fs.appendFileSync(fileName, (elapsedMs)+"\n");

              console.info('Postgres | #articles: '+ req.params.numberOfArticles +' | Response time: ' + elapsedMs)

              client.end();

            }
          })

        }
      })
    })

  app.get('/', (req, res) => {
    res.send("/array/# \n\n /sqlite-mem/# \n\n /sqlite-disk/#")
  })

  // Return all articles from ARRAY (memory)
  app.get('/array', (req, res) => {
    if(articleList == undefined){
      res.sendStatus(204)
    }else{
      var start = new Date()
      res.json(articleList)
      console.info('Array | Response time: %dms', new Date() - start)
    }
  })

  // Return top :numberOfArticles from ARRAY (memory)
  app.get('/array/:numberOfArticles', (req, res) => {
    if(articleList == undefined){
      res.sendStatus(204)
    }else{
      var start = new Date()
      var starthr = process.hrtime()
      res.json(articleList.slice(0, req.params.numberOfArticles))
      var endhr = process.hrtime();

      var starthrMS = starthr[0] * 1000000 + starthr[1] / 1000
      var endhrMS = endhr[0] * 1000000 + endhr[1] / 1000
      var elapsedMs = endhrMS - starthrMS;

      console.info('Array | #articles: '+ req.params.numberOfArticles +' | Response time: ' + elapsedMs)

      var fileName = "results/m1_"+req.params.numberOfArticles+".txt";
      fs.appendFileSync(fileName, (elapsedMs)+"\n");
    }

  })
  app.listen(port, () => console.log(`Listening on port ${port}!`))
}

function main(){
  console.log("Main()")

  openEndPoints()

  if(process.argv[2] == "parse"){

    console.log("Performing reparse!")
    //createPostgresDB();
    createDB(memDB);

    initializeDBFile();
    parseSB_API()

  }

  console.log("Main() - DONE")
}

main();
