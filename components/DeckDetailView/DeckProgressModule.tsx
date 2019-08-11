import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { bindActionCreators, Dispatch, Action } from 'redux';
import { connect } from 'react-redux';

import ChangesFromPreviousDeck from './ChangesFromPreviousDeck';
import DeckDelta from './DeckDelta';
import EditTraumaComponent from '../campaign/EditTraumaComponent';
import CampaignSummaryComponent from '../campaign/CampaignSummaryComponent';
import { ParsedDeck } from '../parseDeck';
import { t } from 'ttag';
import { fetchPublicDeck, fetchPrivateDeck } from '../decks/actions';
import { Campaign, Deck, Trauma } from '../../actions/types';
import Card, { CardsMap } from '../../data/Card';
import { getDeck, AppState } from '../../reducers';
import typography from '../../styles/typography';
import space, { l, m, s } from '../../styles/space';

interface OwnProps {
  componentId: string;
  deck: Deck;
  cards: CardsMap;
  parsedDeck: ParsedDeck;
  isPrivate: boolean;
  campaign?: Campaign;
  showTraumaDialog: (investigator: Card, traumaData: Trauma) => void;
  investigatorDataUpdates: any;
  xpAdjustment: number;
}

interface ReduxProps {
  previousDeck?: Deck;
}

interface ReduxActionProps {
  fetchPrivateDeck: (deckId: number) => void;
  fetchPublicDeck: (deckId: number, useDeckEndpoint: boolean) => void;
}

type Props = OwnProps & ReduxProps & ReduxActionProps;

class DeckProgressModule extends React.PureComponent<Props> {
  componentDidMount() {
    const {
      deck,
      previousDeck,
      fetchPublicDeck,
      fetchPrivateDeck,
      isPrivate,
    } = this.props;
    if (deck.previous_deck && !previousDeck) {
      if (isPrivate) {
        fetchPrivateDeck(deck.previous_deck);
      } else {
        fetchPublicDeck(deck.previous_deck, true);
      }
    }
  }

  investigatorData() {
    const {
      campaign,
      investigatorDataUpdates,
    } = this.props;
    if (!campaign) {
      return null;
    }
    return Object.assign(
      {},
      campaign.investigatorData || {},
      investigatorDataUpdates
    );
  }


  renderCampaignSection() {
    const {
      campaign,
      parsedDeck: {
        investigator,
      },
      showTraumaDialog,
    } = this.props;
    if (!campaign) {
      return null;
    }
    return (
      <React.Fragment>
        <View style={styles.title}>
          <Text style={typography.smallLabel}>
            { t`CAMPAIGN PROGRESS` }
          </Text>
        </View>
        <View style={styles.campaign}>
          <Text style={[typography.text, space.marginBottomS]}>
            { campaign.name }
          </Text>
          <View style={space.marginBottomM}>
            <CampaignSummaryComponent campaign={campaign} hideScenario />
          </View>
          <EditTraumaComponent
            investigator={investigator}
            investigatorData={this.investigatorData()}
            showTraumaDialog={showTraumaDialog}
          />
        </View>
      </React.Fragment>
    );
  }

  render() {
    const {
      campaign,
      componentId,
      deck,
      cards,
      parsedDeck,
      xpAdjustment,
    } = this.props;

    if (!deck.previous_deck && !deck.next_deck && !campaign) {
      return null;
    }

    // Actually compute the diffs.
    return (
      <View style={styles.container}>
        <ChangesFromPreviousDeck
          componentId={componentId}
          cards={cards}
          parsedDeck={parsedDeck}
          xpAdjustment={xpAdjustment}
        />
        { (!!deck.previous_deck || !!deck.next_deck) && (
          <DeckDelta
            componentId={componentId}
            parsedDeck={parsedDeck}
            xpAdjustment={xpAdjustment}
          />
        ) }
        { this.renderCampaignSection() }
      </View>
    );
  }
}

function mapStateToProps(state: AppState, props: OwnProps): ReduxProps {
  if (props.deck && props.deck.previous_deck) {
    return {
      previousDeck: getDeck(state, props.deck.previous_deck) || undefined,
    };
  }
  return {};
}

function mapDispatchToProps(dispatch: Dispatch<Action>): ReduxActionProps {
  return bindActionCreators({
    fetchPublicDeck,
    fetchPrivateDeck,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeckProgressModule);


const styles = StyleSheet.create({
  container: {
    marginTop: m,
    marginBottom: l,
  },
  campaign: {
    marginTop: s,
    marginLeft: s,
    marginRight: s,
  },
  title: {
    marginTop: m,
    paddingLeft: s,
    paddingRight: s,
    borderBottomWidth: 1,
    borderColor: '#bdbdbd',
  },
});
