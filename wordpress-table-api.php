<?php
/**
 * WordPress Custom Table API Endpunkt
 * Für die Mukaan App - Responsive Tabellen-Darstellung
 * 
 * Diesen Code in die functions.php des aktiven WordPress-Themes einfügen
 * oder als separates Plugin verwenden
 */

// Registriere den benutzerdefinierten REST-API-Endpunkt
add_action('rest_api_init', function () {
    register_rest_route('mukaan-app/v1', '/table-data/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'mukaan_get_table_data',
        'args' => array(
            'id' => array(
                'validate_callback' => function($param, $request, $key) {
                    return is_numeric($param);
                }
            ),
        ),
        'permission_callback' => '__return_true' // In Produktion durch echte Authentifizierung ersetzen
    ));
});

/**
 * Hauptfunktion zum Abrufen und Verarbeiten von Tabellendaten
 */
function mukaan_get_table_data(WP_REST_Request $request) {
    $post_id = (int) $request['id'];
    $transient_key = 'mukaan_table_data_' . $post_id;

    // Prüfe Cache
    $cached_data = get_transient($transient_key);
    if (false !== $cached_data) {
        return new WP_REST_Response($cached_data, 200);
    }

    // Elementor-Daten abrufen
    $elementor_data_json = get_post_meta($post_id, '_elementor_data', true);
    
    if (empty($elementor_data_json)) {
        return new WP_Error('no_elementor_data', 'Keine Elementor-Daten für diese Seite gefunden.', array('status' => 404));
    }

    $elementor_data = json_decode($elementor_data_json, true);
    
    // Suche nach Tabellen in den Elementor-Daten
    $tables = mukaan_find_tables_in_elementor_data($elementor_data);
    
    if (empty($tables)) {
        return new WP_Error('no_tables', 'Keine Tabellen in den Elementor-Daten gefunden.', array('status' => 404));
    }

    // Verarbeite alle gefundenen Tabellen
    $processed_tables = array();
    foreach ($tables as $table_html) {
        $processed_table = mukaan_process_table_html($table_html);
        if ($processed_table) {
            $processed_tables[] = $processed_table;
        }
    }

    if (empty($processed_tables)) {
        return new WP_Error('no_valid_tables', 'Keine gültigen Tabellen gefunden.', array('status' => 404));
    }

    $response_data = array(
        'post_id' => $post_id,
        'tables' => $processed_tables,
        'timestamp' => current_time('timestamp')
    );

    // Cache für 1 Stunde
    set_transient($transient_key, $response_data, HOUR_IN_SECONDS);
    
    return new WP_REST_Response($response_data, 200);
}

/**
 * Rekursive Suche nach Tabellen in Elementor-Daten
 */
function mukaan_find_tables_in_elementor_data($elements) {
    $tables = array();
    
    foreach ($elements as $element) {
        // Prüfe auf HTML-Widget mit Tabelle
        if (isset($element['widgetType']) && $element['widgetType'] === 'html') {
            if (isset($element['settings']['html'])) {
                $html = $element['settings']['html'];
                if (strpos($html, '<table') !== false) {
                    $tables[] = $html;
                }
            }
        }
        
        // Prüfe auf Text-Editor-Widget mit Tabelle
        if (isset($element['widgetType']) && $element['widgetType'] === 'text-editor') {
            if (isset($element['settings']['editor'])) {
                $html = $element['settings']['editor'];
                if (strpos($html, '<table') !== false) {
                    $tables[] = $html;
                }
            }
        }
        
        // Rekursiv durch Kinder-Elemente
        if (!empty($element['elements'])) {
            $child_tables = mukaan_find_tables_in_elementor_data($element['elements']);
            $tables = array_merge($tables, $child_tables);
        }
    }
    
    return $tables;
}

/**
 * Verarbeitet HTML-Tabelle und extrahiert strukturierte Daten
 */
function mukaan_process_table_html($table_html) {
    // DOMDocument für HTML-Parsing
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    
    // UTF-8-Kodierung erzwingen
    $dom->loadHTML('<?xml encoding="UTF-8">' . $table_html);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);
    $table = $xpath->query('//table')->item(0);

    if (!$table) {
        return null;
    }

    // Header extrahieren
    $headers = array();
    $header_nodes = $xpath->query('.//thead/tr/th', $table);
    foreach ($header_nodes as $node) {
        $headers[] = trim(strip_tags($node->textContent));
    }

    // Falls keine thead, versuche erste tr als Header
    if (empty($headers)) {
        $first_row = $xpath->query('.//tr', $table)->item(0);
        if ($first_row) {
            $header_cells = $xpath->query('.//th|.//td', $first_row);
            foreach ($header_cells as $cell) {
                $headers[] = trim(strip_tags($cell->textContent));
            }
        }
    }

    // Datenzeilen extrahieren
    $rows = array();
    $data_rows = $xpath->query('.//tbody/tr', $table);
    
    // Falls keine tbody, alle tr außer der ersten (Header)
    if ($data_rows->length === 0) {
        $all_rows = $xpath->query('.//tr', $table);
        $start_index = !empty($headers) ? 1 : 0;
        
        for ($i = $start_index; $i < $all_rows->length; $i++) {
            $row = $all_rows->item($i);
            $row_data = mukaan_extract_row_data($row, $headers, $xpath);
            if (!empty($row_data)) {
                $rows[] = $row_data;
            }
        }
    } else {
        foreach ($data_rows as $row) {
            $row_data = mukaan_extract_row_data($row, $headers, $xpath);
            if (!empty($row_data)) {
                $rows[] = $row_data;
            }
        }
    }

    // Metadaten generieren
    $metadata = mukaan_generate_table_metadata($headers, $rows, $table_html);

    return array(
        'html' => $table_html,
        'headers' => $headers,
        'rows' => $rows,
        'metadata' => $metadata
    );
}

/**
 * Extrahiert Daten aus einer Tabellenzeile
 */
function mukaan_extract_row_data($row, $headers, $xpath) {
    $row_data = array();
    $cells = $xpath->query('.//td|.//th', $row);
    
    foreach ($cells as $index => $cell) {
        $cell_content = trim($cell->textContent);
        
        // Behalte HTML für spezielle Inhalte (Emojis, Symbole)
        $cell_html = $cell->ownerDocument->saveHTML($cell);
        
        if (isset($headers[$index])) {
            $row_data[$headers[$index]] = array(
                'text' => $cell_content,
                'html' => $cell_html,
                'type' => mukaan_detect_cell_type($cell_content)
            );
        }
    }
    
    return $row_data;
}

/**
 * Erkennt den Typ des Zellinhalts
 */
function mukaan_detect_cell_type($content) {
    // Emoji/Symbol-Erkennung
    if (preg_match('/[✔️❌✅❎⭐🔥💰📱💻🎮]/u', $content)) {
        return 'symbol';
    }
    
    // Zahlen-Erkennung
    if (is_numeric($content) || preg_match('/^\d+[.,]\d+$/', $content)) {
        return 'number';
    }
    
    // URL-Erkennung
    if (filter_var($content, FILTER_VALIDATE_URL)) {
        return 'url';
    }
    
    // Standard-Text
    return 'text';
}

/**
 * Generiert Metadaten für responsive Darstellung
 */
function mukaan_generate_table_metadata($headers, $rows, $html) {
    $column_count = count($headers);
    $row_count = count($rows);
    
    // Analysiere Zelltypen
    $cell_types = array();
    $max_text_length = 0;
    $has_symbols = false;
    
    foreach ($headers as $header) {
        $cell_types[] = 'header';
        $max_text_length = max($max_text_length, strlen($header));
    }
    
    foreach ($rows as $row) {
        foreach ($row as $cell) {
            if ($cell['type'] === 'symbol') {
                $has_symbols = true;
            }
            $max_text_length = max($max_text_length, strlen($cell['text']));
        }
    }
    
    // Responsive Empfehlungen generieren
    $optimizations = mukaan_generate_responsive_optimizations($headers, $column_count, $max_text_length, $has_symbols);
    
    return array(
        'columns' => $column_count,
        'rows' => $row_count,
        'hasHeaders' => !empty($headers),
        'maxTextLength' => $max_text_length,
        'hasSymbols' => $has_symbols,
        'cellTypes' => $cell_types,
        'optimizations' => $optimizations
    );
}

/**
 * Generiert Optimierungsempfehlungen für responsive Darstellung
 */
function mukaan_generate_responsive_optimizations($headers, $column_count, $max_text_length, $has_symbols) {
    // Header-Abkürzungen für mobile Darstellung
    $header_abbreviations = array();
    foreach ($headers as $header) {
        if (strlen($header) > 8) {
            // Einfache Abkürzungslogik
            $words = explode(' ', $header);
            if (count($words) > 1) {
                $abbrev = '';
                foreach ($words as $word) {
                    $abbrev .= substr($word, 0, 3);
                }
                $header_abbreviations[$header] = substr($abbrev, 0, 6);
            } else {
                $header_abbreviations[$header] = substr($header, 0, 6);
            }
        }
    }
    
    // Empfohlene Schriftgrößen basierend auf Spaltenanzahl
    $font_size_recommendations = array(
        'small' => max(10, 16 - $column_count * 2),
        'medium' => max(12, 18 - $column_count * 2),
        'large' => max(14, 20 - $column_count * 2)
    );
    
    // Bestimme ob horizontales Scrollen nötig ist
    $estimated_width = $column_count * ($max_text_length * 8 + 20); // Grobe Schätzung
    $needs_horizontal_scroll = $estimated_width > 350; // Typische mobile Breite
    
    return array(
        'headerAbbreviations' => $header_abbreviations,
        'fontSizeRecommendations' => $font_size_recommendations,
        'needsHorizontalScroll' => $needs_horizontal_scroll,
        'estimatedWidth' => $estimated_width,
        'isComparisonTable' => $has_symbols && $column_count >= 3
    );
}

/**
 * Cache-Invalidierung bei Post-Updates
 */
add_action('save_post', function($post_id) {
    delete_transient('mukaan_table_data_' . $post_id);
});

/**
 * Debug-Endpunkt (nur für Entwicklung)
 */
add_action('rest_api_init', function () {
    register_rest_route('mukaan-app/v1', '/debug-elementor/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => function(WP_REST_Request $request) {
            $post_id = (int) $request['id'];
            $elementor_data = get_post_meta($post_id, '_elementor_data', true);
            
            return new WP_REST_Response(array(
                'post_id' => $post_id,
                'elementor_data' => $elementor_data ? json_decode($elementor_data, true) : null
            ), 200);
        },
        'permission_callback' => '__return_true'
    ));
});
