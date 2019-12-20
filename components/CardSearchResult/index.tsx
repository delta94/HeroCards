import React, { ReactNode } from 'react';
import { flatMap, map, range } from 'lodash';
import {
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import MarvelIcon from '../../assets/MarvelIcon';
import CardCostIcon, { costIconSize } from '../core/CardCostIcon';
import Switch from '../core/Switch';
import Card from '../../data/Card';
import { createFactionIcons, FACTION_COLORS, RESOURCES, ResourceCodeType } from '../../constants';
import { COLORS } from '../../styles/colors';
import { rowHeight, iconSize, toggleButtonMode, buttonWidth } from './constants';
import CardQuantityComponent from './CardQuantityComponent';
import typography from '../../styles/typography';
import { isBig, s, xs } from '../../styles/space';

const FACTION_ICONS = createFactionIcons();

interface Props {
  card: Card;
  fontScale: number;
  id?: string;
  count?: number;
  onPress?: (card: Card) => void;
  onPressId?: (code: string, card: Card) => void;
  onDeckCountChange?: (code: string, count: number) => void;
  limit?: number;
  onToggleChange?: () => void;
  toggleValue?: boolean;
  deltaCountMode?: boolean;
  hasSecondCore?: boolean;
  showZeroCount?: boolean;
}

export default class CardSearchResult extends React.PureComponent<Props> {
  _onPress = () => {
    const {
      id,
      onPress,
      onPressId,
      card,
    } = this.props;
    Keyboard.dismiss();
    if (id && onPressId) {
      onPressId(id, card);
    } else {
      onPress && onPress(card);
    }
  };

  _onDeckCountChange = (count: number) => {
    const {
      onDeckCountChange,
      card,
    } = this.props;
    onDeckCountChange && onDeckCountChange(card.code, count);
  };

  _renderCountButton = (count: number) => {
    return count;
  };

  renderFactionIcon(card: Card, size: number): ReactNode {
    const { fontScale } = this.props;
    const SMALL_ICON_SIZE = (isBig ? 38 : 26) * fontScale;

    if (card.isEncounterCard()) {
      // Encounter Icon?
      return null;
    }
    const ICON_SIZE = iconSize(fontScale);
    if (card.faction2_code) {
      const icon = FACTION_ICONS.dual;
      return !!icon && icon(size === ICON_SIZE ? ICON_SIZE : SMALL_ICON_SIZE);
    }
    return (
      <MarvelIcon
        name="special"
        size={ICON_SIZE}
        color="#222"
      />
    );
  }

  static cardCost(card: Card): string {
    if (card.type_code === 'resource') {
      return '';
    }
    if (card.double_sided) {
      return '-';
    }
    return `${card.cost !== null ? card.cost : 'X'}`;
  }

  renderIcon(card: Card): ReactNode {
    const { fontScale } = this.props;
    if (card.hidden && card.linked_card) {
      return this.renderIcon(card.linked_card);
    }

    const showCost = card.type_code === 'ally' ||
      card.type_code === 'event' ||
      card.type_code === 'resource' ||
      card.type_code === 'upgrade' ||
      card.type_code === 'support';

    if (showCost) {
      return (
        <View style={[styles.factionIcon, {
          width: costIconSize(fontScale),
          height: costIconSize(fontScale),
        }]}>
          <CardCostIcon
            card={card}
            fontScale={fontScale}
          />
        </View>
      );
    }
    return (
      <View style={[styles.factionIcon, {
        width: costIconSize(fontScale),
        height: costIconSize(fontScale),
      }]}>
        { this.renderFactionIcon(card, iconSize(fontScale)) }
      </View>
    );
  }

  static resourceIcon(
    fontScale: number,
    resource: ResourceCodeType,
    count: number
  ): ReactNode[] {
    if (count === 0) {
      return [];
    }
    const RESOURCE_ICON_SIZE = (isBig ? 26 : 16) * fontScale;
    return map(range(0, count), key => (
      <View key={`${resource}-${key}`} style={styles.resourceIcon}>
        <MarvelIcon
          name={resource}
          size={RESOURCE_ICON_SIZE}
          color="#444"
        />
      </View>
    ));
  }

  renderDualFactionIcons() {
    const {
      card,
      fontScale,
    } = this.props;
    if (!card.faction2_code) {
      return null;
    }
    const SKILL_ICON_SIZE = (isBig ? 26 : 16) * fontScale;
    return (
      <View style={styles.dualFactionIcons}>
        <View style={styles.resourceIcon}>
          <MarvelIcon
            name={card.factionCode()}
            size={SKILL_ICON_SIZE}
            color={FACTION_COLORS[card.factionCode()]}
          />
        </View>
        <View style={styles.resourceIcon}>
          <MarvelIcon
            name={card.faction2_code}
            size={SKILL_ICON_SIZE}
            color={FACTION_COLORS[card.faction2_code]}
          />
        </View>
      </View>
    );
  }

  renderSkillIcons() {
    const {
      card,
      fontScale,
    } = this.props;
    if (card.type_code === 'hero' || (
      card.resource_wild === null &&
      card.resource_energy === null &&
      card.resource_mental === null &&
      card.resource_physical === null)) {
      return null;
    }
    return (
      <View style={styles.skillIcons}>
        { flatMap(RESOURCES, (resource: ResourceCodeType) =>
          CardSearchResult.resourceIcon(fontScale, resource, card.resourceCount(resource))) }
      </View>
    );
  }

  renderCardName() {
    const {
      card,
      fontScale,
    } = this.props;
    const color = card.faction2_code ?
      FACTION_COLORS.dual :
      (FACTION_COLORS[card.factionCode()] || '#000000');
    return (
      <View style={styles.cardNameBlock}>
        <View style={styles.row}>
          <Text style={[typography.text, { color }]} numberOfLines={1} ellipsizeMode="clip">
            { card.renderName }
          </Text>
          { !!card.is_unique && <MarvelIcon name="unique" color={color} size={16 * (isBig ? 1.2 : 1) * fontScale} /> }
        </View>
        <View style={styles.row}>
          { this.renderSkillIcons() }
          { !!card.renderSubname && (
            <View style={styles.row}>
              <Text style={[typography.small, styles.subname, { color }]} numberOfLines={1} ellipsizeMode="clip">
                { card.renderSubname }
              </Text>
            </View>
          ) }
          { this.renderDualFactionIcons() }
        </View>
      </View>
    );
  }

  countText(count: number) {
    const {
      deltaCountMode,
    } = this.props;
    if (deltaCountMode) {
      if (count > 0) {
        return `+${count}`;
      }
      return `${count}`;
    }
    return `×${count}`;
  }

  renderCount() {
    const {
      card,
      count = 0,
      onDeckCountChange,
      limit,
      hasSecondCore,
      showZeroCount,
      fontScale,
    } = this.props;
    if (onDeckCountChange) {
      const deck_limit: number = Math.min(
        card.pack_code === 'core' ?
          ((card.quantity || 0) * (hasSecondCore ? 2 : 1)) :
          (card.deck_limit || 0),
        card.deck_limit || 0
      );
      return (
        <CardQuantityComponent
          fontScale={fontScale}
          count={count || 0}
          limit={Math.max(count || 0, typeof limit === 'number' ? limit : deck_limit)}
          countChanged={this._onDeckCountChange}
          showZeroCount={showZeroCount}
        />
      );
    }
    if (count !== 0) {
      return (
        <View style={styles.countText}>
          <Text style={typography.text}>
            { this.countText(count) }
          </Text>
        </View>
      );
    }
    return null;
  }

  renderContent() {
    const {
      card,
      onToggleChange,
      toggleValue,
      onPress,
      onPressId,
      onDeckCountChange,
      fontScale,
    } = this.props;
    return (
      <View style={[styles.rowContainer, { minHeight: rowHeight(fontScale) }]}>
        <TouchableOpacity
          onPress={this._onPress}
          disabled={!onPress && !onPressId}
          style={[styles.row, styles.fullHeight]}
        >
          <View style={[
            styles.cardTextRow,
            onDeckCountChange && toggleButtonMode(fontScale) ?
              { paddingRight: buttonWidth(fontScale) } :
              {},
          ]}>
            { this.renderIcon(card) }
            { this.renderCardName() }
          </View>
        </TouchableOpacity>
        { this.renderCount() }
        { !!onToggleChange && (
          <View style={styles.switchButton}>
            <Switch
              value={toggleValue}
              onValueChange={onToggleChange}
            />
          </View>
        ) }
      </View>
    );
  }

  render() {
    const {
      card,
      fontScale,
    } = this.props;
    if (!card) {
      return (
        <View style={[styles.rowContainer, { minHeight: rowHeight(fontScale) }]}>
          <View style={styles.cardNameBlock}>
            <View style={styles.row}>
              <Text style={typography.text}>
                Unknown Card
              </Text>
            </View>
          </View>
        </View>
      );
    }
    if (!card.name) {
      return (
        <View style={[styles.rowContainer, { minHeight: rowHeight(fontScale) }]}>
          <Text>No Text</Text>;
        </View>
      );
    }

    return this.renderContent();
  }
}

const styles = StyleSheet.create({
  rowContainer: {
    backgroundColor: '#FFF',
    position: 'relative',
    width: '100%',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: COLORS.gray,
  },
  cardNameBlock: {
    marginLeft: 4,
    marginTop: 4,
    marginBottom: 4,
    marginRight: 2,
    flexDirection: 'column',
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  fullHeight: {
  },
  skillIcons: {
    flexDirection: 'row',
  },
  dualFactionIcons: {
    marginLeft: 8,
    flexDirection: 'row',
  },
  resourceIcon: {
    marginRight: 2,
  },
  subname: {
    marginRight: s,
  },
  factionIcon: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: xs,
  },
  cardTextRow: {
    flex: 2,
    flexDirection: 'row',
    paddingLeft: s,
    alignItems: 'center',
  },
  switchButton: {
    marginTop: 6,
    marginRight: 6,
  },
  countText: {
    marginRight: s,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
