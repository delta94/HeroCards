import React from 'react';
import { StyleSheet } from 'react-native';
import { map } from 'lodash';
import { SettingsPicker } from 'react-native-settings-components';
import { t } from 'ttag';

import { FactionCodeType, FACTION_COLORS } from '../../constants';
import Card from '../../data/Card';
import { COLORS } from '../../styles/colors';

interface Props {
  name: string;
  factions: FactionCodeType[];
  selection?: FactionCodeType;
  onChange: (faction: FactionCodeType) => void;
  investigatorFaction?: FactionCodeType;
}

export default class FactionSelectPicker extends React.Component<Props> {
  ref?: SettingsPicker<FactionCodeType>;

  _captureRef = (ref: SettingsPicker<FactionCodeType>) => {
    this.ref = ref;
  };

  _onChange = (selection: FactionCodeType) => {
    this.ref && this.ref.closeModal();
    const {
      onChange,
    } = this.props;
    onChange(selection);
  };

  _codeToLabel = (faction: string) => {
    return Card.factionCodeToName(faction, t`Select Faction`);
  };

  render() {
    const {
      factions,
      selection,
      name,
      investigatorFaction,
    } = this.props;
    const options = map(factions, faction => {
      return {
        label: this._codeToLabel(faction),
        value: faction,
      };
    });
    const color = investigatorFaction ?
      FACTION_COLORS[investigatorFaction] :
      COLORS.lightBlue;
    return (
      <SettingsPicker
        ref={this._captureRef}
        title={name}
        value={selection}
        valueFormat={this._codeToLabel}
        onValueChange={this._onChange}
        containerStyle={styles.container}
        titleStyle={styles.title}
        valueStyle={styles.value}
        modalStyle={{
          header: {
            wrapper: {
              backgroundColor: color,
            },
            description: {
              paddingTop: 8,
            },
          },
          list: {
            itemColor: color,
          },
        }}
        options={options}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  title: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  value: {
    paddingLeft: 0,
    paddingRight: 0,
  },
});
