var FRISBEE = FRISBEE || {};

// self-invoking function om local scope te creeren
(function () {
	
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
			// routing for pages with a name
			routie('/:pageID', function(pageID) {
				FRISBEE.page.render(pageID);
			});
			// default page
			routie({
				'*': function() {
					FRISBEE.page.render("schedule");
				}
			});
		},
	
		change: function () {
			var route = window.location.hash.slice(2);
			var sections = qwery('section[data-route]');
			var menuItems = qwery('nav a');
			
			// hide/normalize all
			for (var i=0; i < sections.length; i++){
				 sections[i].classList.remove('active');
				 menuItems[i].classList.remove('active');
			 }
			// show/highlight active
			if (!route) {
				 sections[0].classList.add('active');
				 menuItems[0].classList.add('active');
			} else {
				var section = qwery('[data-route='+route+']')[0];
				section.classList.add('active');
				var menuItem = qwery('nav a[href$='+route+']')[0];
				menuItem.classList.add('active');
			}
		}
	};
	
	
	// Page
	FRISBEE.page = {
		// Pagina specifieke code in het page object zetten
		render: function (route) {
			// data ophalen
			var data = eval('FRISBEE.'+route);
			// hier is eval gevaarlijk omdat er user data uit de url gebruikt wordt
			// aanvullende bewerkingen op data ophalen die - om meer en rijkere data te kunnen mergen met de template
			var directives = eval("this."+route+'Directives()');
			// template, data + rules mergen
			Transparency.render(qwery('[data-route='+route+']')[0], data, directives);
			
			// extra handelingen per pagina die niet door transparency gedaan kunnen worden // lelijk :-(
			if (route == "ranking") {
				// sort teams by netto points
				var options = { valueNames: ['points'] };
				var teamList = new List('ranking', options);
				teamList.sort('points', { asc: false });
			}
			
			// zichtbaarheid van de secties laten updaten door de router
			FRISBEE.router.change();
		},
		
		// Template directives - data operaties die transparency gebruikt om de data te bewerken
		// rules voor schedule pagina
		scheduleDirectives: function() {
			var JSONrules = {		
				// voor de titel 
				scheduleTitle: {
					text: function(params) {
						return ("Pool "+this.pool+" - "+params.value);
					}
				},
				// voor elke game
				games: {
					// de einduitslag
					score: {
						text: function(params) {
							return (this.team1Score+" - "+this.team2Score);
						}
					},
					// teamnaam1 inclusief winner class or not
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
					// teamnaam1 inclusief winner class or not
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
			return JSONrules;
		},
		
		// rules voor game pagina
		gameDirectives: function () {
			var JSONrules =  {
				// voor de titel
				gameTitle: {
					text: function(params) {
						return ("Pool "+this.pool+" - "+params.value+": "+JSONrules.teamName(1)+" vs. "+JSONrules.teamName(2));
					}
				},
				// voor de overview regel
				// de einduitslag
				result: {
					text: function(params) {
						return ( JSONrules.teamResult(1) + " - " + JSONrules.teamResult(2));
					} 
				},
				// teamnaam1 inclusief winner class or not
				team1Overview: {
					text: function(params) {
						return (JSONrules.teamName(1));
					},
					class: function(params) {
						if (JSONrules.teamResult(1) > JSONrules.teamResult(2)) {
							return ( "winner" );
						}
					}
				},
				// teamnaam2 inclusief winner class or not
				team2Overview: {
					text: function(params) {
						return (JSONrules.teamName(2));
					},
					class: function(params) {
						if (JSONrules.teamResult(1) < JSONrules.teamResult(2)) {
							return ( "winner" );
						}
					}
				},
				// functie die naam van meegegeven team bepaald
				teamName: function(team){
					// hier is eval niet echt gevaarlijk omdat er interne data gebruikt wordt
					return(eval('FRISBEE.game.scores[0].team'+team));
				},
				// functie die eindscore van meegegeven team bepaald
				teamResult: function(team){
					return(parseInt(eval('FRISBEE.game.scores[FRISBEE.game.scores.length-1].team'+team+'Score')));
				},
				// voor de detail tabel
				// voor elke score in de wedstrijd
				scores: {
					// de tussenstand
					interScore: {
						text: function(params) {
							return (this.team1Score + " - " + this.team2Score);
						}
					},
					// teamnaam1 inclusief winner class or not op dat moment
					team1Inter: {
						text: function(params) {
							return ( this.team1);
						},
						class: function(params) {
							if (JSONrules.scores.teamInterResult(this, 1) > JSONrules.scores.teamInterResult(this, 2)) {
								return ( "winner" );
							}
						}
					},
					// teamnaam2 inclusief winner class or not op dat moment
					team2Inter: {
						text: function(params) {
							return ( this.team2);
						},
						class: function(params) {
							if (JSONrules.scores.teamInterResult(this, 1) < JSONrules.scores.teamInterResult(this, 2)) {
								return ( "winner" );
							}
						}
					},
					// functie die aantal punten van meegegeven tussenstand van meegegeven team bepaald
					teamInterResult: function(score, team){
						return(parseInt(eval('score.team'+team+'Score')));
					},
				}
			};
			return JSONrules;
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
						text: function(params) {
							return (parseInt(this.Pw) - parseInt(this.Pl));
						}
					}
				}
			};
			return JSONrules;
		}
	}
	
	
	// DOM ready
	domready(function () {
		// Kickstart application
		FRISBEE.controller.init();
	});
	
})();
