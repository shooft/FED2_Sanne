//namespace
var FRISBEE = FRISBEE || {};


// self-invoking function om local scope te creeren
(function () {
	// Set script to ECMA 5 (including native JSON support)
	"use strict";
	
	
	// Settings
	FRISBEE.settings = {
		lvToken: 'bearer 82996312dc',
		
		lvGetListOfGames:'https://api.leaguevine.com/v1/games/?tournament_id=19389&order_by=%5Bstart_time%5D&fields=%5Bid%2Cteam_1_score%2Cteam_2_score%2Cteam_1%2Cteam_2%2Cstart_time%2Cpool%2Cwinner_id%5D&limit=200',
		
		lvPostGameScore: 'https://api.leaguevine.com/v1/game_scores/',
		
		lvGetListOfPools: 'https://api.leaguevine.com/v1/pools/?tournament_id=19389&order_by=%5Bid%5D&fields=%5Bid%2C%20name%2C%20standings%5D&access_token=90073a56bd',
		
		// XXXXX needs to replaced by the poolID
		lvGetListOfPoolGames: 'https://api.leaguevine.com/v1/games/?tournament_id=19389&pool_id=XXXXX&order_by=%5Bstart_time%5D&fields=%5Bid%2Cpool%2Cteam_1%2Cteam_1_score%2Cteam_2%2Cteam_2_score%2Cwinner_id%5D',
		
		lvGetListOfTeams:'https://api.leaguevine.com/v1/teams/?season_id=20167&order_by=%5Bname%5D&fields=%5Bid%2Cname%5D'
	};
	
	
	// Controller Init
	FRISBEE.controller = {
		init: function () {
			// Initialize me
			FRISBEE.me.init();
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
		pullToRefresh:{},
			
		init: function(){
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
			// data voor de stand ophalen en invoegen
			else if (route == "me") {
				FRISBEE.me.render();
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
		
		startLongProcess: function() {
			FRISBEE.utils.spinner.startLongProcess("ptrContainer", "large", "global");
		},
		
		endLongProcess: function() {
			FRISBEE.utils.spinner.endLongProcess("ptrContainer");
		}
	}
	
	
	// Schedule - het lijstje met games
	FRISBEE.schedule = {
		// render the list of games
		render: function(){
			var url = FRISBEE.settings.lvGetListOfGames;
			// start spinning
			FRISBEE.page.startLongProcess();
			FRISBEE.page.change();
			// Get schedule data from LaegueVine
			FRISBEE.myAjax.get(url,this.displayResults);
		},
		
		// Display schedule data om screen
		 displayResults: function(games){
			// ask tranparency to combine data and template
			Transparency.render($('[data-route=schedule]')[0], games, FRISBEE.schedule.scheduleDirectives());
			// bind a click event to each game
			var gameList = $('#gameList .game');
			for (var i=0; i < gameList.length; i++){
				FRISBEE.game.init(gameList[i].id);
			}
			$('#gameList').show();
			//FRISBEE.page.endLongProcess();
			FRISBEE.page.endLongProcess();
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
					flipDirection = "right";
				}
				else {
					gameMode = "displayMode";
					flipDirection = "left";
				}
				
				// determine flip direction based on the event type
				if ( eventType == "swipeleft") {
					flipDirection = "left";
				}
				else if ( eventType == "swiperight") {
					flipDirection = "right";
				}
				
				// flip the game
				$("#"+gameID+" > div").flippy({
					direction:flipDirection,
					color_target:"#fff",
					duration:1000,
					verso: $("#"+gameID+" > div").html(),
					onStart:  function(){
						$('#'+gameID).css({'z-index':'1000'});
					},
					onMidway: function(){
						self.changeMode(gameID);
					},
					onFinish: function(){
						// handle the events		
						if ( gameMode == "displayMode" ){
							self.bindScroreEvents(gameID);
						}
						// go back to display mode
						else {
							self.unbindScoreEvents(gameID);
						}
						// remove inline style trash
						$('#'+gameID).css({'z-index':"auto"});
						$('#'+gameID+' > div').attr("style","");
					}
					
				})
			}
		},
		
		changeMode: function(gameID){
			$('#'+gameID).toggleClass('displayMode').toggleClass('editMode');
		},
		
		bindScroreEvents: function(gameID){
			var self = this;
			// add event to buttons	
			$( "#"+gameID+" .theScore .teamName div" ).on("click", function(e) {
				e.preventDefault();
				e.stopPropagation();
				// determine game ID and team number of scoring team
				var gameID = $(this).closest(".game")[0].id;
				var teamNumber;
				if ($(this).parent().hasClass("team1")){
					teamNumber = 1;
				} else {
					teamNumber = 2;
				}
				// start processing score
				self.postScore(gameID, teamNumber);
			});
		},
		
		unbindScoreEvents: function(gameID){
			// unbind event from buttons
			$( "#"+gameID+" .theScore .teamName div" ).off();
		},
		
		// een score voor een game doorgeven aan LeagueVine
		postScore: function(gameID, teamNumber){		
			var self = this;
			
			//add spinner
			self.startLongProcess(gameID);
			
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
				var theGameScore = $('#'+gameID+" .theScore")[0];
				Transparency.render(theGameScore, gameScore, self.gameDirectives());
				//remove spinner
				self.endLongProcess(gameID);
				// check if game is finished
				if (gameScore.is_final) {
					// tell game it is final
					$('#'+gameID).addClass("finished");
					// and back to display mode
					self.changeMode(gameID);
				}
			};	
		},
		
		startLongProcess: function(gameID) {
			FRISBEE.utils.spinner.startLongProcess(gameID, "small", "local");
		},
		
		endLongProcess: function(gameID) {
			FRISBEE.utils.spinner.endLongProcess(gameID);
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
							return("game flipbox-container displayMode finished");
						} else {
							return("game flipbox-container displayMode");
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
					},
					class: function() {
						var teamClass = "theName";
						if (this.team_1_id == localStorage.myTeamID) {
							teamClass = teamClass + " myTeam";
						}
						return(teamClass);
					}
				},
				team2Complete: {
					text: function() {
						return (this.team_2.name);
					},
					id: function() {
						return (this.team_2_id);
					},
					class: function() {
						var teamClass = "theName";
						if (this.team_2_id == localStorage.myTeamID) {
							teamClass = teamClass + " myTeam";
						}
						return(teamClass);
					}
				},
				instruction1: {
					text: function() {
						return( self.composeInstruction(this.team_1_score) );
					}
				},
				instruction2: {
					text: function() {
						return( self.composeInstruction(this.team_2_score) );
					}
				}
			};
			return JSONrules;
		},
		
		composeInstruction: function(teamScore) {
			var instruction;
					
			switch(teamScore) {
				case 0:
					instruction = "Eerste puntje";
					break;
				case 1:
					instruction = "Tweede puntje";
					break;
				case this.WINNINGSCORE-2:
					instruction = "Oeh spannend!";
					break;
				case this.WINNINGSCORE-1:
					instruction = "Matchpoint!!!";
					break;
				default:
					instruction = "Puntje erbij!";
			}
			
			return (instruction);
		}			
	};
	

	// Ranking - de stand
	FRISBEE.ranking = {
		// render the list of pools
		render: function(){
			var url = FRISBEE.settings.lvGetListOfPools;
			// start spinning
			FRISBEE.page.startLongProcess();
			FRISBEE.page.change();
			// Get schedule data from LaegueVine
			FRISBEE.myAjax.get(url,this.displayResults);
		},
		
		// Display schedule data on screen
		displayResults: function(pools){
			// ask tranparency to combine data and template
			Transparency.render($('[data-route=ranking]')[0], pools, FRISBEE.ranking.rankingDirectives());
			// sort teams in the pools
			var poolList = $('#poolList .pool');
			for (var i=0; i < poolList.length; i++){
				FRISBEE.pool.init(poolList[i].id);
			}
			$('#poolList').show();
			FRISBEE.page.endLongProcess();
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
			var self = this;
			// sort teams by netto points
			var options = { valueNames: ['plus_minus'] };
			var teamList = new List(poolID, options);
			teamList.sort('plus_minus', { asc: false });
			// refresh pool results if displayed
			if ( $('#'+poolID+' .theResults').hasClass("shown") ) {
				this.refreshResults(poolID);
			}
			// bind event to button
			else {
				$('#'+poolID+' .theControls a').off().on("click", function(e){
					self.toggleResults(poolID);
				});
			}
		},
		
		// refresh results for pool
		refreshResults: function(poolID){
			this.getResults(poolID, "refresh");
		},
		
		// hide/show results for pool
		toggleResults: function(poolID){
			// show results
			if ( ! $('#'+poolID+' .theResults').hasClass("shown") ) {		
				this.getResults(poolID, "show");
			}
			// hide results
			else {
				this.hideResults(poolID);
			}
		},
		
		// get pool results from LeagueVine
		getResults: function(poolID, trigger){
			var self = this;
			$('#'+poolID+' .theControls a').html("Getting data...");
			
			var url = FRISBEE.settings.lvGetListOfPoolGames.replace("XXXXX", poolID);
			self.startLongProcess(poolID);
			FRISBEE.myAjax.get(url,displayResults);
			
			// display results for pool
			function displayResults(games){
				var poolGames = {};
				poolGames["poolResults"] = [];
				// filter games that have a winner
				for (var i=0; i < games.objects.length; i++){
					if ( games.objects[i].winner_id != null ) {
						poolGames.poolResults.push ( games.objects[i] );
					}
				};
				
				// ask tranparency to combine data and template
				Transparency.render($('#'+poolID+' .theResults')[0], poolGames, FRISBEE.pool.poolResultDirectives());
				
				// wait a little little for tranparency to finish
				setTimeout(function(){
					
					if(trigger == "show") {
						$('#'+poolID+' .theControls a').html("Sliding down...");
					}
					$('#'+poolID+' .theResults').addClass("shown");
					
					setTimeout(function(){
						self.endLongProcess(poolID);
						$('#'+poolID+' .theControls a').html("Hide results");
					},500);
				
				},100);
			};
		},
		
		// hide results for pool
		hideResults: function(poolID) {
			$('#'+poolID+' .theControls a').html("Sliding up...");
			$('#'+poolID+' .theResults').removeClass("shown");
			
			setTimeout(function(){
				$('#'+poolID+' .theControls a').html("Show results");
			},800);
		},
		
		startLongProcess: function(poolID) {
			FRISBEE.utils.spinner.startLongProcess(poolID, "small", "local");
		},
		
		endLongProcess: function(poolID) {
			FRISBEE.utils.spinner.endLongProcess(poolID);
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
					teamRanking: {
						class: function() {
							if (this.team.id == localStorage.myTeamID) {
								return ("myTeam");
							}
							else {
								return("");
							}
						}
						
					},
					
					teamName: {
						text: function() {
							return (this.team.name);
						}
					}
				}		
			};
			return JSONrules;
		},
		
		// rules voor schedule pagina
		poolResultDirectives: function() {
			var JSONrules = {		
				// voor elke game
				poolResults: FRISBEE.game.gameDirectives()
			};
			return JSONrules;
		}
	};
	
	
	// MY SETTINGS - preferences for the user - for now only my team
	FRISBEE.me = {
		// init my prefs
		init: function(){
			if (Modernizr.localstorage) {
				if (localStorage.getItem("myTeamID") === null) {	
					localStorage.myTeamID = "allTeams";
				}
			}
		},
		
		// render the prefs
		render: function(){
			FRISBEE.page.change();
			
			if (Modernizr.localstorage) {
				if (localStorage.getItem("teams") === null) {	
					var url = FRISBEE.settings.lvGetListOfTeams;
					// start spinning
					FRISBEE.page.startLongProcess();
					// Get schedule data from LaegueVine
					FRISBEE.myAjax.get(url,this.displayResults);
				}
				else {
					this.renderResults(localStorage.teams);
				}
			}
		},
		
		displayResults: function(teams){
			// store teams in local storage
			localStorage.teams = JSON.stringify(teams.objects);
			
			FRISBEE.me.renderResults(localStorage.teams);
			FRISBEE.page.endLongProcess();
		},
		
		renderResults: function(teams){
			var teamList = {};
			teamList["teams"] = JSON.parse(teams);
			
			// ask tranparency to combine data and template
			Transparency.render($('[data-route=me]')[0], teamList, FRISBEE.me.meDirectives());
			var teamList = $("#me li");
			for (var i=0; i < teamList.length; i++){
				FRISBEE.team.init(teamList[i].id);
			}
			
			$("#me li").removeClass("active");
			$("#me #team"+localStorage.myTeamID).addClass("active");
			
			$("#me ul").show();
		},
		
		// rules voor team list
		meDirectives: function() {
			var JSONrules = {		
				teams: FRISBEE.team.teamDirectives()
			};
			return JSONrules;
		}
	};
	
	FRISBEE.team = {
		init: function(teamID) {
			$("#"+teamID).off().on("click", function(){
				localStorage.myTeamID = teamID.substr(4);
				$("#me li").removeClass("active");
				$("#me #"+teamID).addClass("active");
			});
		},
		
		// rules voor team
		teamDirectives: function() {
			var JSONrules = {		
				//team
				teamInList: {
					id: function() {
						return ("team"+this.id);
					},
					text: function() {
						return (this.name);
					}
				}				
			};
			return JSONrules;
		}
	};


	// UTILS - functies van algemeen nut
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
			
			spinnerList: {},
			
			init: function(size){
				var spinOpts;
				if (size == "large") {
					spinOpts = this.spinOptsLarge;
				} else {
					spinOpts = this.spinOptsSmall;
				}
				return (new Spinner(spinOpts));
			},
			
			//start feedback during long process
			startLongProcess: function(objectID, spinnerSize, spinnerScope){
				$("#"+objectID).addClass("busy");
				this.spinnerList[objectID] = FRISBEE.utils.spinner.init(spinnerSize);
				// add spinner container
				$("#"+objectID).prepend('<div id="spinnerContainer'+objectID+'" class="spinnerContainer '+spinnerScope+'"></div>');
				//spin target
				var spinTarget = $("#"+objectID+" .spinnerContainer")[0];
				spinTarget.classList.add('spinning');
				this.spinnerList[objectID].spin(spinTarget);
			},
			
			//end feedback during long process
			endLongProcess: function(objectID){
				var spinTarget = $("#"+objectID+" .spinnerContainer")[0];
				this.spinnerList[objectID].stop(spinTarget);
				spinTarget.classList.remove('spinning');
				$("#"+objectID+" > .spinnerContainer").remove();
				$("#"+objectID).removeClass("busy");
			},
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