import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, useWindowDimensions, TouchableOpacity } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const scale = screenWidth / 375;
const normalize = (size) => Math.round(scale * size);

// Smartphone-optimierte Table Renderer für HTML-Tabellen
export const TableRenderer = ({ tnode, children }) => {
  const { width: windowWidth } = useWindowDimensions();
  const [isExpanded, setIsExpanded] = useState(false);
  const tableStyle = tnode.attributes?.style || '';
  const tableClass = tnode.attributes?.class || '';
  
  // Elementor-spezifische Klassen erkennen
  const isElementorTable = tableClass.includes('elementor-table') || 
                          tableClass.includes('elementor-widget-table') ||
                          tableStyle.includes('elementor');
  
  // Responsive Breite für Smartphones - immer sichtbar
  const getResponsiveWidth = () => {
    if (windowWidth < 360) return windowWidth - normalize(20);
    if (windowWidth < 400) return windowWidth - normalize(30);
    if (windowWidth < 480) return windowWidth - normalize(40);
    return windowWidth - normalize(50);
  };
  
  // Prüfe ob Tabelle zu breit ist für direkte Darstellung
  const needsHorizontalScroll = windowWidth < 480;
  
  return (
    <View style={[styles.tableWrapper, { marginVertical: isElementorTable ? normalize(16) : normalize(12) }]}>
      {/* Toggle-Button nur anzeigen wenn wirklich nötig */}
      {needsHorizontalScroll && (
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={0.7}
        >
          <Text style={styles.expandButtonText}>
            {isExpanded ? '📱 Kompakte Ansicht' : '📱 Erweiterte Ansicht'}
          </Text>
        </TouchableOpacity>
      )}
      
      {/* Tabelle immer anzeigen */}
      <View style={[
        styles.tableContainer, 
        isExpanded && styles.expandedContainer
      ]}>
        {needsHorizontalScroll ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.tableContent}
            scrollEnabled={true}
          >
            <View style={[
              styles.table, 
              getTableStyles(tableStyle, tableClass),
              { 
                minWidth: getResponsiveWidth(),
                maxWidth: isExpanded ? getResponsiveWidth() * 2 : getResponsiveWidth() * 1.2
              }
            ]}>
              {children}
            </View>
          </ScrollView>
        ) : (
          <View style={[
            styles.table, 
            getTableStyles(tableStyle, tableClass),
            { 
              width: getResponsiveWidth()
            }
          ]}>
            {children}
          </View>
        )}
      </View>
    </View>
  );
};

// Smartphone-optimierte Table Head Renderer
export const TableHeadRenderer = ({ tnode, children }) => {
  const headStyle = tnode.attributes?.style || '';
  const headClass = tnode.attributes?.class || '';
  
  return (
    <View style={[
      styles.tableHead, 
      getElementorStyles(headStyle, headClass, 'thead')
    ]}>
      {children}
    </View>
  );
};

// Smartphone-optimierte Table Body Renderer
export const TableBodyRenderer = ({ tnode, children }) => {
  const bodyStyle = tnode.attributes?.style || '';
  const bodyClass = tnode.attributes?.class || '';
  
  return (
    <View style={[
      styles.tableBody, 
      getElementorStyles(bodyStyle, bodyClass, 'tbody')
    ]}>
      {children}
    </View>
  );
};

// Smartphone-optimierte Table Row Renderer mit Touch-Feedback
export const TableRowRenderer = ({ tnode, children }) => {
  const rowStyle = tnode.attributes?.style || '';
  const rowClass = tnode.attributes?.class || '';
  
  return (
    <TouchableOpacity
      style={[
        styles.tableRow, 
        getRowStyles(rowStyle, rowClass),
        getElementorStyles(rowStyle, rowClass, 'tr')
      ]}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

// Smartphone-optimierte Table Cell Renderer
export const TableCellRenderer = ({ tnode, children }) => {
  const { width: windowWidth } = useWindowDimensions();
  const cellStyle = tnode.attributes?.style || '';
  const cellClass = tnode.attributes?.class || '';
  const isHeader = tnode.tagName === 'th';
  const colspan = parseInt(tnode.attributes?.colspan) || 1;
  const rowspan = parseInt(tnode.attributes?.rowspan) || 1;
  
  // Responsive Padding für Smartphones
  const getResponsivePadding = () => {
    if (windowWidth < 360) return normalize(6);
    if (windowWidth < 400) return normalize(8);
    if (windowWidth < 480) return normalize(10);
    return normalize(12);
  };
  
  // Responsive Schriftgröße für Smartphones
  const getResponsiveFontSize = () => {
    if (windowWidth < 360) return normalize(10);
    if (windowWidth < 400) return normalize(11);
    if (windowWidth < 480) return normalize(12);
    return normalize(13);
  };
  
  // Responsive Zeilenhöhe
  const getResponsiveLineHeight = () => {
    if (windowWidth < 360) return normalize(14);
    if (windowWidth < 400) return normalize(16);
    if (windowWidth < 480) return normalize(18);
    return normalize(20);
  };
  
  return (
    <View style={[
      styles.tableCell, 
      isHeader ? styles.tableHeader : styles.tableData,
      getCellStyles(cellStyle, cellClass, isHeader),
      getElementorStyles(cellStyle, cellClass, isHeader ? 'th' : 'td'),
      { 
        flex: colspan,
        padding: getResponsivePadding(),
        minHeight: windowWidth < 400 ? normalize(32) : normalize(40)
      }
    ]}>
      <Text style={[
        styles.cellText,
        isHeader ? styles.headerText : styles.dataText,
        getTextStyles(cellStyle),
        { 
          fontSize: getResponsiveFontSize(),
          lineHeight: getResponsiveLineHeight()
        }
      ]}
      numberOfLines={windowWidth < 400 ? 2 : 3}
      adjustsFontSizeToFit={windowWidth < 360}
      >
        {children}
      </Text>
    </View>
  );
};

// Elementor-spezifische Styling-Funktion
const getElementorStyles = (style, className, elementType) => {
  const styles = {};
  
  // Elementor-spezifische Klassen erkennen
  const isElementor = className.includes('elementor') || style.includes('elementor');
  
  if (isElementor) {
    // Elementor-spezifische Hintergrundfarben
    if (className.includes('elementor-table-header') || elementType === 'th') {
      styles.backgroundColor = 'rgba(255, 215, 0, 0.15)';
    }
    
    // Elementor-spezifische Abstände
    if (className.includes('elementor-table-row')) {
      styles.borderBottomWidth = 1;
      styles.borderBottomColor = '#555';
    }
    
    // Elementor-spezifische Schriftgrößen
    if (className.includes('elementor-table-cell')) {
      styles.fontWeight = '500';
    }
  }
  
  return styles;
};

// Helper-Funktionen für Styling
const getTableStyles = (style, className) => {
  const styles = {};
  
  // Border-Styles aus HTML-Style parsen
  if (style.includes('border')) {
    styles.borderWidth = 1;
    styles.borderColor = '#444';
  }
  
  // Width aus HTML-Style parsen
  const widthMatch = style.match(/width:\s*(\d+)(px|%)/);
  if (widthMatch) {
    const width = parseInt(widthMatch[1]);
    if (widthMatch[2] === '%') {
      styles.width = `${width}%`;
    } else {
      styles.width = normalize(width);
    }
  }
  
  // Background-Color aus HTML-Style parsen
  const bgMatch = style.match(/background-color:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/);
  if (bgMatch) {
    styles.backgroundColor = bgMatch[1];
  }
  
  // Margin aus HTML-Style parsen
  const marginMatch = style.match(/margin:\s*(\d+)px\s+(\d+)px/);
  if (marginMatch) {
    const verticalMargin = normalize(parseInt(marginMatch[2]));
    styles.marginVertical = verticalMargin;
  }
  
  // Elementor-spezifische Styles
  if (className.includes('elementor-table') || style.includes('elementor')) {
    styles.borderRadius = normalize(8);
    styles.overflow = 'hidden';
    styles.backgroundColor = 'rgba(255, 255, 255, 0.03)';
  }
  
  return styles;
};

const getRowStyles = (style, className) => {
  const styles = {};
  
  // Background-Color aus HTML-Style parsen
  const bgMatch = style.match(/background-color:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/);
  if (bgMatch) {
    styles.backgroundColor = bgMatch[1];
  }
  
  // Alternating row colors
  if (className.includes('alternate') || className.includes('even')) {
    styles.backgroundColor = 'rgba(255, 255, 255, 0.05)';
  }
  
  // Zebra-Streifen für bessere Lesbarkeit
  if (className.includes('zebra') || className.includes('striped')) {
    styles.backgroundColor = 'rgba(255, 255, 255, 0.03)';
  }
  
  // Elementor-spezifische Zeilen-Styles
  if (className.includes('elementor-table-row')) {
    styles.borderBottomWidth = 1;
    styles.borderBottomColor = '#555';
  }
  
  return styles;
};

const getCellStyles = (style, className, isHeader) => {
  const styles = {};
  
  // Padding aus HTML-Style parsen
  const paddingMatch = style.match(/padding:\s*(\d+)px/);
  if (paddingMatch) {
    const padding = normalize(parseInt(paddingMatch[1]));
    styles.padding = padding;
  }
  
  // Border-Styles
  if (style.includes('border')) {
    styles.borderWidth = 1;
    styles.borderColor = '#444';
  }
  
  // Background-Color für spezielle Zellen
  const bgMatch = style.match(/background-color:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/);
  if (bgMatch) {
    styles.backgroundColor = bgMatch[1];
  }
  
  return styles;
};

const getTextStyles = (style) => {
  const textStyles = {};
  
  // Text-Alignment aus HTML-Style parsen
  if (style.includes('text-align: center')) {
    textStyles.textAlign = 'center';
  } else if (style.includes('text-align: right')) {
    textStyles.textAlign = 'right';
  } else if (style.includes('text-align: justify')) {
    textStyles.textAlign = 'justify';
  } else {
    textStyles.textAlign = 'left';
  }
  
  // Font-Weight aus HTML-Style parsen
  if (style.includes('font-weight: bold') || style.includes('font-weight: 700')) {
    textStyles.fontWeight = '700';
  } else if (style.includes('font-weight: 600')) {
    textStyles.fontWeight = '600';
  } else if (style.includes('font-weight: 500')) {
    textStyles.fontWeight = '500';
  }
  
  // Font-Size aus HTML-Style parsen
  const fontSizeMatch = style.match(/font-size:\s*(\d+)px/);
  if (fontSizeMatch) {
    textStyles.fontSize = normalize(parseInt(fontSizeMatch[1]));
  }
  
  // Color aus HTML-Style parsen
  const colorMatch = style.match(/color:\s*(#[0-9a-fA-F]{3,6}|rgba?\([^)]+\))/);
  if (colorMatch) {
    textStyles.color = colorMatch[1];
  }
  
  return textStyles;
};

const styles = StyleSheet.create({
  tableWrapper: {
    marginVertical: normalize(12),
  },
  expandButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    borderRadius: normalize(20),
    alignSelf: 'center',
    marginBottom: normalize(8),
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  expandButtonText: {
    color: '#FFD700',
    fontSize: normalize(12),
    fontWeight: '600',
    fontFamily: 'System',
  },
  tableContainer: {
    borderRadius: normalize(8),
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  expandedContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tableContent: {
    flexGrow: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: normalize(8),
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  tableHead: {
    // Spezielle Styles für thead falls benötigt
  },
  tableBody: {
    // Spezielle Styles für tbody falls benötigt
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tableCell: {
    flex: 1,
    padding: normalize(12),
    justifyContent: 'center',
    minHeight: normalize(44),
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  tableHeader: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  tableData: {
    backgroundColor: 'transparent',
  },
  cellText: {
    fontSize: normalize(14),
    lineHeight: normalize(20),
    textAlign: 'left',
  },
  headerText: {
    fontWeight: '700',
    color: '#FFD700',
  },
  dataText: {
    fontWeight: '400',
    color: '#fff',
  },
});

// Export der Renderer für react-native-render-html
export const tableRenderers = {
  table: TableRenderer,
  thead: TableHeadRenderer,
  tbody: TableBodyRenderer,
  tr: TableRowRenderer,
  th: TableCellRenderer,
  td: TableCellRenderer,
};
