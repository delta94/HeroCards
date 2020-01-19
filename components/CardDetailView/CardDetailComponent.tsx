import React from 'react';
import {
  Button as BasicButton,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Navigation } from 'react-native-navigation';

import { t } from 'ttag';
import typography from '../../styles/typography';
import AppIcon from '../../assets/AppIcon';
import Button from '../core/Button';
import Card from '../../data/Card';
import TwoSidedCardComponent from './TwoSidedCardComponent';
import SignatureCardsComponent from './SignatureCardsComponent';

interface Props {
  componentId: string;
  card: Card;
  width: number;
  fontScale: number;
  showSpoilers: boolean;
  toggleShowSpoilers?: (code: string) => void;
  showInvestigatorCards?: (code: string) => void;
}

export default class CardDetailComponent extends React.Component<Props> {
  _editSpoilersPressed = () => {
    const { componentId } = this.props;
    if (componentId) {
      Navigation.push<{}>(componentId, {
        component: {
          name: 'My.Spoilers',
        },
      });
    }
  };

  shouldBlur() {
    const {
      showSpoilers,
      card,
    } = this.props;
    if (showSpoilers) {
      return false;
    }
    return card && card.spoiler;
  }

  _showInvestigatorCards = () => {
    const {
      card,
      showInvestigatorCards,
    } = this.props;
    showInvestigatorCards && showInvestigatorCards(card.code);
  };

  renderInvestigatorCardsLink() {
    const {
      componentId,
      card,
      width,
      fontScale,
    } = this.props;
    if (!card || card.type_code !== 'hero') {
      return null;
    }
    return (
      <View style={styles.investigatorContent}>      
        <SignatureCardsComponent
          componentId={componentId}
          investigator={card}
          width={width}
          fontScale={fontScale}
        />
      </View>
    );
  }

  _toggleShowSpoilers = () => {
    const {
      card,
      toggleShowSpoilers,
    } = this.props;
    toggleShowSpoilers && toggleShowSpoilers(card.code);
  };

  render() {
    const {
      componentId,
      card,
      width,
      fontScale,
    } = this.props;
    if (this.shouldBlur()) {
      return (
        <View key={card.code} style={[styles.viewContainer, { width }]}>
          <Text style={styles.spoilerText}>
            { t`Warning: this card contains possible spoilers for '${ card.pack_name }'.` }
          </Text>
          <View style={styles.basicButtonContainer}>
            <BasicButton onPress={this._toggleShowSpoilers} title="Show card" />
          </View>
          <View style={styles.basicButtonContainer}>
            <BasicButton onPress={this._editSpoilersPressed} title="Edit my spoiler settings" />
          </View>
        </View>
      );
    }
    return (
      <View key={card.code} style={[styles.viewContainer, { width }]}>
        <TwoSidedCardComponent
          componentId={componentId}
          card={card}
          width={width}
          fontScale={fontScale}
        />
        { this.renderInvestigatorCardsLink() }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewContainer: {
    backgroundColor: 'white',
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttonContainer: {
    marginLeft: 8,
    marginTop: 4,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  basicButtonContainer: {
    marginLeft: 8,
    marginTop: 4,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginTop: 24,
    paddingLeft: 8,
  },
  spoilerText: {
    margin: 8,
  },
  investigatorContent: {
    width: '100%',
    maxWidth: 768,
  },
});
