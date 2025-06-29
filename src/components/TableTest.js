import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, useWindowDimensions } from 'react-native';
import RenderHTML from 'react-native-render-html';
import { tableRenderers } from './TableRenderer';

const { width: screenWidth } = Dimensions.get('window');
const scale = screenWidth / 375;
const normalize = (size) => Math.round(scale * size);

const TableTest = () => {
  const { width: windowWidth } = useWindowDimensions();
  
  // Elementor-spezifischer HTML-Code mit responsivem Design
  const elementorTableHTML = `
    <table class="elementor-table elementor-widget-table" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead class="elementor-table-header">
        <tr class="elementor-table-row elementor-table-header-row" style="background-color: #333; color: #fff;">
          <th class="elementor-table-cell elementor-table-header-cell" style="padding: 12px; text-align: left;"><strong>Feature</strong></th>
          <th class="elementor-table-cell elementor-table-header-cell" style="padding: 12px; text-align: center;"><strong>Essential</strong></th>
          <th class="elementor-table-cell elementor-table-header-cell" style="padding: 12px; text-align: center;"><strong>Extra</strong></th>
          <th class="elementor-table-cell elementor-table-header-cell" style="padding: 12px; text-align: center;"><strong>Premium</strong></th>
        </tr>
      </thead>
      <tbody class="elementor-table-body">
        <tr class="elementor-table-row">
          <td class="elementor-table-cell"><strong>Online-Multiplayer</strong></td>
          <td class="elementor-table-cell" style="text-align: center;">✔️</td>
          <td class="elementor-table-cell" style="text-align: center;">✔️</td>
          <td class="elementor-table-cell" style="text-align: center;">✔️</td>
        </tr>
        <tr class="elementor-table-row">
          <td class="elementor-table-cell"><strong>Monatliche Spiele</strong></td>
          <td class="elementor-table-cell" style="text-align: center;">✔️</td>
          <td class="elementor-table-cell" style="text-align: center;">✔️</td>
          <td class="elementor-table-cell" style="text-align: center;">✔️</td>
        </tr>
        <tr class="elementor-table-row">
          <td class="elementor-table-cell"><strong>Cloud-Speicher</strong></td>
          <td class="elementor-table-cell" style="text-align: center;">✔️</td>
          <td class="elementor-table-cell" style="text-align: center;">✔️</td>
          <td class="elementor-table-cell" style="text-align: center;">✔️</td>
        </tr>
        <tr class="elementor-table-row">
          <td class="elementor-table-cell"><strong>Spielekatalog (PS4/PS5)</strong></td>
          <td class="elementor-table-cell" style="text-align: center;">❌</td>
          <td class="elementor-table-cell" style="text-align: center;">✔️</td>
          <td class="elementor-table-cell" style="text-align: center;">✔️</td>
        </tr>
        <tr class="elementor-table-row">
          <td class="elementor-table-cell"><strong>Klassiker-Katalog (PS1, PS2, PSP)</strong></td>
          <td class="elementor-table-cell" style="text-align: center;">❌</td>
          <td class="elementor-table-cell" style="text-align: center;">❌</td>
          <td class="elementor-table-cell" style="text-align: center;">✔️</td>
        </tr>
        <tr class="elementor-table-row">
          <td class="elementor-table-cell"><strong>Cloud-Streaming (PS3/andere)</strong></td>
          <td class="elementor-table-cell" style="text-align: center;">❌</td>
          <td class="elementor-table-cell" style="text-align: center;">❌</td>
          <td class="elementor-table-cell" style="text-align: center;">✔️</td>
        </tr>
        <tr class="elementor-table-row">
          <td class="elementor-table-cell"><strong>Spielzeit-Testversionen</strong></td>
          <td class="elementor-table-cell" style="text-align: center;">❌</td>
          <td class="elementor-table-cell" style="text-align: center;">❌</td>
          <td class="elementor-table-cell" style="text-align: center;">✔️</td>
        </tr>
      </tbody>
    </table>
  `;

  // Responsive Tags-Styles basierend auf Display-Größe
  const getResponsiveTagsStyles = () => {
    const baseFontSize = windowWidth < 400 ? normalize(12) : windowWidth < 600 ? normalize(13) : normalize(14);
    const basePadding = windowWidth < 400 ? normalize(8) : windowWidth < 600 ? normalize(10) : normalize(12);
    
    return {
      table: { 
        marginVertical: 16, 
        borderWidth: 1, 
        borderColor: '#444', 
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        overflow: 'hidden'
      },
      thead: {
        // Spezielle Styles für thead falls benötigt
      },
      tbody: {
        // Spezielle Styles für tbody falls benötigt
      },
      tr: { 
        flexDirection: 'row', 
        borderBottomWidth: 1, 
        borderBottomColor: '#333' 
      },
      th: { 
        flex: 1, 
        padding: basePadding, 
        backgroundColor: 'rgba(255, 215, 0, 0.1)', 
        borderBottomWidth: 2, 
        borderBottomColor: '#FFD700',
        color: '#FFD700',
        fontWeight: '700',
        fontSize: baseFontSize,
        textAlign: 'center'
      },
      td: { 
        flex: 1, 
        padding: basePadding, 
        color: '#fff',
        fontSize: baseFontSize,
        textAlign: 'left'
      },
      strong: { 
        fontWeight: '700',
        color: '#fff'
      },
    };
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Elementor HTML-Tabelle Test</Text>
      <Text style={styles.subtitle}>Responsive Design für verschiedene Display-Größen</Text>
      <Text style={styles.displayInfo}>Aktuelle Display-Breite: {windowWidth}px</Text>
      
      <View style={styles.tableSection}>
        <RenderHTML
          contentWidth={windowWidth - 30}
          source={{ html: elementorTableHTML }}
          tagsStyles={getResponsiveTagsStyles()}
          renderers={tableRenderers}
          enableExperimentalMarginCollapsing
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 15,
  },
  title: {
    fontSize: normalize(24),
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: normalize(10),
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: normalize(16),
    color: '#ccc',
    textAlign: 'center',
    marginBottom: normalize(10),
    fontFamily: 'System',
  },
  displayInfo: {
    fontSize: normalize(14),
    color: '#888',
    textAlign: 'center',
    marginBottom: normalize(20),
    fontFamily: 'System',
  },
  tableSection: {
    marginBottom: normalize(30),
  },
});

export default TableTest; 