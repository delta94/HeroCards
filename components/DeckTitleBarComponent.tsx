import React, { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
} from 'react-native';

import Card from '../data/Card';
import FactionGradient from './core/FactionGradient';
import MarvelIcon from '../assets/MarvelIcon';
import typography from '../styles/typography';
import { s, iconSizeScale } from '../styles/space';

interface Props {
  name: string;
  fontScale: number;
  investigator?: Card;
  compact?: boolean;
  button?: ReactNode;
}

export default function DeckTitleBarComponent({
  name,
  investigator,
  compact,
  button,
  fontScale,
}: Props) {
  const hasFactionColor = !!(investigator && investigator.faction_code);
  const faction_code = (investigator && investigator.faction_code) || 'basic';
  const iconName = investigator &&
    (investigator.faction_code === 'basic' ? 'elder_sign' : investigator.faction_code);
  return (
    <FactionGradient
      faction_code={faction_code}
      style={styles.titleBar}
      dark
    >
      { !!iconName && <MarvelIcon name={iconName} size={28 * iconSizeScale * fontScale} color="#FFFFFF" /> }
      <Text
        style={[typography.text, styles.title, { color: hasFactionColor ? '#FFFFFF' : '#000000' }]}
        numberOfLines={compact ? 1 : 2}
        ellipsizeMode="tail"
      >
        { name }
      </Text>
      { !!button && button }
    </FactionGradient>
  );
}


const styles = StyleSheet.create({
  titleBar: {
    width: '100%',
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    marginLeft: s,
    flex: 1,
  },
});
