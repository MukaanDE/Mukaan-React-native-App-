import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { decode } from 'html-entities';

const ResponsiveTable = ({ tableData, style }) => {
  const { width: screenWidth } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [showFullHeaders, setShowFullHeaders] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Berechne optimale Darstellungsparameter für Smartphones
  const displayConfig = useMemo(() => {
    if (!tableData || !tableData.headers) return null;

    const { headers, metadata } = tableData;
    const columnCount = headers.length;
    const availableWidth = screenWidth - normalize(20); // Reduzierte Margins für Smartphones
    const minCellWidth = screenWidth < 400 ? 50 : 60;
    const optimalCellWidth = availableWidth / columnCount;

    // Schriftgröße und Layout für Smartphones optimiert
    let fontSize = screenWidth < 360 ? 10 : screenWidth < 400 ? 11 : screenWidth < 480 ? 12 : 13;
    let cellPadding = screenWidth < 360 ? 4 : screenWidth < 400 ? 6 : screenWidth < 480 ? 8 : 10;
    let needsHorizontalScroll = false;
    let useAbbreviations = false;
    let useCompactMode = false;

    // Smartphone-optimierte Breakpoints - weniger aggressiv
    if (columnCount >= 6) {
      needsHorizontalScroll = true;
      useAbbreviations = true;
      useCompactMode = screenWidth < 480;
    } else if (columnCount === 5) {
      needsHorizontalScroll = screenWidth < 400;
      useAbbreviations = screenWidth < 400;
      useCompactMode = screenWidth < 480;
    } else if (columnCount === 4) {
      needsHorizontalScroll = screenWidth < 360;
      useAbbreviations = screenWidth < 360;
      useCompactMode = screenWidth < 400;
    } else {
      needsHorizontalScroll = false;
      useAbbreviations = false;
      useCompactMode = screenWidth < 360;
    }

    return {
      fontSize,
      cellPadding,
      needsHorizontalScroll,
      useAbbreviations,
      useCompactMode,
      firstColumnWidth: needsHorizontalScroll ? minCellWidth * 2.5 : optimalCellWidth * 2.5,
      otherColumnsWidth: needsHorizontalScroll ? minCellWidth * 0.4 : optimalCellWidth * 0.4,
      isComparisonTable: metadata?.optimizations?.isComparisonTable || false,
      availableWidth,
    };
  }, [tableData, screenWidth]);

  // Generiere Header-Anzeigenamen mit Smartphone-Optimierung
  const displayHeaders = useMemo(() => {
    if (!tableData?.headers || !displayConfig) return [];

    const { headers, metadata } = tableData;
    const { useAbbreviations, useCompactMode } = displayConfig;

    if (!useAbbreviations || showFullHeaders) {
      return headers;
    }

    // Verwende Metadaten-Abkürzungen falls verfügbar
    if (metadata?.optimizations?.headerAbbreviations) {
      return headers.map(header => 
        metadata.optimizations.headerAbbreviations[header] || header
      );
    }

    // Smartphone-optimierte Abkürzungslogik
    return headers.map(header => {
      if (header.length <= 6) return header;
      
      const words = header.split(' ');
      if (words.length > 1) {
        return words.map(word => word.substring(0, useCompactMode ? 2 : 3)).join('');
      }
      return header.substring(0, useCompactMode ? 4 : 6);
    });
  }, [tableData, displayConfig, showFullHeaders]);

  if (!tableData || !displayConfig) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tabelle konnte nicht geladen werden</Text>
      </View>
    );
  }

  const { headers, rows } = tableData;
  const {
    fontSize,
    cellPadding,
    needsHorizontalScroll,
    firstColumnWidth,
    otherColumnsWidth,
    isComparisonTable,
    useCompactMode,
  } = displayConfig;

  const renderCell = (content, type = 'text', isHeader = false, cellIndex = 0) => {
    const cellStyle = [
      styles.cell,
      {
        fontSize,
        padding: cellPadding,
        minWidth: cellIndex === 0 ? firstColumnWidth : otherColumnsWidth,
        backgroundColor: isHeader ? '#333' : 'transparent',
      },
      isHeader && styles.headerCell,
      type === 'symbol' && styles.symbolCell,
      type === 'number' && styles.numberCell,
      useCompactMode && styles.compactCell,
    ];

    // Für Symbole, verwende den ursprünglichen Text (Emojis)
    let displayText = content;
    if (typeof content === 'object' && content.text) {
      displayText = content.text;
    }

    // Dekodiere HTML-Entities
    displayText = decode(displayText);

    return (
      <View style={cellStyle}>
        <Text
          style={[
            styles.cellText,
            { fontSize },
            isHeader && styles.headerText,
            type === 'symbol' && styles.symbolText,
            type === 'number' && styles.numberText,
            useCompactMode && styles.compactText,
          ]}
          numberOfLines={useCompactMode ? 1 : 2}
          adjustsFontSizeToFit={useCompactMode}
        >
          {displayText}
        </Text>
      </View>
    );
  };

  const renderRow = (rowData, index) => {
    const isEvenRow = index % 2 === 0;
    const isSelected = selectedRow === index;
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.row,
          isEvenRow && styles.evenRow,
          isSelected && styles.selectedRow,
        ]}
        activeOpacity={0.7}
        onPress={() => {
          setSelectedRow(isSelected ? null : index);
          // Optional: Zeige Zeilen-Details
          if (!isSelected) {
            const rowInfo = headers.map(header => `${header}: ${rowData[header]?.text || rowData[header]}`).join('\n');
            Alert.alert('Zeilen-Details', rowInfo, [{ text: 'OK' }]);
          }
        }}
      >
        {headers.map((header, cellIndex) => {
          const cellData = rowData[header];
          const cellType = cellData?.type || 'text';
          return (
            <View key={cellIndex} style={{ flex: needsHorizontalScroll ? 0 : 1 }}>
              {renderCell(cellData, cellType, false, cellIndex)}
            </View>
          );
        })}
      </TouchableOpacity>
    );
  };

  const tableContent = (
    <View style={styles.tableContainer}>
      {/* Header */}
      <View style={[styles.row, styles.headerRow]}>
        {displayHeaders.map((header, index) => (
          <View key={index} style={{ flex: needsHorizontalScroll ? 0 : 1 }}>
            {renderCell(header, 'text', true, index)}
          </View>
        ))}
      </View>

      {/* Rows */}
      {rows.map((row, index) => renderRow(row, index))}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Smartphone-optimierte Steuerungselemente */}
      <View style={styles.controlsContainer}>
        {displayConfig.useAbbreviations && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowFullHeaders(!showFullHeaders)}
            activeOpacity={0.7}
          >
            <Text style={styles.toggleButtonText}>
              {showFullHeaders ? '📱 Kurz' : '📱 Lang'}
            </Text>
          </TouchableOpacity>
        )}
        
        {needsHorizontalScroll && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
          >
            <Text style={styles.expandButtonText}>
              {isExpanded ? '📱 Kompakt' : '📱 Erweitert'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabelle immer anzeigen */}
      <View style={[styles.tableWrapper, isExpanded && styles.expandedWrapper]}>
        {needsHorizontalScroll ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.scrollContent}
          >
            {tableContent}
          </ScrollView>
        ) : (
          tableContent
        )}
      </View>

      {/* Info-Text für Vergleichstabellen */}
      {isComparisonTable && (
        <Text style={styles.infoText}>
          ✔️ = Verfügbar, ❌ = Nicht verfügbar
        </Text>
      )}
      
      {/* Touch-Hinweis für Smartphones */}
      {rows.length > 0 && (
        <Text style={styles.touchHint}>
          💡 Tippe auf eine Zeile für Details
        </Text>
      )}
    </View>
  );
};

const normalize = (size) => Math.round((screenWidth / 375) * size);

const styles = StyleSheet.create({
  container: {
    marginVertical: normalize(12),
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: normalize(12),
    overflow: 'hidden',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: normalize(8),
    gap: normalize(8),
  },
  toggleButton: {
    backgroundColor: 'rgba(127, 219, 255, 0.2)',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: 'rgba(127, 219, 255, 0.3)',
  },
  toggleButtonText: {
    color: '#7FDBFF',
    fontSize: normalize(11),
    fontWeight: '600',
    // fontFamily removed for Hermes compatibility
  },
  expandButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  expandButtonText: {
    color: '#FFD700',
    fontSize: normalize(11),
    fontWeight: '600',
    // fontFamily removed for Hermes compatibility
  },
  tableWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: normalize(8),
    overflow: 'hidden',
  },
  expandedWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tableContainer: {
    minWidth: '100%',
  },
  horizontalScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: normalize(4),
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  evenRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  selectedRow: {
    backgroundColor: 'rgba(127, 219, 255, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#7FDBFF',
  },
  headerRow: {
    backgroundColor: '#333',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  compactCell: {
    padding: normalize(4),
    minHeight: normalize(28),
  },
  headerCell: {
    backgroundColor: '#333',
  },
  symbolCell: {
    backgroundColor: 'rgba(127, 219, 255, 0.05)',
  },
  numberCell: {
    alignItems: 'flex-end',
    paddingRight: normalize(8),
  },
  cellText: {
    color: '#fff',
    textAlign: 'center',
    // fontFamily removed for Hermes compatibility
    flexWrap: 'nowrap',
  },
  compactText: {
    fontSize: normalize(10),
    lineHeight: normalize(14),
  },
  headerText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  symbolText: {
    fontSize: normalize(16),
    fontWeight: 'normal',
  },
  numberText: {
    // fontFamily removed for Hermes compatibility
    textAlign: 'right',
  },
  infoText: {
    color: '#bbb',
    fontSize: normalize(11),
    textAlign: 'center',
    marginTop: normalize(8),
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(8),
    // fontFamily removed for Hermes compatibility
  },
  touchHint: {
    color: '#7FDBFF',
    fontSize: normalize(10),
    textAlign: 'center',
    marginTop: normalize(4),
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(8),
    // fontFamily removed for Hermes compatibility
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: normalize(20),
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: normalize(8),
    marginVertical: normalize(16),
  },
  errorText: {
    color: '#FF5252',
    fontSize: normalize(14),
    textAlign: 'center',
    // fontFamily removed for Hermes compatibility
  },
});

export default ResponsiveTable;
