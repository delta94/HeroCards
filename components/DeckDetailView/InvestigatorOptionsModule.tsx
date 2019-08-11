import React from 'react';
import { StyleSheet, View } from 'react-native';
import { map } from 'lodash';

import InvestigatorOption from './InvestigatorOption';
import { DeckMeta } from '../../actions/types';
import Card from '../../data/Card';
import { s } from '../../styles/space';

interface Props {
  investigator: Card;
  meta: DeckMeta;
  setMeta: (key: string, value: string) => void;
}

export default class InvestigatorOptionsModule extends React.Component<Props> {
  render() {
    const { investigator, meta, setMeta } = this.props;
    const options = investigator.heroOptions();
    if (!options.length) {
      return <View style={styles.placeholder} />;
    }
    return (
      <View style={styles.container}>
        { map(options, (option, idx) => {
          return (
            <InvestigatorOption
              key={idx}
              investigator={investigator}
              option={option}
              setMeta={setMeta}
              meta={meta}
            />
          );
        }) }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginLeft: s,
    marginRight: s,
  },
  placeholder: {
    marginBottom: s,
  },
});
