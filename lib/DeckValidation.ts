import { indexOf } from 'lodash';
import { DeckMeta, DeckProblem, DeckProblemType } from '../actions/types';
import Card from '../data/Card';


// Code taken from:
// https://github.com/Kamalisk/MarvelCDB/blob/4c194c54fcbc381e45b93f0f1bcb65a37ae581a9/src/AppBundle/Resources/public/js/app.deck.js
/* eslint-disable */
import { groupBy, mapValues, forEach, find, findKey, filter } from 'lodash';

interface DeckOptionsCount {
  limit: number,
  atleast: {
    [faction_code: string]: number,
  };
}

export default class DeckValidation {
  investigator: Card;
  meta?: DeckMeta;
  problem_list: string[] = [];
  deck_options_counts: DeckOptionsCount[] = [];

  constructor(investigator: Card, meta?: DeckMeta) {
    this.investigator = investigator;
    this.meta = meta;
  }

  getPhysicalDrawDeck(cards: Card[]) {
    return filter(cards, card => card && !card.double_sided);
  }

  getDrawDeck(cards: Card[]) {
    return filter(
      this.getPhysicalDrawDeck(cards),
      card => card
    );
  }

  getDrawDeckSize(cards: Card[]) {
    var draw_deck = this.getDrawDeck(cards);
	  return draw_deck.length;
  }

  getCopiesAndDeckLimit(cards: Card[]) {
    return mapValues(
      groupBy(this.getDrawDeck(cards), card => card ? card.real_name : 'Unknown Card'),
      group => {
        return {
          nb_copies: group.length,
          deck_limit: group[0].deck_limit || 0,
        };
      });
  }

  getProblem(cards: Card[]): DeckProblem | null {
    const reason = this.getProblemHelper(cards);
    if (!reason) {
      return null;
    }
    return {
      reason,
      problems: [...this.problem_list],
    };
  }

  getProblemHelper(cards: Card[]): DeckProblemType | null {
	  // get investigator data
  	var card = this.investigator;
  	var size = 30;
  	// store list of all problems
  	this.problem_list = [];
  	if (card && card.deck_requirements){
  		if (card.deck_requirements.size){
  			size = card.deck_requirements.size;
  		}
  		//console.log(card.deck_requirements);
  		// must have the required cards
  		if (card.deck_requirements.card){
  			var req_count = 0;
  			var req_met_count = 0;
  			forEach(card.deck_requirements.card, possible => {
  				req_count++;
          if (find(cards, theCard =>
            theCard.code === possible.code ||
            find(possible.alternates, alt => alt === theCard.code))) {
            req_met_count++;
          }
  			});
  			if (req_met_count < req_count) {
  				return 'investigator';
  			}
  		}
  	} else {

  	}

  	// too many copies of one card
  	if(findKey(
        this.getCopiesAndDeckLimit(cards),
        value => value.nb_copies > value.deck_limit) != null) {
      return 'too_many_copies';
    }

  	// no invalid card
  	if(this.getInvalidCards(cards).length > 0) {
  		return 'invalid_cards';
  	}

    const investigator = this.investigator;
  	//console.log(investigator);
  	for (var i = 0; i < investigator.deck_options.length; i++) {
  		//console.log(investigator.deck_options);
      const option = investigator.deck_options[i];
      if (!option) {
        continue;
      }
  		if (this.deck_options_counts[i].limit && option.limit){
  			if (this.deck_options_counts[i].limit > option.limit){
  				if (option.error) {
  					this.problem_list.push(option.error);
  				}
  				return 'investigator';
  			}
  		}
      const atleast = option.atleast;
  		if (atleast) {
  			if (atleast.factions && atleast.min){
  				var faction_count = 0;
          forEach(this.deck_options_counts[i].atleast, (value) => {
  					if (value >= atleast.min){
  						faction_count++;
  					}
  				})
  				if (faction_count < atleast.factions){
  					if (option.error){
  						this.problem_list.push(option.error);
  					}
  					return 'investigator';
  				}
  			}
  		}
  	}

    const drawDeckSize = this.getDrawDeckSize(cards);
  		// at least 60 others cards
  	if(drawDeckSize < size) {
  		return 'too_few_cards';
  	}

  	// at least 60 others cards
  	if(drawDeckSize > size) {
  		return 'too_many_cards';
  	}
    return null;
  }

  getInvalidCards(cards: Card[]) {
  	if (this.investigator) {
      this.deck_options_counts = [];
  		for (var i = 0; i < this.investigator.deck_options.length; i++){
  			this.deck_options_counts.push({
          limit: 0,
          atleast: {}
        });
  		}
  	}
  	return filter(cards, card => !this.canIncludeCard(card, true));
  }

  canIncludeCard(card: Card, processDeckCounts: boolean): boolean {
    const investigator = this.investigator;

  	// hide investigators
  	if (card.type_code === 'hero' || card.type_code === 'alter_ego') {
  		return false;
  	}
  	if (card.faction_code === 'encounter') {
  		return false;
  	}

  	// reject cards restricted
  	if (card.restrictions &&
        card.restrictions.investigators &&
        !find(card.restrictions.investigators, code => code === investigator.code)) {
  		return false;
  	}

  	//var investigator = app.data.cards.findById(investigator_code);

  	if (investigator &&
        investigator.deck_options &&
        investigator.deck_options.length) {

  		//console.log(card);
  		for (var i = 0; i < investigator.deck_options.length; i++) {
  			var option = investigator.deck_options[i];
  			//console.log(option);

  			if (option.faction && option.faction.length){
  				// needs to match at least one faction
  				var faction_valid = false;
  				for(var j = 0; j < option.faction.length; j++){
  					var faction = option.faction[j];
  					if (card.faction_code == faction || card.faction2_code == faction){
  						faction_valid = true;
  					}
  				}

  				if (!faction_valid){
  					continue;
  				}
  				//console.log("faction valid");
  			}
        if (option.faction_select && option.faction_select.length) {
          let selected_faction: string = option.faction_select[0]
          if (this.meta &&
            this.meta.faction_selected &&
            indexOf(option.faction_select, this.meta.faction_selected) !== -1
          ) {
            selected_faction = this.meta.faction_selected;
          }
          if (card.faction_code != selected_faction &&
            card.faction2_code != selected_faction){
            continue;
          }
        }

  			if (option.type_code && option.type_code.length){
  				// needs to match at least one faction
  				var type_valid = false;
  				for(var j = 0; j < option.type_code.length; j++){
  					var type = option.type_code[j];
  					if (card.type_code == type){
  						type_valid = true;
  					}
  				}

  				if (!type_valid){
  					continue;
  				}
  				//console.log("faction valid");
  			}

  			if (option.trait && option.trait.length){
  				// needs to match at least one trait
  				var trait_valid = false;

  				for(var j = 0; j < option.trait.length; j++){
  					var trait = option.trait[j];
  					//console.log(card.traits, trait.toUpperCase()+".");

  					if (card.real_traits && card.real_traits.toUpperCase().indexOf(trait.toUpperCase()+".") !== -1){
  						trait_valid = true;
  					}
  				}

  				if (!trait_valid){
  					continue;
  				}
  				//console.log("faction valid");
  			}

  			if (option.uses && option.uses.length){
  				// needs to match at least one trait
  				var uses_valid = false;

  				for(var j = 0; j < option.uses.length; j++){
  					var uses = option.uses[j];
  					//console.log(card.traits, trait.toUpperCase()+".");

  					if (card.real_text && card.real_text.toUpperCase().indexOf(""+uses.toUpperCase()+").") !== -1){
  						uses_valid = true;
  					}
  				}

  				if (!uses_valid){
  					continue;
  				}
  				//console.log("faction valid");
  			}

        if (option.text && option.text.length) {
          var text_valid = false;
          for(var j = 0; j < option.text.length; j++){
            var text = option.text[j];
            if (card.real_text && card.real_text.toLowerCase().match(text)){
              text_valid = true;
  					}
          }
          if (!text_valid) {
            continue;
          }
        }

  			if (option.level){
  				// needs to match at least one faction
  				var level_valid = false;
  				//console.log(option.level, card.xp, card.xp >= option.level.min, card.xp <= option.level.max);
  			}

  			if (option.not){
  				return false;
  			} else {
  				if (processDeckCounts && option.limit){
  					this.deck_options_counts[i].limit += 1;
  				}
  				if (processDeckCounts && option.atleast && card.faction_code) {
  					if (!this.deck_options_counts[i].atleast[card.faction_code]) {
  						this.deck_options_counts[i].atleast[card.faction_code] = 0;
  					}
  					this.deck_options_counts[i].atleast[card.faction_code] += 1;

            if (card.faction2_code){
              if (!this.deck_options_counts[i].atleast[card.faction2_code]){
				        this.deck_options_counts[i].atleast[card.faction2_code] = 0;
              }
              this.deck_options_counts[i].atleast[card.faction2_code] += 1;
  					}
  				}
  				return true;
  			}
  		}
  	}

  	return false;
  }
}
