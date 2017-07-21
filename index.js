#!/usr/bin/env node

var clear       = require('clear');
var CLI         = require('clui');
var figlet      = require('figlet');
var inquirer    = require('inquirer');
var Spinner     = CLI.Spinner;
var tvmaze = require('tv-maze');
var client = tvmaze.createClient();
var chalk = require('chalk');
var options = [];
var inputs = [];

function getSeriesData(arg){
  clear();
  var status = new Spinner('Please Wait...');
  status.start();
  client.search(arg,(err,shows) => {
    status.stop();
    if(shows.length > 0) {
      var show = shows[0].show;
      console.log('\n');
      console.log(chalk.yellow.bold(
        figlet.textSync(show.name)
      ));
      if(show.rating.average) {
        console.log(` Average Rating : ${show.rating.average}`);
      }
      if(show.genres.length > 0) {
        console.log(` Genre : ${show.genres.toString()}`);
        console.log('\n');
      }
      if(show.summary) {
        var regEx = /<\/*.[a-z]*>/;
        show.summary = show.summary.split(regEx).join('').trim();
        console.log(show.summary);
        console.log('\n');
      }

      if(show.status == 'Running') {
        status.start();
        if(show._links.previousepisode) {
          var n = show._links.previousepisode.href.split('/');
          var lastEpisodeCode = n[n.length-1];
          client._request('/episodes/'+lastEpisodeCode,'GET',null,(err,lastEpisode) => {
            status.stop();
            if(lastEpisode.name && lastEpisode.season && lastEpisode.number) {
              console.log(` Last Episode: ${lastEpisode.name} (Season ${lastEpisode.season}, Episode ${lastEpisode.number})`);
              console.log('\n');
            }
            if(show._links.nextEpisode) {
              n = show._links.nextepisode.href.split('/');
              var nextEpisodeCode = n[n.length-1];
              status.start();
              client._request('/episodes/'+nextEpisodeCode,'GET',null,(err,nextEpisode) => {
                status.stop();
                //Next Episode Details
                if(nextEpisode.name && nextEpisode.season && nextEpisode.number) {
                  console.log(` Next Episode: ${nextEpisode.name} (Season ${nextEpisode.season}, Episode ${nextEpisode.number})`);
                }
                if(nextEpisode.summary) {
                  console.log(`${nextEpisode.summary.split(regEx).join('').trim()}`);
                  console.log('\n');
                }
                if(nextEpisode.airstamp) {
                  console.log(` Airing on ${new Date(nextEpisode.airstamp)}`);
                  console.log("\n");
                }
              });
            }
          });
        }
      } else {
        var n = show._links.previousepisode.href.split('/');
        var lastEpisodeCode = n[n.length-1];
        status.start();
        client._request('/episodes/'+lastEpisodeCode,'GET',null,(err,episode) => {
          status.stop();
          console.log(` Show Ended on ${episode.airdate}`);
          console.log(` Last Episode: ${episode.name} (Season ${episode.season}, Episode ${episode.number})`);
          console.log("\n");
        });
      }
    } else {
      console.log(` No Show found!`);
      console.log("\n");
    }
  })
};


for(var i = 2; i < process.argv.length;i++) {
  var arg = process.argv[i];
  if(arg[0] == '-'){
    options.push(arg);
  }else{
    inputs.push(arg);
  }
}
inputs.forEach((input) => {
  getSeriesData(input);
});
