import React from 'react';
import { View, StyleSheet } from 'react-native';
import ResponsiveTable from '../components/ResponsiveTable';

const ComparisonScreen = () => {
  return (
    <View style={styles.container}>
      <ResponsiveTable />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default ComparisonScreen;
