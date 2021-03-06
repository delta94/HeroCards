import React from 'react';
import { ActivityIndicator, Platform, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { throttle } from 'lodash';
import { bindActionCreators, Action, Dispatch } from 'redux';
import { connect } from 'react-redux';
import DialogComponent from 'react-native-dialog';
import { NetInfoStateType } from '@react-native-community/netinfo';
import { t } from 'ttag';

import withPlayerCards, { PlayerCardProps } from '../withPlayerCards';
import { showDeckModal } from '../navHelper';
import Dialog from '../core/Dialog';
import withNetworkStatus, { NetworkStatusProps } from '../core/withNetworkStatus';
import { saveClonedDeck } from '../decks/actions';
import { login } from '../../actions';
import { Deck } from '../../actions/types';
import { getDeck, getBaseDeck, getLatestDeck, AppState } from '../../reducers';
import typography from '../../styles/typography';
import space, { s } from '../../styles/space';
import { COLORS } from '../../styles/colors';

interface OwnProps {
  componentId: string;
  toggleVisible: () => void;
  deckId?: number;
  viewRef?: View;
  signedIn?: boolean;
}

interface ReduxProps {
  deck?: Deck;
  baseDeck?: Deck;
  latestDeck?: Deck;
}

interface ReduxActionProps {
  login: () => void;
  saveClonedDeck: (local: boolean, cloneDeck: Deck, deckName: string) => Promise<Deck>;
}

type Props = OwnProps & ReduxProps & ReduxActionProps & PlayerCardProps & NetworkStatusProps;

interface State {
  saving: boolean;
  deckName: string | null;
  offlineDeck: boolean;
  selectedDeckId?: number;
  error: string | null;
}

class CopyDeckDialog extends React.Component<Props, State> {
  _textInputRef: View | null = null;
  _onOkayPress!: () => void;
  constructor(props: Props) {
    super(props);

    this.state = {
      saving: false,
      deckName: null,
      offlineDeck: !!(props.deck && props.deck.local),
      selectedDeckId: props.deckId,
      error: null,
    };

    this._onOkayPress = throttle(this.onOkayPress.bind(this, false), 200);
  }

  componentDidUpdate(prevProps: Props) {
    const {
      deckId,
    } = this.props;
    if (deckId && deckId !== prevProps.deckId) {
      this.resetForm();
    }
  }

  _onDeckTypeChange = (value: boolean) => {
    const {
      signedIn,
      login,
    } = this.props;
    if (value && !signedIn) {
      login();
    }
    this.setState({
      offlineDeck: !value,
    });
  };

  _onDeckNameChange = (value: string) => {
    this.setState({
      deckName: value,
    });
  };

  _selectedDeckIdChanged = (deckId: number, value: boolean) => {
    if (value) {
      this.setState({
        selectedDeckId: deckId,
      });
    } else {
      this.setState({
        selectedDeckId: undefined,
      });
    }
  };

  _captureTextInputRef = (ref: View) => {
    this._textInputRef = ref;
  };

  resetForm() {
    const {
      deckId,
      deck,
    } = this.props;
    this.setState({
      saving: false,
      selectedDeckId: deckId,
      deckName: deck ? deck.name : null,
    });
  }

  _showNewDeck = (deck: Deck) => {
    const {
      componentId,
      toggleVisible,
    } = this.props;
    const hero = this.hero();
    this.setState({
      saving: false,
    });
    if (Platform.OS === 'android') {
      toggleVisible();
    }
    // Change the deck options for required cards, if present.
    showDeckModal(componentId, deck, hero);
  };

  selectedDeck(): Deck | undefined {
    const {
      baseDeck,
      deck,
      latestDeck,
    } = this.props;
    const {
      selectedDeckId,
    } = this.state;

    if (baseDeck && baseDeck.id === selectedDeckId) {
      return baseDeck;
    }
    if (latestDeck && latestDeck.id === selectedDeckId) {
      return latestDeck;
    }
    return deck;
  }

  onOkayPress(isRetry: boolean) {
    const {
      signedIn,
      isConnected,
      networkType,
      saveClonedDeck,
    } = this.props;
    const {
      deckName,
      offlineDeck,
    } = this.state;
    const cloneDeck = this.selectedDeck();
    if (!cloneDeck) {
      return;
    }
    const hero = this.hero();
    if (hero && (!this.state.saving || isRetry)) {
      this.setState({
        saving: true,
      });
      const local = (offlineDeck || !signedIn || !isConnected || networkType === NetInfoStateType.none);
      saveClonedDeck(
        local,
        cloneDeck,
        deckName || t`New Deck`
      ).then(
        this._showNewDeck,
        (err) => {
          this.setState({
            saving: false,
            error: err.message,
          });
        }
      );
    }
  }

  hero() {
    const {
      deck,
      heroes,
    } = this.props;
    return deck && heroes[deck.investigator_code];
  }

  renderFormContent() {
    const {
      signedIn,
      networkType,
      isConnected,
      refreshNetworkStatus,
    } = this.props;
    const {
      saving,
      deckName,
      offlineDeck,
      error,
    } = this.state;
    if (saving) {
      return (
        <ActivityIndicator
          style={styles.spinner}
          size="large"
          animating
        />
      );
    }
    return (
      <React.Fragment>
        <DialogComponent.Description style={[typography.dialogLabel, space.marginBottomS]}>
          { t`New Name` }
        </DialogComponent.Description>
        <DialogComponent.Input
          textInputRef={this._captureTextInputRef}
          value={deckName || ''}
          placeholder={t`Required`}
          onChangeText={this._onDeckNameChange}
          returnKeyType="done"
        />
        <DialogComponent.Description style={[typography.dialogLabel, space.marginBottomS]}>
          { t`Deck Type` }
        </DialogComponent.Description>
        <DialogComponent.Switch
          label={t`Create on MarvelCDB`}
          value={!offlineDeck && signedIn && isConnected && networkType !== NetInfoStateType.none}
          disabled={!isConnected || networkType === NetInfoStateType.none}
          onValueChange={this._onDeckTypeChange}
          trackColor={COLORS.switchTrackColor}
        />
        { (!isConnected || networkType === NetInfoStateType.none) && (
          <TouchableOpacity onPress={refreshNetworkStatus}>
            <DialogComponent.Description style={[typography.small, { color: COLORS.red }, space.marginBottomS]}>
              { t`You seem to be offline. Refresh Network?` }
            </DialogComponent.Description>
          </TouchableOpacity>
        ) }
        { !!error && (
          <Text style={[typography.text, typography.center, styles.error]}>
            { error }
          </Text>
        ) }
      </React.Fragment>
    );
  }

  render() {
    const {
      toggleVisible,
      viewRef,
      deckId,
    } = this.props;
    const {
      saving,
      selectedDeckId,
    } = this.state;
    const hero = this.hero();
    if (!hero) {
      return null;
    }
    const okDisabled = saving || selectedDeckId === null;
    return (
      <Dialog
        title={t`Copy Deck`}
        visible={!!deckId}
        viewRef={viewRef}
      >
        <DialogComponent.Description
          style={[styles.descriptionMargin, saving ? typography.center : typography.left]}
        >
          { saving ?
            t`Saving` :
            t`Make a copy of a deck so you can make different changes.`
          }
        </DialogComponent.Description>
        { this.renderFormContent() }
        <DialogComponent.Button
          label={t`Cancel`}
          onPress={toggleVisible}
        />
        <DialogComponent.Button
          label={t`Okay`}
          color={okDisabled ? COLORS.darkGray : COLORS.lightBlue}
          disabled={okDisabled}
          onPress={this._onOkayPress}
        />
      </Dialog>
    );
  }
}

function mapStateToProps(state: AppState, props: OwnProps & PlayerCardProps): ReduxProps {
  if (!props.deckId) {
    return {};
  }
  const deck = getDeck(state, props.deckId);
  let baseDeck: Deck | undefined = getBaseDeck(state, props.deckId);
  if (baseDeck && baseDeck.id === props.deckId) {
    baseDeck = undefined;
  }
  let latestDeck: Deck | undefined = getLatestDeck(state, props.deckId);
  if (latestDeck && latestDeck.id === props.deckId) {
    latestDeck = undefined;
  }
  return {
    deck: deck || undefined,
    baseDeck,
    latestDeck,
  };
}

function mapDispatchToProps(dispatch: Dispatch<Action>): ReduxActionProps {
  return bindActionCreators({
    saveClonedDeck,
    login,
  } as any, dispatch);
}

export default withPlayerCards<OwnProps>(
  connect<ReduxProps, ReduxActionProps, OwnProps & PlayerCardProps, AppState>(
    mapStateToProps,
    mapDispatchToProps
  )(
    withNetworkStatus(CopyDeckDialog)
  )
);

const styles = StyleSheet.create({
  spinner: {
    height: 80,
  },
  descriptionMargin: {
    marginLeft: 8,
    marginRight: 8,
  },
  error: {
    color: 'red',
    marginBottom: s,
  },
});
