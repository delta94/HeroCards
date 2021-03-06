import { forEach } from 'lodash';
import { Results } from 'realm';
import { connectRealm, CardResults } from 'react-native-realm';
import hoistNonReactStatic from 'hoist-non-react-statics';

import Card, { CardsMap } from '../data/Card';
import FaqEntry from '../data/FaqEntry';

export interface PlayerCardProps {
  realm: Realm;
  cards: CardsMap;
  heroes: CardsMap;
}

export default function withPlayerCards<Props, ExtraProps={}>(
  WrappedComponent: React.ComponentType<Props & PlayerCardProps & ExtraProps>,
  computeExtraProps?: (cards: Results<Card>) => ExtraProps
): React.ComponentType<Props> {

  // @ts-ignore TS2345
  const result = connectRealm<Props, PlayerCardProps & ExtraProps, Card, FaqEntry>(
    WrappedComponent, {
      schemas: ['Card'],
      mapToProps(
        results: CardResults<Card>,
        realm: Realm
      ): PlayerCardProps & ExtraProps {
        const playerCards = results.cards.filtered(
          `(type_code == "hero" OR deck_limit > 0)`
        );
        const heroes: CardsMap = {};
        const cards: CardsMap = {};
        forEach(
          playerCards,
          card => {
            cards[card.code] = card;
            if (card.type_code === 'hero') {
              heroes[card.code] = card;
            }
          });
        const playerCardProps: PlayerCardProps = {
          realm,
          cards,
          heroes,
        };
        const extraProps: ExtraProps = computeExtraProps ?
          computeExtraProps(playerCards) :
          ({} as ExtraProps);
        return {
          ...extraProps,
          ...playerCardProps,
        };
      },
    });
  hoistNonReactStatic(result, WrappedComponent);
  return result as React.ComponentType<Props>;
}
