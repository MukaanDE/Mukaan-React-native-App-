<?php
/**
 * Custom WordPress REST API Endpoint for Elementor Table Data
 * 
 * This file creates a custom REST API endpoint to extract table data from Elementor-built pages.
 * It retrieves the raw HTML from Elementor widgets, parses it into structured JSON, and returns it for native app consumption.
 * 
 * Place this code in your theme's functions.php or as a custom plugin.
 */

// Register the custom REST API endpoint
add_action('rest_api_init', function () {
    register_rest_route('mukaan-app/v1', '/table-data/(?P<id>\d+)', array(
        'methods' => 'GET',
        'callback' => 'get_elementor_table_data',
        'args' => array(
            'id' => array(
                'validate_callback' => function($param, $request, $key) {
                    return is_numeric($param);
                }
            ),
        ),
        'permission_callback' => '__return_true' // In production, replace with proper authentication
    ));
});

/**
 * Callback function to handle the API request and return table data from Elementor.
 *
 * @param WP_REST_Request $request The REST API request object.
 * @return WP_REST_Response|WP_Error The response containing the table data or an error.
 */
function get_elementor_table_data(WP_REST_Request $request) {
    $post_id = (int) $request['id'];
    $transient_key = 'mukaan_app_table_' . $post_id;

    // Check if data is cached in a transient
    $cached_data = get_transient($transient_key);
    if (false !== $cached_data) {
        return new WP_REST_Response($cached_data, 200);
    }

    // Get Elementor data from post meta
    $elementor_data_json = get_post_meta($post_id, '_elementor_data', true);
    if (empty($elementor_data_json)) {
        return new WP_Error('no_elementor_data', 'No Elementor data found for this page.', array('status' => 404));
    }

    $elementor_data = json_decode($elementor_data_json, true);
    
    // Find the table HTML within Elementor data
    $table_html = find_table_widget_html($elementor_data);
    if (!$table_html) {
        return new WP_Error('no_table_widget', 'No table widget found in Elementor data.', array('status' => 404));
    }

    // Parse the HTML to extract table data
    $dom = new DOMDocument();
    // Suppress errors for malformed HTML
    libxml_use_internal_errors(true);
    // Force UTF-8 encoding
    $dom->loadHTML('<?xml encoding="UTF-8">' . $table_html);
    libxml_clear_errors();

    $xpath = new DOMXPath($dom);
    $table = $xpath->query('//table')->item(0);

    if (!$table) {
        return new WP_Error('no_html_table', 'No HTML table found in the widget content.', array('status' => 404));
    }

    $headers = array();
    $header_nodes = $xpath->query('.//thead/tr/th', $table);
    foreach ($header_nodes as $node) {
        $headers[] = trim($node->textContent);
    }

    $data = array();
    $rows = $xpath->query('.//tbody/tr', $table);
    foreach ($rows as $row) {
        $row_data = array();
        $cells = $xpath->query('.//td', $row);
        foreach ($cells as $index => $cell) {
            if (isset($headers[$index])) {
                $row_data[$headers[$index]] = trim($cell->textContent);
            }
        }
        if (!empty($row_data)) {
            $data[] = $row_data;
        }
    }

    // Cache the result for 1 hour
    if (!empty($data)) {
        set_transient($transient_key, $data, HOUR_IN_SECONDS);
    }

    return new WP_REST_Response($data, 200);
}

/**
 * Helper function to recursively search for table widget HTML in Elementor data.
 *
 * @param array $elements The Elementor data elements to search through.
 * @return string|null The HTML content of the table widget if found, null otherwise.
 */
function find_table_widget_html($elements) {
    foreach ($elements as $element) {
        if (isset($element['widgetType']) && ($element['widgetType'] === 'table' || $element['widgetType'] === 'html')) {
            if (isset($element['settings']['html'])) {
                return $element['settings']['html'];
            }
            // For native Elementor table widgets, additional logic would be needed to reconstruct the table
            // from 'table_rows' settings. Focusing on HTML widget for simplicity.
        }

        if (!empty($element['elements'])) {
            $found_html = find_table_widget_html($element['elements']);
            if ($found_html) {
                return $found_html;
            }
        }
    }
    return null;
}
?>
