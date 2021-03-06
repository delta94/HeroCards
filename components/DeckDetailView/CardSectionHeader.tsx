import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableNativeFeedback,
  View,
} from 'react-native';
// @ts-ignore
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';

import { DeckMeta } from '../../actions/types';
import { deckColor } from '../../constants';
import typography from '../../styles/typography';
import { m, s, xs, iconSizeScale } from '../../styles/space';

export interface CardSectionHeaderData {
  superTitle?: string;
  title?: string;
  subTitle?: string;
  placeholder?: boolean;
  onPress?: () => void;
}

interface Props {
  meta?: DeckMeta;
  fontScale: number;
  section: CardSectionHeaderData;
}

export default class CardSectionHeader extends React.Component<Props> {
  renderSuperTitle(
    superTitle: string,
    meta?: DeckMeta,
    noIcon?: boolean
  ) {
    const {
      fontScale,
    } = this.props;
    const SMALL_EDIT_ICON_SIZE = 24 * iconSizeScale * fontScale;
    return (
      <View style={[
        styles.superHeaderRow,
        { backgroundColor: deckColor(meta) },
      ]}>
        <View style={styles.superHeaderPadding}>
          <Text style={[typography.text, styles.superHeaderText]}>
            { superTitle }
          </Text>
        </View>
        { !noIcon && (
          <View style={{ width: SMALL_EDIT_ICON_SIZE, height: SMALL_EDIT_ICON_SIZE }}>
            <MaterialIcons
              name="keyboard-arrow-right"
              color="#FFF"
              size={SMALL_EDIT_ICON_SIZE}
            />
          </View>
        ) }
      </View>
    );
  }

  render() {
    const {
      meta,
      section,
    } = this.props;
    if (section.placeholder) {
      return (
        <View style={styles.placeholder} />
      );
    }
    if (section.superTitle) {
      if (section.onPress) {
        if (Platform.OS === 'ios') {
          return (
            <TouchableOpacity onPress={section.onPress}>
              { this.renderSuperTitle(section.superTitle, meta) }
            </TouchableOpacity>
          );
        }
        return (
          <TouchableNativeFeedback
            onPress={section.onPress}
            useForeground
          >
            { this.renderSuperTitle(section.superTitle, meta) }
          </TouchableNativeFeedback>
        );
      }
      return this.renderSuperTitle(section.superTitle, meta, true);
    }
    if (section.subTitle) {
      return (
        <View style={styles.subHeaderRow}>
          <Text style={typography.text}>
            { section.subTitle }
          </Text>
        </View>
      );
    }

    if (section.title) {
      return (
        <View style={styles.headerRow}>
          <Text style={typography.text}>
            { section.title }
          </Text>
        </View>
      );
    }
    return null;
  }
}

const styles = StyleSheet.create({
  superHeaderText: {
    color: '#FFF',
  },
  placeholder: {
    backgroundColor: '#FFF',
    height: m,
  },
  superHeaderPadding: {
    padding: s,
  },
  superHeaderRow: {
    borderBottomWidth: 1,
    borderColor: '#bdbdbd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subHeaderRow: {
    backgroundColor: '#eee',
    paddingLeft: s,
    paddingRight: s,
    borderBottomWidth: 1,
    borderColor: '#bdbdbd',
  },
  headerRow: {
    backgroundColor: '#ccc',
    paddingLeft: s,
    paddingRight: s,
    paddingTop: xs,
    paddingBottom: xs,
    borderBottomWidth: 1,
    borderColor: '#bdbdbd',
  },
});
