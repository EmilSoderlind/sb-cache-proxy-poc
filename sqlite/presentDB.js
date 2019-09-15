var request = require('request');
let xmlParser = require('xml2json');
var slugify = require('slugify')

var startDate = new Date()

const express = require('express')
const app = express()
const port = 3000

const sqlite3 = require('sqlite3').verbose();
var db;

      // open the database
      console.log("Trying to connect to sqlite3 DB")
      db = new sqlite3.Database('./APK.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          console.error("error: " + err.message);
        }
        console.log('Connected to the APK database.');
      });

      db.serialize(() => {
        db.all(`SELECT count(*) FROM artikel;`, (err, rows) => {
          if (err) {
            console.error(err.message);
          }
          console.log(rows);
        });
      });

      db.serialize(() => {
        db.all(`SELECT * FROM artikel ORDER BY APK DESC;`, (err, rows) => {
          if (err) {
            console.error(err.message);
          }
          console.log(rows);
        });
      });
