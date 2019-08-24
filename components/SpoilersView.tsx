import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { bindActionCreators, Dispatch, Action } from 'redux';
import { connect } from 'react-redux';

import { Pack } from '../actions/types';
import { setPackSpoiler } from '../actions';
import PackListComponent from './PackListComponent';
import { getAllPacks, getPackSpoilers, AppState } from '../reducers';
import { NavigationProps } from './types';

interface ReduxProps {
  packs: Pack[];
  show_spoilers: { [pack_code: string]: boolean };
}

interface ReduxActionProps {
  setPackSpoiler: (code: string, value: boolean) => void;
}

type Props = NavigationProps & ReduxProps & ReduxActionProps;

class SpoilersView extends React.Component<Props> {
  _renderHeader = (): React.ReactElement => {
    return (
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Mark the scenarios you've played through to make the results start
          showing up in search results.
        </Text>
      </View>
    );
  };

  render() {
    const {
      componentId,
      packs,
      show_spoilers,
      setPackSpoiler,
    } = this.props;
    if (!packs.length) {
      return (
        <View>
          <Text>Loading</Text>
        </View>
      );
    }
    return (
      <PackListComponent
        componentId={componentId}
        packs={packs}
        renderHeader={this._renderHeader}
        checkState={show_spoilers}
        setChecked={setPackSpoiler}
      />
    );
  }
}

function mapStateToProps(state: AppState): ReduxProps {
  return {
    packs: getAllPacks(state),
    show_spoilers: getPackSpoilers(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<Action>): ReduxActionProps {
  return bindActionCreators({
    setPackSpoiler,
  }, dispatch);
}

export default connect<ReduxProps, ReduxActionProps, NavigationProps, AppState>(
  mapStateToProps,
  mapDispatchToProps
)(SpoilersView);

const styles = StyleSheet.create({
  header: {
    padding: 8,
  },
  headerText: {
    fontFamily: 'System',
    fontSize: 14,
  },
});
