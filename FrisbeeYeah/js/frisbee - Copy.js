//namespace
var FRISBEE = FRISBEE || {};

// self-invoking function om local scope te creeren
(function () {
	// Set script to ECMA 5 (including native JSON support)
	"use strict";
	
	// Controller Init
	FRISBEE.controller = {
		init: function () {
			// Initialize router
			FRISBEE.router.init();
		}
	};
	
	// Router
	FRISBEE.router = {
		init: function () {
			routie('/:pageID', function(pageID) {
				FRISBEE.page.render(pageID);
			});
			// redirect naar schedule indien geen route aanwezig.
			var route = window.location.hash.slice(2);
			if (route == "") {
				window.location.href = "#/schedule";
			}
		}
	};
	
	// Page
	FRISBEE.page = {
		init: function(){
			FRISBEE.spinner.init();
		},
		// bepalen welke pagina om aandacht roept
		render: function (route) {	
			// data voor de speelschema ophalen en invoegen
			if (route == "schedule") {
				FRISBEE.schedule.render();
			}
			// data voor de stand ophalen en invoegen
			else if (route == "ranking") {
				FRISBEE.ranking.render();
			}
		},
		
		// zichtbaarheid van de secties updaten
		change: function () {
			var route = window.location.hash.slice(2);
			var sections = qwery('section[data-route]');
			var menuItems = qwery('nav a');
			
			// hide sections
			for (var i=0; i < sections.length; i++){
				sections[i].classList.remove('active');
			}
			// show section
			var section = qwery('#'+route)[0];
			section.classList.add('active');
			
			// normalize menu items
			for (var i=0; i < menuItems.length; i++){
				menuItems[i].classList.remove('active');
			}
			// emphasize menu item
			if (route=="schedule") {
				menuItems[0].classList.add('active');
			} else if (route=="ranking") {
				menuItems[1].classList.add('active');
			}
		},
		
		startLongProcess: function(){
			FRISBEE.spinner.startSpin();
		},
		
		endLongProcess: function(){
			FRISBEE.spinner.stopSpin();
		}
	}
	
	
	// Schedule
	FRISBEE.schedule = {
		render: function(){
			var self = this;
			var url = 'https://api.leaguevine.com/v1/games/?tournament_id=19389&order_by=%5Bstart_time%5D&fields=%5Bid%2Cteam_1_score%2Cteam_2_score%2Cteam_1%2Cteam_2%2Cstart_time%2Cpool%5D'
			// Get schedule data from LaegueVine
			FRISBEE.myAjax.get(url,displayResults);
			
			// Display schedule data om screen
			function displayResults(games){
				// ask tranparency to combine data and template
				Transparency.render(qwery('[data-route=schedule]')[0], games, self.scheduleDirectives());
				// bind a click event to each game
				var gameList = qwery('#gameList .game');
				for (var i=0; i < gameList.length; i++){
					vine.bind(gameList[i].id, "click", function(e){
						FRISBEE.game.startScoring(e.currentTarget.id);
					});
				}
				FRISBEE.page.change();
			}
		},
		
		// rules voor schedule pagina
		scheduleDirectives: function() {
			var JSONrules = {		
				// voor elke game
				objects: {
					// id van de game
					gameId: {
						id: function(){
							return(this.id);
						}
					},
					// formatted startdatum en -tijd
					startDate: {
						text: function(){
							var startDate = new Date(this.start_time);
							return(startDate.toFormat('DDD D MMM'));
						}
					},
					startTime: {
						text: function(){
							var startTime = new Date(this.start_time);
							return(startTime.toFormat('HH:MI'));
						}
					},
					// pool
					pool: {
						text: function(){
							return("Pool "+ this.pool.name);
						}
					},
					// de einduitslag
					score: {
						html: function() {
							return ('<span class="team1Score">'+this.team_1_score+'</span>-<span class="team2Score">'+this.team_2_score+'</span>');
						}
					},
					// teamnaam1 inclusief winner class or not
					team1Complete: {
						text: function() {
							return (this.team_1.name);
						},
						id: function() {
							return (this.team_1_id);
						},
						class: function() {
							if (parseInt(this.team_1_score) > parseInt(this.team_2_score)) {
								return ( "team1Name winner" );
							}
						}
					},
					// teamnaam2 inclusief winner class or not
					team2Complete: {
						text: function() {
							return (this.team_2.name);
						},
						id: function() {
							return (this.team_2_id);
						},
						class: function() {
							if (parseInt(this.team_1_score) < parseInt(this.team_2_score)) {
								return ( "team2Name winner" );
							}
						}
					}
				}
			};
			return JSONrules;
		}
	};
	
	
	// Game
	FRISBEE.game = {
		// winning score
		WINNINGSCORE: 15,
		
		// informatie over de game ophalen en op het scherm tonen	
		render: function (gameID) {
			var gameEl = qwery('#'+gameID+" .theGame table tbody")[0];
			
			var buttons = '<tr class="theControls"><td><input name="team1plus1" type="button" value="Puntje erbij!" onclick="FRISBEE.game.postScore('+gameID+', 1)"></td>';
			var buttons = buttons + '<td><input name="stopScoring" id="stopScoring" type="button" value="X" onclick="FRISBEE.game.stopScoring('+gameID+')"></td>';
			var buttons = buttons + '<td><input name="team2plus1" type="button" value="Puntje erbij!" onclick="FRISBEE.game.postScore('+gameID+', 2)"></td></tr>';
			
			gameEl.innerHTML = gameEl.innerHTML + buttons;
		},
		
		// een score voor een game doorgeven aan LeagueVine
		postScore: function(gameID, teamNumber){
			var self = this;
			// huidige score
			var team1Score = parseInt(qwery('#'+gameID+' .team1Score')[0].innerHTML);
			var team2Score = parseInt(qwery('#'+gameID+' .team2Score')[0].innerHTML);
			// score updaten
			if (teamNumber == 1) {
				team1Score = team1Score + 1;
			} else {
				team2Score = team2Score + 1;
			};
			
			// ajaxData samenstellen
			var url = 'https://api.leaguevine.com/v1/game_scores/';
			var gameScore = {
					game_id: gameID,
					team_1_score: team1Score,
					team_2_score: team2Score,
					is_final: 'False'
					};
			// data naar LaegueVine sturen
			FRISBEE.myAjax.post(url,gameScore,displayResults);
			
			// de score op het scherm updaten na het posten van een score
			function displayResults(gameScore){
				var theGame = qwery('#'+gameID+' .theGame')[0];
				Transparency.render(qwery('#'+gameID+' .theGame')[0], gameScore, self.gameDirectives());
			};
		},
		
		startScoring: function(gameID){
			// check if already in edit mode
			if ( !qwery('#'+gameID)[0].classList.contains('editMode') ){
				// add buttons
				this.render(gameID);
				// activate edit mode
				qwery('#'+gameID)[0].classList.add('editMode');
			}
		},
		
		stopScoring: function(gameID){
			// remove buttons
			var theScore = qwery('#'+gameID+' .theScore')[0].innerHTML;
			qwery('#'+gameID+' table tbody')[0].innerHTML = '<tr class="theScore" >'+theScore+'</tr>';
			// remove edit class
			qwery('#'+gameID)[0].classList.remove('editMode');
		},
		
		// rules voor ranking pagina
		gameDirectives: function() {
			var JSONrules = {
				// de einduitslag
				team1Score: {
					text: function() {
						return (this.team_1_score);
					}
				},
				team2Score: {
					text: function() {
						return (this.team_2_score);
					}
				},
				// teamnaam1 inclusief winner class or not
				team1Complete: {
					text: function() {
						return (this.team_1.name);
					},
					id: function() {
						return (this.team_1_id);
					},
					class: function() {
						if (parseInt(this.team_1_score) > parseInt(this.team_2_score)) {
							return ( "team1Name winner" );
						} else {
							return ( "team1Name" );
						}
					}
				},
				// teamnaam2 inclusief winner class or not
				team2Complete: {
					text: function() {
						return (this.team_2.name);
					},
					id: function() {
						return (this.team_2_id);
					},
					class: function() {
						if (parseInt(this.team_1_score) < parseInt(this.team_2_score)) {
							return ( "team2Name winner" );
						} else {
							return ( "team2Name" );
						}
					}
				}
			};
			return JSONrules;
		},
	};
	
	
	// Ranking
	FRISBEE.ranking = {
		render: function(){
			// data object ophalen
			var data = this.rankingData;
			// aanvullende bewerkingen op data ophalen die - om meer en rijkere data te kunnen mergen met de template
			var directives = this.rankingDirectives();
			// template, data + rules merg
			Transparency.render(qwery('[data-route=ranking]')[0], data, directives);
			
			// sort teams by netto points
			var options = { valueNames: ['points'] };
			var teamList = new List('ranking', options);
			teamList.sort('points', { asc: false });
			
			FRISBEE.page.change();
		},
		
		// rules voor ranking pagina
		rankingDirectives: function() {
			var JSONrules = {
				//voor de titel
				rankingTitle: {
					text: function(params) {
						return ("Pool "+this.pool+" - "+params.value);
					}
				},
				//voor elk team
				teams: {
					points: {
						text: function() {
							return (parseInt(this.Pw) - parseInt(this.Pl));
						}
					}
				}
			};
			return JSONrules;
		},
		
		rankingData: {
			pool:'A',
			teams: [
				{ team: "Chasing", Win: "2", Lost: "2", Sw: "7", Sl: "9", Pw: "35", Pl: "39"},
				{ team: "Boomsquad", Win: "2", Lost: "2", Sw: "9", Sl: "8", Pw: "36", Pl: "34"},
				{ team: "Burning Snow", Win: "3", Lost: "1", Sw: "11", Sl: "4", Pw: "36", Pl: "23"},
				{ team: "Beast Amsterdam", Win: "2", Lost: "2", Sw: "6", Sl: "8", Pw: "30", Pl: "34"},
				{ team: "Amsterdam Money Gang", Win: "1", Lost: "3", Sw: "6", Sl: "10", Pw: "30", Pl: "37"}
			]
		}
	};
	
	//spinner
	FRISBEE.spinner = {
		//spinner as part of ajax
		spinOpts: {
			lines: 13, // The number of lines to draw
			length: 16, // The length of each line
			width: 8, // The line thickness
			radius: 24, // The radius of the inner circle
			corners: 1, // Corner roundness (0..1)
			rotate: 0, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#666', // #rgb or #rrggbb or array of colors
			speed: 0.5, // Rounds per second
			trail: 60, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: false, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: 'auto', // Top position relative to parent in px
			left: 'auto' // Left position relative to parent in px
		},
		spinTarget: document.getElementById('spinnerContainer'),
		spinnertje: {},
		
		init: function(){
			this.spinnertje = new Spinner(this.spinOpts);
		},
		
		startSpin: function() {
			this.spinTarget.classList.add('spinning');
			this.spinnertje.spin(this.spinTarget);
		},
		
		stopSpin: function() {
			this.spinnertje.stop();
			this.spinTarget.classList.remove('spinning');
		}
	};
	
	
	// DOM ready
	domready(function () {
		// Initialize spinner
		FRISBEE.page.init();
		// Kickstart application
		FRISBEE.controller.init();
	});
	
})();