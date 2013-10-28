var FRISBEE = FRISBEE || {};

// JavaScript Document
function reset10games(e) {
	e.preventDefault();
	
	// get gamelist
	var url = FRISBEE.settings.lvGetListOfGames;
	FRISBEE.myAjax.get(url,function(games){
		// get scores of games
		for (i=0; i<games.objects.length; i++){
			console.log("scores van game "+games.objects[i].id+" worden opgehaald.");
			var url = FRISBEE.settings.lvGetListOfGameScores.replace("XXXXX", games.objects[i].id);
			FRISBEE.myAjax.get(url,function(scores){
				for (i=0; i<scores.objects.length; i++){
					console.log("score "+scores.objects[i].id+" wordt verwijderd.");
					var url = FRISBEE.settings.lvDeleteScore.replace("XXXXX", scores.objects[i].id);
					// delete first game score
					FRISBEE.myAjax.del(url,function(response){
						console.log(response);
					});
				}
			});
		}
	});
	
}

// DOM ready
$(function() {
	// Set script to ECMA 5 (including native JSON support)
	"use strict";
	
	
	// Settings
	FRISBEE.settings = {
		lvToken: 'bearer 82996312dc',
		
		lvGetListOfGames:'https://api.leaguevine.com/v1/games/?tournament_id=19389&order_by=%5Bstart_time%5D&fields=%5Bid%2Cteam_1_score%2Cteam_2_score%2Cteam_1%2Cteam_2%2Cstart_time%2Cpool%2Cwinner_id%5D&limit=200',
		
		lvGetListOfGameScores:
		'https://api.leaguevine.com/v1/game_scores/?game_id=XXXXX%20&limit=200',
		
		lvDeleteScore:"https://api.leaguevine.com/v1/game_scores/XXXXX/"
	};
	
	// Kickstart application
	$("body > a").on("click", function(e){
		reset10games(e);
	});
});