// JavaScript Document

// Object constructor
function Persoon(name) {
	this.name = name;

	this.speak = function () {
 		console.log('Hi, my name is ' + this.name);
		
		// closure test - deze inner function kan nog steeds bij de properties, variabelen en function van zijn outer functie ook nadat de outer functie al uitgevoerd is
		setTimeout(function(){
			console.log(name+" can nog steeds speaken");
		}, 5000);
	}
}

// Extra functions by prototype thingie
Persoon.prototype.walk = function () {
	console.log('I walk fast');
};

Persoon.prototype.eat = function () {
	console.log('I eat tompouchen');
};

var bob = new Persoon('bob');

bob.speak();
bob.walk();
bob.eat();


// Object literal
var job = {
	name: 'job',

	speak: function () {
		console.log('Hi, my name is ' + this.name);
	},
	
	walk: function () {
		console.log('I walk slow');
	},

	eat: function () {
		console.log('I eat appeltaart');
	}
};

job.speak();
job.walk();
job.eat();



// Local scope

(function () {
	var iterator = "teller";
	var max = "maximum";
	var min = "minimum";
	
	console.log("iterator = "+iterator+", max = "+max+", min = "+min);
})();


// Global scope

var iterator = "teller2";
var max = "maximum2";
var min = "minimum2";
	
console.log("iterator = "+iterator+", max = "+max+", min = "+min);