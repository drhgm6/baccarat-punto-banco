var deck = generateDeck(4), playerCash = 500, wager = 0, counter = 0, GAMELOG =[], CASHLOG = [];
var ctx;
var emptycard = '<div class="empty card"></div>';

$(document).ready( function() {sortDeck(); $('#playerGold').text(playerCash);});

function card(suit, rank, deck) {
	this.fullName = '' + rank + ' of ' + suit + ' from deck ' + deck;
	this.suit = suit;
	this.rank = rank;
	this.deck = deck;
	if ( suit == 'Diamonds' || suit == 'Hearts')
		this.color = 'red';
	else if ( suit == 'Clubs' || suit == 'Spades')
		this. color = 'black';
	if ( rank == 'J' || rank == 'Q' || rank == 'K' )
		this.value = 0;
	else if (rank == 'A')
		this.value = 1;
	else this.value = rank;
}
function generateDeck(num) {
	var deck = [], suits = ['Diamonds','Hearts','Clubs','Spades'], ranks = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K']; 
	for (var i =1; i<= num; i++) {
		for (var j =0; j < suits.length; j++) {
			for (var k = 0; k < ranks.length; k ++ ) {
				
				deck.push(new card(suits[j], ranks[k], i));
			}
		}
	}
	return deck;
}
function shuffle(arr) {
//Randomize an array using the Fisher-Yates shuffle. Function outputs the new, randomized array. 
	for (var i=0; i < arr.length; i++) {
		var j = Math.floor(Math.random() * i);
		var q = arr[i];
		arr[i] = arr[j];
		arr[j] = q;
	}
	return arr;
}
function displayCard(card) {
	var code = '<div id="' + card.rank + card.suit.charAt(0) + '_d' + card.deck + '" class="' + card.color + ' card"><img src="_img/' + card.suit.charAt(0) + '.png">' ;
	if (card.rank == "T")
		code += "10" + '</div>';
	else
		code += card.rank + '</div>';
	return code;	
}
function dealTurn() {
	$('#bankerBet').prop('disabled',false);	
	$('#playerBet').prop('disabled',false);
	$('#egalitieBet').prop('disabled',false);
	$('#wagerbox').prop('disabled',false);
	wager = parseFloat($('#wagerbox').prop('value')).toFixed(2);
	if ( wager > playerCash ) {
		$('#result').html('Wager exceeds player cash!');
		$('#dealbutton').one('click', dealTurn);
		return;
	}
	if (wager <=0 ) {
		$('#result').html("You can't wager nothing!");
		$('#dealbutton').one('click', dealTurn);
		return;
	}
	$('#wager').html(wager);
	playerCash -= wager;
	playerHand = [], dealerHand = [];
	playerHand.push(deck[counter++]);
	dealerHand.push(deck[counter++]);
	playerHand.push(deck[counter++]);
	dealerHand.push(deck[counter++]);
	$('#playerHand').html(displayCard(playerHand[0]) + displayCard(playerHand[1]));
	$('#dealerHand').html(displayCard(dealerHand[0]) + displayCard(dealerHand[1]));
	var dv = handValue(dealerHand), pv = handValue(playerHand);
	if ((dv < 8) && (pv < 8)) {
		//Evaluate Player Hand 1st
		if (pv < 6) {
			playerHand.push(deck[counter++]);
			pv += playerHand[2].value;
			document.getElementById('playerHand').innerHTML += displayCard(playerHand[2]);
		}
		//If Player has drawn, Banker's rules for drawing
		if ((playerHand.length == 3) && ((dv <= 2) || 
			((dv = 3) && (matchOne(playerHand[2].value, [8]))) || 
			((dv = 4) && (matchOne(playerHand[2].value, [2,3,4,5,6,7])))|| 
			((dv = 5) && (matchOne(playerHand[2].value, [4,5,6,7]))) || 
			((dv = 6) && (matchOne(playerHand[2].value, [6,7]))))) {
				dealerHand.push(deck[counter++]);
				dv += dealerHand[2].value;
				document.getElementById('dealerHand').innerHTML += displayCard(dealerHand[2]);		
		}
		//If Player hasn't drawn,e valuate Banker Hand
		else if ((playerHand.length == 2) && (dv < 6)) {
			dealerHand.push(deck[counter++]);
			dv += dealerHand[2].value;
			document.getElementById('dealerHand').innerHTML += displayCard(dealerHand[2]);
		}
	dv = dv % 10;
	pv = pv % 10; 
}

	$('#playerTotal').html(pv);
	$('#dealerTotal').html(dv);
	
	if ($('#bankerBet').prop('checked'))
		var pw = 'banker';
	else if ($('#playerBet').prop('checked'))
		var pw = 'player';
	else if ($('#egalitieBet').prop('checked'))
		var pw = 'egalitie';
	
	if (dv > pv) {
		$('#result').html('Banker Wins');
		if (pw == 'banker'){ //Dealer bet is selected
			playerCash += parseFloat((1.95 * wager).toFixed(2));
			var pw = 'banker';
		}
	}
	else if (dv < pv) {
		$('#result').html('Player Wins');
		if (pw == 'player') //Dealer bet is selected
			playerCash += 2 * wager;
			var pw = 'player';	
	}
	else {
		if (pw == 'egalitie'){ 
			playerCash += 9 * wager;
			$('#result').html('Egalitie! Tie Bets win');
			var pw = 'egalitie';
		}
		else {
			playerCash += 1 * wager;
			$('#result').html('Egalitie! Bets carry over!');
			$('#bankerBet').prop('disabled',true);	
			$('#playerBet').prop('disabled',true);
			$('#egalitieBet').prop('disabled',true);
			$('#wagerbox').prop('disabled',true);
		}
	}
	$('#playerGold').html(playerCash);	
	if (playerCash < 0.01) {
		$('#result').html('Out of money! Game over.');
		$('#dealbutton').off('click');
		$('#bankerBet').prop('disabled',true);	
		$('#playerBet').prop('disabled',true);
		$('#egalitieBet').prop('disabled',true);
		$('#wagerbox').prop('disabled',true);
		return;	
	}
	if (counter + 7 > deck.length)
		sortDeck();
	else $('#dealbutton').one('click', dealTurn);
	GAMELOG.push(new logEntry(dv, pv, dealerHand, playerHand, pw, wager));
	CASHLOG.push([GAMELOG.length, GAMELOG[GAMELOG.length-1].endCash]);
	drawChart(CASHLOG, 'cashchart');

}
function sortDeck() {
	shuffle(deck);
	$('#dealbutton').html('Shuffle Deck');
	$('#dealbutton').one('click', function() {
		$('#dealerHand').html(displayCard(deck[0]));
		counter=deck[0].value;
		if (counter == 0)
			counter=10;
		$('#result').html('Deck shuffled and first ' + (counter + 1) + ' cards burned');
		$('#dealbutton').html('Deal');	
		$('#dealbutton').one('click', dealTurn);
		$('#bankerBet').prop('disabled',false);	
		$('#playerBet').prop('disabled',false);
		$('#egalitieBet').prop('disabled',false);
		$('#wagerbox').prop('disabled',false);
	});
}


function handValue(h) {
	var total = 0;
	for (var i=0; i< h.length; i++) {
		total += h[i].value;
	}
	return (total % 10);
}
function matchOne(input, arr) {
	for (var i=0; i<arr.length; i++) {
		if (input == arr[i])
			return true;
	}
	return false;
}
function logEntry(dv, pv, dh, ph, playerBet, wager) {
	this.bankValue = dv;
	this.playerValue = pv;
	this.bankHand = dh;
	this.playerHand = ph;
	this.playerBet = playerBet;
	this.wager = wager;
	this.endCash = playerCash;
	
	if (((dv > pv) && (playerBet == 'banker')) /**|| ((pv > dv) && (playerBet == 'player')) || ((pv == dv) && (playerBet == 'egalitie'))*/) {
		this.outcome = 'win'; }
	else if ((dv == pv) && (playerBet != 'egalitie')) {
		this.outcome = 'push';}
	else this.outcome = 'lose';
}



function drawChart(array, canvasID) {
	var w=$('#cashchart').width(), h = $('#cashchart').height();
	drawPlot(canvasID, w, h);
	var xmin=array[0][0], ymin = array[0][1], xmax = array[0][0], ymax = array[0][1];
	for (var i=1; i<array.length; i++) {
		if (array[i][0] > xmax)
			xmax = array[i][0];
		if (array[i][1] > ymax)
			ymax = array[i][1];
	}	
	xmin = 0; ymin = 0; 
	
	var xscale = (w-40)/(xmax-xmin);
	var yscale = (h-40)/(ymax-ymin);
	for (var i=0; i<array.length; i++) {
		ctx.beginPath();
		var x = 30 + ((array[i][0] - xmin) * xscale);
		var y = (h-30) - ((array[i][1]) * yscale);
		ctx.arc(x, y, 5, 0, 2 * Math.PI);
		ctx.fill();
	}

}
function drawPlot(canvas, w, h) {
	ctx = document.getElementById(canvas).getContext('2d')
	ctx.clearRect(0,0,w,h);
	ctx.beginPath();
	ctx.moveTo(20,10);	ctx.lineTo(30,0);	ctx.lineTo(40,10);	ctx.lineTo(20,10);
	ctx.fill();
	ctx.beginPath();
	ctx.lineTo(30,10);	ctx.lineTo(30,h-30);	ctx.lineTo(w-10,h-30);	
	ctx.stroke()
	ctx.beginPath();
	ctx.lineTo(w-10,h-20);	ctx.lineTo(w,h-30);	ctx.lineTo(w-10,h-40);	ctx.lineTo(w-10,h-30);
	ctx.fill();
}



