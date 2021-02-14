
const fs = require('fs');
const split = require('split');
const through = require('through');

const async = require('async');
const _ = require('lodash')

const cities1000 = require('cities1000');

const acbElasticSearch = require('@mmpro/ac-bootstrap-elasticsearch')
const aclog = require('ac-logger')

// create this file with content - config.aws.accessKeys array - will be merged
const config = require('./config')

const app = {
  config: {
    elasticSearch: {
      servers: [
        { server: 'mcCluster', host: 'localhost', port: 9243, awsCluster: true, apiVersion: '7.7', protocol: 'https' }
      ],
      indices: [
        { model: 'geodata', type: 'cities', server: 'mcCluster', instance: 'geodata', global: true },
      ]
    }
  }
}
_.merge(app.config, config)
const index = 'geodata'




console.error('Generating the index. This could take a minute or two.');
console.error('Please wait...');


app.aclog = aclog()
app.log = app.aclog.acLogger

const cities =  []
let start = 0

async.series({
  prepES: (done) => {
    acbElasticSearch(app, {}, done)
  },
  readFromFile: (done) => {

    var dataStream = fs.createReadStream(cities1000.file);
    dataStream
      .pipe(split())
      .pipe(through((line) => {
        var row = line.split('\t').reduce((acc, x, ix) => {
          var key = cities1000.fields[ix];
          if(key === 'alternativeNames') x = x.split(',');
          if(key === 'lat' || key === 'lon') x = parseFloat(x);
          if(key === 'elevation') x = x
            ? parseInt(x, 10)
            : undefined;
          if(key === 'population') x = x
            ? parseInt(x, 10)
            : undefined;

          acc[key] = x;
          return acc;
        }, {});
        if(!row.id) return;

        cities.push(row);
      }));

    dataStream.on('end', () => {
      console.log("Number of ingested cities", cities.length)
      return done();
    });

  },
  createMapping: (done) => {
    app.elasticSearch.geodata.indices.exists({
      index
    }, (err, result) => {
      if (err) return done(err);
      if (result) {
        console.log("INDEX ", index, "exists");
        return done();
      }

      var settings = {
        mappings: {}
      }

      settings.mappings = {
        properties: {
          name:             { type: "keyword" },
          country:          { type: "keyword" },
          altCountry:       { type: "keyword" },
          muni:             { type: "keyword" },
          muniSub:          { type: "keyword" },
          featureClass:     { type: "keyword" },
          featureCode:      { type: "keyword" },
          adminCode:        { type: "keyword" },
          population:       { type: "integer" },
          alternativeNames: { type: "keyword" },
          location:         { type: "geo_point" }
        }
      };

      console.log(JSON.stringify(settings, null, '\t'))


      app.elasticSearch.geodata.indices.create({
        index,
        body: settings
      }, done);

    });
  },
  sendToElasticSearch: function(done) {
    var counter = start;
    var citiesLength = cities.length;
    if (start > 0) {
      cities.splice(0,start);
    }

    async.eachLimit(cities, 50, (row, itDone) => {
      counter++;

      var esDoc =  {
        name: row.name,
        country: row.country,
        altCountry: row.altCountry,
        muni: row.municipality,
        muniSub: row.municipalitySubdivision,
        featureClass: row.featureClass,
        featureCode: row.featureCode,
        adminCode: row.adminCode,
        population: row.population,
        alternativeNames: row.alternativeNames,
        location: {
          lat: parseFloat(row.lat),
          lon: parseFloat(row.lon)
        }
      }

      console.log("#### Sending to ES %s of %s", counter, citiesLength);
      console.log(esDoc);

      app.elasticSearch.geodata.update({
        index,
        id: row.id,
        body:  {
          doc: esDoc,
          doc_as_upsert: true
        }
      }, itDone);
    }, done);
  }
}, (err) => {
  if (err) console.error(err);
  else console.log('ALL CITIES INGESTED');
});