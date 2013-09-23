// JavaScript Document

var FRISBEE = FRISBEE || {};

// self-invoking function om local scope te creeren
(function () {
	
	// Data objecten - voor nu even hier - straks ophalen via de api
	FRISBEE.schedule = {
		title:'Pool A - Schedule',
		games: [
			{ date: "Monday, 9:00am", team1: "Chasing", team1Score: "13", team2: "Amsterdam Money Gang", team2Score: "9"},
			{ date: "Monday, 9:00am", team1: "Boomsquad", team1Score: "15", team2: "Beast Amsterdam", team2Score: "11"},
			{ date: "Monday, 10:00am", team1: "Beast Amsterdam", team1Score: "14", team2: "Amsterdam Money Gang", team2Score: "12"},
			{ date: "Monday, 10:00am", team1: "Chasing", team1Score: "5", team2: "Burning Snow", team2Score: "15"},
			{ date: "Monday, 11:00am", team1: "Boomsquad", team1Score: "11", team2: "Amsterdam Money Gang", team2Score: "15"},    
			{ date: "Monday, 11:00am", team1: "Burning Snow", team1Score: "15", team2: "Beast Amsterdam", team2Score: "6"},
			{ date: "Monday, 12:00pm", team1: "Chasing", team1Score: "8", team2: "Beast Amsterdam", team2Score: "15"},
			{ date: "Monday, 12:00pm", team1: "Boomsquad", team1Score: "15", team2: "Burning Snow", team2Score: "8"},
			{ date: "Monday, 1:00pm", team1: "Chasing", team1Score: "15", team2: "Boomsquad", team2Score: "14"},
			{ date: "Monday, 1:00pm", team1: "Burning Snow", team1Score: "15", team2: "Amsterdam Money Gang", team2Score: "11"}
		]
	};
	
	FRISBEE.game = {
		title:'Pool A - Score: Boomsquad vs. Burning Snow',
		scores: [
			{ score: "1", team1:"Boomsquad", team1Score: "1", team2:"Burning Snow", team2Score: "0"},
			{ score: "2", team1:"Boomsquad", team1Score: "1", team2:"Burning Snow", team2Score: "1"},
			{ score: "3", team1:"Boomsquad", team1Score: "1", team2:"Burning Snow", team2Score: "2"},
			{ score: "4", team1:"Boomsquad", team1Score: "2", team2:"Burning Snow", team2Score: "2"},
			{ score: "5", team1:"Boomsquad", team1Score: "3", team2:"Burning Snow", team2Score: "2"},
			{ score: "6", team1:"Boomsquad", team1Score: "4", team2:"Burning Snow", team2Score: "2"},
			{ score: "7", team1:"Boomsquad", team1Score: "5", team2:"Burning Snow", team2Score: "2"},
			{ score: "8", team1:"Boomsquad", team1Score: "5", team2:"Burning Snow", team2Score: "3"},
			{ score: "9", team1:"Boomsquad", team1Score: "6", team2:"Burning Snow", team2Score: "3"},
			{ score: "10", team1:"Boomsquad", team1Score: "7", team2:"Burning Snow", team2Score: "3"},
			{ score: "11", team1:"Boomsquad", team1Score: "7", team2:"Burning Snow", team2Score: "4"},
			{ score: "12", team1:"Boomsquad", team1Score: "8", team2:"Burning Snow", team2Score: "4"},
			{ score: "13", team1:"Boomsquad", team1Score: "8", team2:"Burning Snow", team2Score: "5"},
			{ score: "14", team1:"Boomsquad", team1Score: "8", team2:"Burning Snow", team2Score: "6"},
			{ score: "15", team1:"Boomsquad", team1Score: "9", team2:"Burning Snow", team2Score: "6"},
			{ score: "16", team1:"Boomsquad", team1Score: "9", team2:"Burning Snow", team2Score: "7"},
			{ score: "17", team1:"Boomsquad", team1Score: "10", team2:"Burning Snow", team2Score: "7"},
			{ score: "18", team1:"Boomsquad", team1Score: "11", team2:"Burning Snow", team2Score: "7"},
			{ score: "19", team1:"Boomsquad", team1Score: "12", team2:"Burning Snow", team2Score: "7"},
			{ score: "20", team1:"Boomsquad", team1Score: "13", team2:"Burning Snow", team2Score: "7"},
			{ score: "21", team1:"Boomsquad", team1Score: "14", team2:"Burning Snow", team2Score: "7"},
			{ score: "22", team1:"Boomsquad", team1Score: "14", team2:"Burning Snow", team2Score: "8"},
			{ score: "23", team1:"Boomsquad", team1Score: "15", team2:"Burning Snow", team2Score: "8"}
		]
	};
	
	FRISBEE.ranking = {
		title:'Pool A - Ranking',
		teams: [
			{ team: "Chasing", Win: "2", Lost: "2", Sw: "7", Sl: "9", Pw: "35", Pl: "39"},
			{ team: "Boomsquad", Win: "2", Lost: "2", Sw: "9", Sl: "8", Pw: "36", Pl: "34"},
			{ team: "Burning Snow", Win: "3", Lost: "1", Sw: "11", Sl: "4", Pw: "36", Pl: "23"},
			{ team: "Beast Amsterdam", Win: "2", Lost: "2", Sw: "6", Sl: "8", Pw: "30", Pl: "34"},
			{ team: "Amsterdam Money Gang", Win: "1", Lost: "3", Sw: "6", Sl: "10", Pw: "30", Pl: "37"}
		]
	};
	
	
	// Template directives - data operaties van JSON naar template
	FRISBEE.scheduleDirectives ={
		// teamnamen incl winner class en einduitslag voor tabel
		games: {
			score: {
				text: function(params) {
					return (this.team1Score + " - " + this.team2Score);
				}
			},
			
			team1Complete: {
				text: function(params) {
					return (this.team1);
				},
				class: function(params) {
					if (parseInt(this.team1Score) > parseInt(this.team2Score)) {
						return ( "winner" );
					}
				}
			},
			
			team2Complete: {
				text: function(params) {
					return (this.team2);
				},
				class: function(params) {
					if (parseInt(this.team1Score) < parseInt(this.team2Score)) {
						return ( "winner" );
					}
				}
			}
		}
	};
	
	
	FRISBEE.gameDirectives ={
		// teamnamen en einduitslag voor de overview tabel
		result: {
			text: function(params) {
				// hoe kan dit (FRISBEE.gameDirectives) korter?
				return ( FRISBEE.gameDirectives.team1Result() + " - " + FRISBEE.gameDirectives.team2Result());
			} 
		},
		
		team1Overview: {
			text: function(params) {
				return ( FRISBEE.game.scores[0].team1);
			},
			class: function(params) {
				if (FRISBEE.gameDirectives.team1Result() > FRISBEE.gameDirectives.team2Result()) {
					return ( "winner" );
				}
			}
		},
		
		team2Overview: {
			text: function(params) {
				return ( FRISBEE.game.scores[0].team2);
			},
			class: function(params) {
				if (FRISBEE.gameDirectives.team1Result() < FRISBEE.gameDirectives.team2Result()) {
					return ( "winner" );
				}
			}
		},
		
		team1Result: function(){
			return(FRISBEE.game.scores[FRISBEE.game.scores.length-1].team1Score);
		},
		team2Result: function(){
			return(FRISBEE.game.scores[FRISBEE.game.scores.length-1].team2Score);
		},
		
		// de scores voor de detailtabel
		scores: {
			interScore: {
				text: function(params) {
					return (this.team1Score + " - " + this.team2Score);
				}
			},
			
			team1Inter: {
				text: function(params) {
					return ( this.team1);
				},
				class: function(params) {
					// hoe kan dit (FRISBEE.gameDirectives.scores) korter?
					if (FRISBEE.gameDirectives.scores.team1InterResult(this) > FRISBEE.gameDirectives.scores.team2InterResult(this)) {
						return ( "winner" );
					}
				}
			},
			
			team2Inter: {
				text: function(params) {
					return ( this.team2);
				},
				class: function(params) {
					if (FRISBEE.gameDirectives.scores.team1InterResult(this) < FRISBEE.gameDirectives.scores.team2InterResult(this)) {
						return ( "winner" );
					}
				}
			},
			
			team1InterResult: function(score){
			 	return(parseInt(score.team1Score));
			},
			team2InterResult: function(score){
			 	return(parseInt(score.team2Score));
			}
			
		}
	};
	
	
	FRISBEE.rankingDirectives ={
		teams: {
			points: {
				text: function(params) {
					return (this.Pw - this.Pl);
				}
			}
		}
	};
	
	
	// Controller Init
	FRISBEE.controller = {
		init: function () {
			// Initialize router
			console.log("controller.init");
			FRISBEE.router.init();
		}
	};
	
	
	// Router
	FRISBEE.router = {
		init: function () {
			console.log("router.init");
			routie({
				'/schedule': function() {
					FRISBEE.page.render("schedule");
				},
				'/game': function() {
					FRISBEE.page.render("game");
				},
				'/ranking': function() {
					FRISBEE.page.render("ranking");
				},
				'*': function() {
					FRISBEE.page.render("schedule");
				}
			});
		},
	
		change: function () {
			var route = window.location.hash.slice(2);
			console.log("router.change: "+route);
			var sections = qwery('section[data-route]');
			
			// Default route
			if (!route) {
				 sections[0].classList.add('active');
			} else {
				var section = qwery('[data-route=' + route + ']')[0];
				// Show active section, hide all other
				if (section) {
					 for (var i=0; i < sections.length; i++){
						 sections[i].classList.remove('active');
					 }
					section.classList.add('active');
				}
			}
		}
	};
	
	
	// Page
	FRISBEE.page = {
		render: function (route) {
			console.log("page.render");
			// data en template samen- en invoegen
			var data = eval('FRISBEE.'+route);
			var directives = eval('FRISBEE.'+route+'Directives');
			Transparency.render(qwery('[data-route='+route+']')[0], data, directives);
			
			// extra handelingen per pagina
			if (route == "ranking") {
				// sort teams by points
				// is dit zoals je dit doet?
				var options = { valueNames: [ 'points' ] };
				var teamList = new List('ranking', options);
				teamList.sort('points', { asc: false });
			}
			
			// zichtbaarheid laten updaten door de router
			FRISBEE.router.change();
		}
	}
	
	
	// DOM ready
	domready(function () {
		// Kickstart application
		FRISBEE.controller.init();
	});
	
})();