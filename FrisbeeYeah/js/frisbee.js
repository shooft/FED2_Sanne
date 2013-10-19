//namespace
var FRISBEE = FRISBEE || {};


// self-invoking function om local scope te creeren
(function () {
	// Set script to ECMA 5 (including native JSON support)
	"use strict";
	
	
	// Settings
	FRISBEE.settings = {
		lvToken: 'bearer 82996312dc',
		
		lvGetListOfGames:'https://api.leaguevine.com/v1/games/?tournament_id=19389&order_by=%5Bid%5D&fields=%5Bid%2Cteam_1_score%2Cteam_2_score%2Cteam_1%2Cteam_2%2Cstart_time%2Cpool%2Cwinner_id%5D&limit=200',
		
		lvPostGameScore: 'https://api.leaguevine.com/v1/game_scores/',
		
		lvGetListOfPools: 'https://api.leaguevine.com/v1/pools/?tournament_id=19389&order_by=%5Bid%5D&fields=%5Bid%2C%20name%2C%20standings%5D&access_token=90073a56bd'
	};
	
	
	// Controller Init
	FRISBEE.controller = {
		init: function () {
			// Initialize page
			FRISBEE.page.init();
			// Initialize router
			FRISBEE.router.init();
		}
	};
	

	// Router - afhandelen van urls
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
	
	
	// Page - de baas over de algemene dingen van de pagina
	FRISBEE.page = {
		pageSpinTarget: document.getElementById('pageSpinnerContainer'),
		pageSpinner: {},
		pullToRefresh:{},
			
		init: function(){
			// Initialize spinner
			this.pageSpinner = FRISBEE.utils.spinner.init("large");
			// Initialize pull to refresh
			this.pullToRefresh = FRISBEE.utils.pullToRefresh.init(this.refreshPage);
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
		
		// refresh the content of the page
		refreshPage: function(){
			var route = window.location.hash.slice(2);
			FRISBEE.page.render(route);
		},
		
		// zichtbaarheid van de secties updaten
		change: function () {
			var route = window.location.hash.slice(2);
			
			// hide sections
			$('section[data-route]').removeClass('active');
			// show section
			$('#'+route).addClass('active');
			
			// normalize menu items
			$('nav a').removeClass('active');
			// emphasize menu item
			$( "nav a[href='#/"+route+"']" ).addClass('active');
		},
		
		// start feedback during long process
		startLongProcess: function(){
			this.pageSpinTarget.classList.add('spinning');
			this.pageSpinner.spin(this.pageSpinTarget);
		},
		
		// end feedback during long process
		endLongProcess: function(){
			this.pageSpinner.stop(this.pageSpinTarget);
			this.pageSpinTarget.classList.remove('spinning');
			
		}
	}
	
	
	// Schedule - het lijstje met games
	FRISBEE.schedule = {
		// render the list of games
		render: function(){
			var self = this;
			var url = FRISBEE.settings.lvGetListOfGames;
			// start spinning
			FRISBEE.page.startLongProcess();
			FRISBEE.page.change();
			// Get schedule data from LaegueVine
			FRISBEE.myAjax.get(url,displayResults);
			
			// Display schedule data om screen
			function displayResults(games){
				// ask tranparency to combine data and template
				Transparency.render($('[data-route=schedule]')[0], games, self.scheduleDirectives());
				// bind a click event to each game
				var gameList = $('#gameList .game');
				for (var i=0; i < gameList.length; i++){
					FRISBEE.game.init(gameList[i].id);
				}
				$('#gameList').show();
				FRISBEE.page.endLongProcess();
			}
		},
		
		// rules voor schedule pagina
		scheduleDirectives: function() {
			var JSONrules = {		
				// voor elke game
				objects: FRISBEE.game.gameDirectives()
			};
			return JSONrules;
		}
	};
	

	// Game - een game in de Schedule
	FRISBEE.game = {
		// winning score
		WINNINGSCORE: 15,
		// array of game spinners
		gameSpinner: {},
		
		// react on start/stop scoring gestures
		init: function(gameID){
			var self = this;
			
			// on swipe left or right switch mode
			var element = document.getElementById(gameID);
    		Hammer(element).on("swiperight swipeleft", function(e) {
        		self.swithGameMode(e.currentTarget.id, e.type);
    		});
			$("#"+gameID).on("click", function(e) {
        		self.swithGameMode(e.currentTarget.id, e.type);
    		});
			// unbind leftover events from buttons
			$( "#"+gameID+" .theScore .teamName" ).off();
		},
		
		swithGameMode: function(gameID, eventType){
			var self = this;
			var gameMode;
			var flipDirection;
			
			// negeren als game busy of finished is
			if (  ( !$('#'+gameID).hasClass('busy') && !$('#'+gameID).hasClass('finished') ) ) {
			
				// determine current mode
				if ( $('#'+gameID).hasClass('editMode') ) {
					gameMode = "editMode";
					flipDirection = "lr";
				} else {
					gameMode = "displayMode";
					flipDirection = "rl";
				}
				
				// determine flip direction based on the event type
				if ( eventType == "swipeleft") {
					flipDirection = "rl";
				} else if ( eventType == "swiperight") {
					flipDirection = "lr";
				}
				
				// flip the game
				$("#"+gameID).flip({
					direction:flipDirection,
					color:"#fff",
					onAnimation: function(){
						// go to edit mode		
						if ( gameMode == "displayMode" ){
							self.displayToEdit(gameID);
						}
						// go back to display mode
						else {
							self.editToDisplay(gameID);
						}
					},
					onEnd: function(){
						$('#'+gameID).attr("style","");
					}
					
				})
			}
		},
		
		displayToEdit: function(gameID){
			var self = this;
			$('#'+gameID).removeClass('displayMode').addClass('editMode');
							
			// add event to buttons	
			$( "#"+gameID+" .theScore .teamName" ).on("click", function(e) {
				e.preventDefault();
				e.stopPropagation();
				// determine game ID and team number of scoring team
				var gameID = $(this).closest(".game")[0].id;
				var teamNumber;
				if ($(this).hasClass("team1")){
					teamNumber = 1;
				} else {
					teamNumber = 2;
				}
				// start processing score
				self.postScore(gameID, teamNumber);
			});
		},
		
		editToDisplay: function(gameID){
			// game from edit to display
			$('#'+gameID).removeClass('editMode').addClass('displayMode');
			// unbind event from buttons
			$( "#"+gameID+" .theScore .teamName" ).off();
		},
		
		// een score voor een game doorgeven aan LeagueVine
		postScore: function(gameID, teamNumber){		
			var self = this;
			
			//add spinner
			this.startLongProcess(gameID);
			
			// huidige score
			var team1Score = parseInt($('#'+gameID+' .teamScore.team1').text());
			var team2Score = parseInt($('#'+gameID+' .teamScore.team2').text());
			
			// score updaten
			if (teamNumber == 1) {
				team1Score = team1Score + 1;
			} else {
				team2Score = team2Score + 1;
			};
			
			// determine if game is final
			var isFinal = false;
			if (team1Score == this.WINNINGSCORE || team2Score == this.WINNINGSCORE) {
				isFinal =  true;
			}
			
			// ajaxData samenstellen
			var url = FRISBEE.settings.lvPostGameScore;
			var gameScore = {
					game_id: gameID,
					team_1_score: team1Score,
					team_2_score: team2Score,
					is_final: isFinal
					};
			// data naar LaegueVine sturen
			FRISBEE.myAjax.post(url,gameScore,displayResults);
			
			// de score op het scherm updaten na het posten van een score
			function displayResults(gameScore){
				// update score
				var theGame = $('#'+gameID+" .theScore")[0];
				Transparency.render(theGame, gameScore, self.gameDirectives());
				//remove spinner
				self.endLongProcess(gameID);
				// check if game is finished
				if (gameScore.is_final) {
					// tell game it is final
					$('#'+gameID).addClass("finished");
					// and back to display mode
					self.editToDisplay(gameID);
				}
			};
		},
		
		//start game feedback during long process
		startLongProcess: function(gameID){
			$("#"+gameID).addClass("busy");
			this.gameSpinner[gameID] = FRISBEE.utils.spinner.init("small");
			// add spinner container
			$("#"+gameID).prepend('<div id="gameSpinnerContainer'+gameID+'" class="spinnerContainer local"></div>');
			//spin target
			var spinTarget = $("#"+gameID+" .spinnerContainer")[0];
			spinTarget.classList.add('spinning');
			this.gameSpinner[gameID].spin(spinTarget);
		},
		
		//end game feedback during long process
		endLongProcess: function(gameID){
			var spinTarget = $("#"+gameID+" .spinnerContainer")[0];
			this.gameSpinner[gameID].stop(spinTarget);
			spinTarget.classList.remove('spinning');
			$("#"+gameID+" .spinnerContainer").remove();
			$("#"+gameID).removeClass("busy");
		},
		
		// rules voor ranking pagina
		gameDirectives: function() {
			var self = this;
			
			var JSONrules = {
				// id van de game
				game: {
					id: function(){
						return(this.id);
					},
					class: function() {
						if( this.winner_id != null){
							return("game displayMode finished");
						} else {
							return("game displayMode");
						}
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
						return(startTime.toFormat('HH:MI P'));
					}
				},
				// pool
				pool: {
					text: function(){
						return("Pool "+ this.pool.name);
					}
				},
				// teamnamen inclusief winner class or not
				team1Winner: {
					class: function() {
						if (parseInt(this.team_1_score) > parseInt(this.team_2_score)) {
							return ( "teamName team1 winner" );
						} else {
							return ( "teamName team1" );
						}
					}
				},
				team2Winner: {
					class: function() {
						if (parseInt(this.team_1_score) < parseInt(this.team_2_score)) {
							return ( "teamName team2 winner" );
						} else {
							return ( "teamName team2" );
						}
					}
				},
				team1Complete: {
					text: function() {
						return (this.team_1.name);
					},
					id: function() {
						return (this.team_1_id);
					}
				},
				team2Complete: {
					text: function() {
						return (this.team_2.name);
					},
					id: function() {
						return (this.team_2_id);
					}
				},
				instruction1: {
					text: function() {
						return( composeInstruction(this.team_1_score) );
					}
				},
				instruction2: {
					text: function() {
						return( composeInstruction(this.team_2_score) );
					}
				}
			};
			
			function composeInstruction(teamScore) {
				var instruction;
						
				switch(teamScore) {
					case 0:
						instruction = "Eerste puntje";
						break;
					case 1:
						instruction = "Tweede puntje";
						break;
					case self.WINNINGSCORE-2:
						instruction = "Oeeeh spannend!";
						break;
					case self.WINNINGSCORE-1:
						instruction = "Matchpoint yeah!";
						break;
					default:
						instruction = "Puntje erbij!";
				}
				
				return (instruction);
			}			
			
			return JSONrules;
		}
	};
	

	// Ranking - de stand
	FRISBEE.ranking = {
		// render the list of pools
		render: function(){
			var self = this;
			var url = FRISBEE.settings.lvGetListOfPools;
			// start spinning
			FRISBEE.page.startLongProcess();
			FRISBEE.page.change();
			// Get schedule data from LaegueVine
			FRISBEE.myAjax.get(url,displayResults);
			
			// Display schedule data om screen
			function displayResults(pools){
				// ask tranparency to combine data and template
				Transparency.render($('[data-route=ranking]')[0], pools, self.rankingDirectives());
				// sort teams in the pools
				var poolList = $('#poolList .pool');
				for (var i=0; i < poolList.length; i++){
					FRISBEE.pool.init(poolList[i].id);
				}
				$('#poolList').show();
				FRISBEE.page.endLongProcess();
			}
		},
		
		// rules voor schedule pagina
		rankingDirectives: function() {
			var JSONrules = {		
				// voor elke game
				objects: FRISBEE.pool.poolDirectives()
			};
			return JSONrules;
		}
	};
	

	// Pool - een pool in de Ranking
	FRISBEE.pool = {
		init: function(poolID){
			// sort teams by netto points
			var options = { valueNames: ['plus_minus'] };
			var teamList = new List(poolID, options);
			teamList.sort('plus_minus', { asc: false });
		},
		
		// rules voor pool object
		poolDirectives: function() {
			var JSONrules = {		
				//pool ID
				poolID: {
					id: function() {
						return (this.id);
					}
				},
				
				//poolName
				poolName: {
					html: function(params) {
						return ("<h2>Pool "+this.name+"</h2>");
					}
				},
				
				//teamName
				standings: {
					teamName: {
						text: function() {
							return (this.team.name);
						}
					}
				}				
			};
			return JSONrules;
		}
	};
	

	// Utils - functies van algemeen nut
	FRISBEE.utils = {
		spinner: {
			//spinner as part of ajax
			spinOptsLarge: {
				lines: 13, // The number of lines to draw
				length: 24, // The length of each line
				width: 12, // The line thickness
				radius: 36, // The radius of the inner circle
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
			
			spinOptsSmall: {
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
			
			init: function(size){
				var spinOpts;
				if (size == "large") {
					spinOpts = this.spinOptsLarge;
				} else {
					spinOpts = this.spinOptsSmall;
				}
				return (new Spinner(spinOpts));
			}
		},
		
		pullToRefresh: {
			init: function(callback){
				var container_el = getEl('ptrContainer');
				var pullrefresh_el = getEl('pullrefresh');
				var pullrefresh_icon_el = getEl('pullrefresh-icon');
				// create ptr object
				var pullToRefresh = new PullToRefresh(container_el, pullrefresh_el, pullrefresh_icon_el);
				// add ptr function
				pullToRefresh.handler = function() {
					//var self = this;
					//self.slideUp();
					callback();
				};
				return(pullToRefresh);
			}
		}
	};
	
	
	// DOM ready
	$(function() {
		// Kickstart application
		FRISBEE.controller.init();
	});
	
})();