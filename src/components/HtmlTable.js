import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Table, Row } from 'react-native-table-component';
import { DOMParser } from 'react-native-html-parser';

// Hilfsfunktion, um den Text aus einem Knoten zu extrahieren (behandelt auch <strong> etc.)
const extractText = (node) => {
  if (node.nodeType === 3) { // Textknoten
    return node.data;
  }
  if (node.nodeType === 1 && node.childNodes && node.childNodes.length > 0) { // Elementknoten
    return Array.from(node.childNodes).map(extractText).join('');
  }
  return '';
};

const HtmlTable = ({ htmlString }) => {
  const { width } = useWindowDimensions();

  const tableData = useMemo(() => {
    if (!htmlString) {
      return null;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      
      const headerNodes = Array.from(doc.getElementsByTagName('th'));
      const tableHead = headerNodes.map(extractText);

      const rowNodes = Array.from(doc.getElementsByTagName('tr'));
      const tableRows = rowNodes
        .slice(1) // Header-Zeile überspringen
        .map(rowNode => {
          const cellNodes = Array.from(rowNode.getElementsByTagName('td'));
          return cellNodes.map(extractText);
        });

      if (tableHead.length === 0 || tableRows.length === 0) {
          return null;
      }

      return {
        tableHead,
        tableRows,
      };
    } catch (e) {
      console.error("Fehler beim Parsen der HTML-Tabelle:", e);
      return null;
    }
  }, [htmlString]);

  if (!tableData) {
    return <Text style={styles.errorText}>Tabelle konnte nicht geladen werden.</Text>;
  }

  const { tableHead, tableRows } = tableData;

  const columnWidths = [
      width * 0.35, // Breite für die erste Spalte (Feature)
      width * 0.18, // Breite für die restlichen Spalten
      width * 0.18,
      width * 0.18,
  ];

  return (
    <View style={styles.container}>
      <Table borderStyle={styles.tableBorder}>
        <Row data={tableHead} style={styles.head} textStyle={styles.headText} widthArr={columnWidths} />
        {tableRows.map((rowData, index) => (
          <Row
            key={index}
            data={rowData}
            style={[styles.row, index % 2 && styles.oddRow]}
            textStyle={styles.rowText}
            widthArr={columnWidths}
          />
        ))}
      </Table>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
      marginVertical: 20,
      padding: 10,
      backgroundColor: '#1A1A1A',
      borderRadius: 8,
  },
  tableBorder: { 
      borderWidth: 1, 
      borderColor: '#444' 
  },
  head: { 
      height: 50, 
      backgroundColor: '#333',
  },
  headText: { 
      margin: 6, 
      textAlign: 'center', 
      fontWeight: 'bold',
      color: 'white',
      fontSize: 14,
  },
  row: { 
      backgroundColor: '#2C2C2E',
      minHeight: 40,
  },
  oddRow: {
      backgroundColor: '#222224'
  },
  rowText: { 
      margin: 6, 
      textAlign: 'center',
      color: '#E0E0E0',
      fontSize: 15,
  },
  errorText: {
      color: 'red',
      margin: 10,
  }
});

export default React.memo(HtmlTable); 