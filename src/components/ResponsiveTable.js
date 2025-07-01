import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ResponsiveTable = ({ data = null, title = 'PlayStation Plus – Vergleich' }) => {
  // Default static data for PlayStation Plus comparison table
  const defaultData = [
    {
      feature: 'Online-Multiplayer',
      essential: '✔️',
      extra: '✔️',
      premium: '✔️',
    },
    {
      feature: 'Monatliche Spiele',
      essential: '✔️',
      extra: '✔️',
      premium: '✔️',
    },
    {
      feature: 'Cloud-Speicher',
      essential: '✔️',
      extra: '✔️',
      premium: '✔️',
    },
    {
      feature: 'Spielekatalog (PS4/PS5)',
      essential: '❌',
      extra: '✔️',
      premium: '✔️',
    },
    {
      feature: 'Klassiker-Katalog (PS1, PS2, PSP)',
      essential: '❌',
      extra: '❌',
      premium: '✔️',
    },
    {
      feature: 'Cloud-Streaming (PS3/andere)',
      essential: '❌',
      extra: '❌',
      premium: '✔️',
    },
    {
      feature: 'Spielzeit-Testversionen',
      essential: '❌',
      extra: '❌',
      premium: '✔️',
    },
  ];

  // Use provided data if available, otherwise use default static data
  const tableData = data || defaultData;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.tableContainer}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerFeatureText}>Feature</Text>
          <Text style={styles.headerText}>Essential</Text>
          <Text style={styles.headerText}>Extra</Text>
          <Text style={styles.headerText}>Premium</Text>
        </View>

        {/* Data Cards */}
        {tableData.map((row, index) => (
          <View key={index} style={styles.dataCard}>
            <Text style={styles.featureText}>{row.feature}</Text>
            <Text style={styles.dataText}>{row.essential}</Text>
            <Text style={styles.dataText}>{row.extra}</Text>
            <Text style={styles.dataText}>{row.premium}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  tableContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 20,
  },
  headerCard: {
    flexDirection: 'row',
    backgroundColor: '#333',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerFeatureText: {
    flex: 2,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
    paddingRight: 8,
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  dataCard: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#111',
  },
  featureText: {
    flex: 2,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingRight: 8,
    color: '#fff',
  },
  dataText: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
  },
});

export default ResponsiveTable;
