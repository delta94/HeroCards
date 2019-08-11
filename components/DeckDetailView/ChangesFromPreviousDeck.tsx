import React from 'react';
import { keys, map, sortBy } from 'lodash';

import { t } from 'ttag';
import { Slots } from '../../actions/types';
import { showCard } from '../navHelper';
import { ParsedDeck } from '../parseDeck';
import CardSearchResult from '../CardSearchResult';
import CardSectionHeader from './CardSectionHeader';
import Card, { CardsMap } from '../../data/Card';

interface Props {
  componentId: string;
  cards: CardsMap;
  parsedDeck: ParsedDeck;
  xpAdjustment: number;
}

export default class ChangesFromPreviousDeck extends React.Component<Props> {
  _showCard = (card: Card) => {
    showCard(this.props.componentId, card.code, card, true);
  };

  renderSection(slots: Slots, id: string, title: string) {
    const {
      cards,
      parsedDeck: {
        investigator,
      },
    } = this.props;
    if (!keys(slots).length) {
      return null;
    }
    const sortedCards = sortBy(
      sortBy(
        map(keys(slots), code => cards[code]),
        card => card.xp || 0),
      card => card.name
    );
    return (
      <React.Fragment>
        <CardSectionHeader
          investigator={investigator}
          section={{ title }}
        />
        { map(sortedCards, card => (
          <CardSearchResult
            key={`${id}-${card.code}`}
            onPress={this._showCard}
            card={card}
            count={slots[card.code]}
            deltaCountMode
          />
        )) }
      </React.Fragment>
    );
  }

  render() {
    const {
      parsedDeck: {
        investigator,
        changes,
      },
    } = this.props;
    if (!changes) {
      return null;
    }

    return (
      <React.Fragment>
        <CardSectionHeader
          investigator={investigator}
          section={{ superTitle: t`Changes from previous deck` }}
        />
        { this.renderSection(changes.upgraded, 'upgrade', t`Upgraded cards`) }
        { this.renderSection(changes.added, 'added', t`Added cards`) }
        { this.renderSection(changes.removed, 'removed', t`Removed cards`) }
        { this.renderSection(changes.exiled, 'exiled', t`Exiled cards`) }
      </React.Fragment>
    );
  }
}
