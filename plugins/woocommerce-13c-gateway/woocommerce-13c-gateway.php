<?php
/**
 * Plugin Name: 13C Crypto Payment Gateway for WooCommerce
 * Plugin URI: https://13c.dev
 * Description: Accept self-hosted cryptocurrency payments (USDT on TRON, BSC, Polygon, Solana) with zero platform percentage fees.
 * Version: 1.0.0
 * Author: Gonzhilaz Dev & DeepMind Team
 * Author URI: https://github.com/gonzhilaz/bpg
 * Text Domain: woocommerce-13c-gateway
 * Domain Path: /languages
 * Requires at least: 5.6
 * Tested up to: 6.7
 * WC requires at least: 5.0
 * WC tested up to: 9.4
 * License: MIT
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Hook gateway registration into WooCommerce
add_filter('woocommerce_payment_gateways', 'wc_13c_add_gateway_class');
function wc_13c_add_gateway_class($gateways) {
    $gateways[] = 'WC_Gateway_13C';
    return $gateways;
}

// Initialize Gateway Class
add_action('plugins_loaded', 'wc_13c_init_gateway_class');
function wc_13c_init_gateway_class() {
    if (!class_exists('WC_Payment_Gateway')) {
        return;
    }

    class WC_Gateway_13C extends WC_Payment_Gateway {

        public function __construct() {
            $this->id                 = '13c_gateway';
            $this->icon               = apply_filters('woocommerce_13c_icon', '');
            $this->has_fields         = false;
            $this->method_title       = __('13C Crypto Payment Gateway', 'woocommerce-13c-gateway');
            $this->method_description = __('Accept multi-chain cryptocurrency payments directly to your self-hosted 13C vault.', 'woocommerce-13c-gateway');

            $this->supports = array('products');

            // Load settings schema and initialize
            $this->init_form_fields();
            $this->init_settings();

            $this->title        = $this->get_option('title');
            $this->description  = $this->get_option('description');
            $this->enabled      = $this->get_option('enabled');
            $this->gateway_url  = rtrim($this->get_option('gateway_url', 'http://localhost:8080'), '/');
            $this->api_key      = $this->get_option('api_key');
            $this->secret_key   = $this->get_option('secret_key');
            $this->pay_network  = $this->get_option('pay_network', 'TRON');
            $this->fee_payer    = $this->get_option('fee_payer', 'customer');

            // Save settings action hook in admin
            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));

            // Webhook handler callback hook: ?wc-api=wc_gateway_13c
            add_action('woocommerce_api_wc_gateway_13c', array($this, 'handle_webhook_callback'));
        }

        public function init_form_fields() {
            $this->form_fields = array(
                'enabled' => array(
                    'title'   => __('Enable/Disable', 'woocommerce-13c-gateway'),
                    'type'    => 'checkbox',
                    'label'   => __('Enable 13C Crypto Payment Gateway', 'woocommerce-13c-gateway'),
                    'default' => 'yes',
                ),
                'title' => array(
                    'title'       => __('Title', 'woocommerce-13c-gateway'),
                    'type'        => 'text',
                    'description' => __('Payment method title displayed to customer during checkout.', 'woocommerce-13c-gateway'),
                    'default'     => __('Crypto Payment (USDT / Multi-Chain)', 'woocommerce-13c-gateway'),
                    'desc_tip'    => true,
                ),
                'description' => array(
                    'title'       => __('Description', 'woocommerce-13c-gateway'),
                    'type'        => 'textarea',
                    'description' => __('Description displayed to customer at checkout.', 'woocommerce-13c-gateway'),
                    'default'     => __('Pay seamlessly with USDT on TRON (TRC20), BSC (BEP20), Polygon, or Solana.', 'woocommerce-13c-gateway'),
                ),
                'gateway_url' => array(
                    'title'       => __('13C Gateway Endpoint URL', 'woocommerce-13c-gateway'),
                    'type'        => 'text',
                    'description' => __('Base URL of your 13C backend (e.g., https://pay.yourdomain.com or http://localhost:8080).', 'woocommerce-13c-gateway'),
                    'default'     => 'http://localhost:8080',
                    'desc_tip'    => true,
                ),
                'api_key' => array(
                    'title'       => __('Merchant API Key', 'woocommerce-13c-gateway'),
                    'type'        => 'text',
                    'description' => __('Your 13C merchant API key starting with 13c_live_ or 13c_test_.', 'woocommerce-13c-gateway'),
                    'default'     => '',
                ),
                'secret_key' => array(
                    'title'       => __('Merchant Secret Key', 'woocommerce-13c-gateway'),
                    'type'        => 'password',
                    'description' => __('Secret Key used to cryptographically verify HMAC-SHA256 webhook signatures.', 'woocommerce-13c-gateway'),
                    'default'     => '',
                ),
                'pay_network' => array(
                    'title'       => __('Default Settlement Network', 'woocommerce-13c-gateway'),
                    'type'        => 'select',
                    'description' => __('Primary blockchain network for invoice generation.', 'woocommerce-13c-gateway'),
                    'default'     => 'TRON',
                    'options'     => array(
                        'TRON'    => 'TRON (TRC-20 USDT)',
                        'BSC'     => 'BNB Smart Chain (BEP-20 USDT)',
                        'POLYGON' => 'Polygon (USDT)',
                        'SOLANA'  => 'Solana (SPL USDT)',
                    ),
                ),
                'fee_payer' => array(
                    'title'       => __('Blockchain Gas Fee Payer', 'woocommerce-13c-gateway'),
                    'type'        => 'select',
                    'description' => __('Who pays on-chain sweep gas: Customer adds to total, or Merchant absorbs.', 'woocommerce-13c-gateway'),
                    'default'     => 'customer',
                    'options'     => array(
                        'customer' => __('Customer pays fee at checkout', 'woocommerce-13c-gateway'),
                        'merchant' => __('Merchant absorbs fee from payout', 'woocommerce-13c-gateway'),
                    ),
                ),
            );
        }

        public function process_payment($order_id) {
            $order = wc_get_order($order_id);
            if (!$order) {
                wc_add_notice(__('Order not found.', 'woocommerce-13c-gateway'), 'error');
                return array('result' => 'fail');
            }

            if (empty($this->api_key)) {
                wc_add_notice(__('13C Gateway is not properly configured. Missing API Key.', 'woocommerce-13c-gateway'), 'error');
                return array('result' => 'fail');
            }

            $amount   = (float)$order->get_total();
            $currency = $order->get_currency();
            $callback = WC()->api_request_url('wc_gateway_13c');

            $payload = array(
                'order_id'     => 'WC-' . $order->get_id(),
                'amount'       => (string)$amount,
                'currency'     => $currency,
                'pay_currency' => 'USDT',
                'pay_network'  => $this->pay_network,
                'fee_payer'    => $this->fee_payer,
                'callback_url' => $callback,
            );

            // Dispatch HTTP POST request to 13C Payment Gateway
            $endpoint = $this->gateway_url . '/api/v1/invoices';
            $response = wp_remote_post($endpoint, array(
                'method'      => 'POST',
                'timeout'     => 15,
                'headers'     => array(
                    'Content-Type' => 'application/json',
                    'X-API-KEY'    => $this->api_key,
                ),
                'body'        => wp_json_encode($payload),
                'data_format' => 'body',
            ));

            if (is_wp_error($response)) {
                wc_add_notice(__('Failed to connect to 13C Payment Gateway: ', 'woocommerce-13c-gateway') . $response->get_error_message(), 'error');
                return array('result' => 'fail');
            }

            $status_code = wp_remote_retrieve_response_code($response);
            $body        = json_decode(wp_remote_retrieve_body($response), true);

            if ($status_code !== 201 || empty($body['data']['id'])) {
                $err_msg = isset($body['message']) ? $body['message'] : __('Gateway invoice generation rejected.', 'woocommerce-13c-gateway');
                wc_add_notice(__('13C Gateway Error: ', 'woocommerce-13c-gateway') . $err_msg, 'error');
                return array('result' => 'fail');
            }

            $invoice_id = $body['data']['id'];

            // Store invoice ID in order meta
            $order->update_meta_data('_13c_invoice_id', $invoice_id);
            $order->update_meta_data('_13c_deposit_address', $body['data']['deposit_address']);
            $order->update_meta_data('_13c_pay_amount', $body['data']['pay_amount']);
            $order->save();

            // Mark as on-hold (awaiting blockchain deposit)
            $order->update_status('on-hold', sprintf(
                __('13C Gateway: Awaiting %s %s deposit on %s. Ephemeral Address: %s', 'woocommerce-13c-gateway'),
                $body['data']['pay_amount'],
                $body['data']['pay_currency'],
                $body['data']['pay_network'],
                $body['data']['deposit_address']
            ));

            // Reduce stock
            wc_reduce_stock_levels($order_id);

            // Empty cart
            WC()->cart->empty_cart();

            // Resolve checkout URL (either demo-sandbox hosted, gateway direct, or custom)
            $checkout_url = $this->gateway_url . '/checkout/' . $invoice_id;

            return array(
                'result'   => 'success',
                'redirect' => $checkout_url,
            );
        }

        public function handle_webhook_callback() {
            $raw_body  = file_get_contents('php://input');
            $signature = isset($_SERVER['HTTP_X_13C_SIGNATURE']) ? sanitize_text_field($_SERVER['HTTP_X_13C_SIGNATURE']) : '';

            if (empty($raw_body)) {
                wp_send_json_error(array('message' => 'Empty webhook payload'), 400);
            }

            // Cryptographic HMAC-SHA256 signature verification
            if (!empty($this->secret_key)) {
                $expected_sig = hash_hmac('sha256', $raw_body, $this->secret_key);
                if (!hash_equals($expected_sig, $signature)) {
                    wp_send_json_error(array('message' => 'Invalid cryptographic signature'), 401);
                }
            }

            $data = json_decode($raw_body, true);
            if (!isset($data['event']) || !isset($data['order_id'])) {
                wp_send_json_error(array('message' => 'Malformed payload'), 400);
            }

            $order_id_raw = str_replace('WC-', '', $data['order_id']);
            $order        = wc_get_order((int)$order_id_raw);

            if (!$order) {
                wp_send_json_error(array('message' => 'Associated WooCommerce order not found'), 404);
            }

            $event = $data['event'];
            if ($event === 'invoice.paid') {
                $tx_hash = isset($data['data']['tx_hash']) ? $data['data']['tx_hash'] : 'Verified On-Chain';
                $order->payment_complete($tx_hash);
                $order->add_order_note(sprintf(
                    __('13C Gateway: Payment verified on-chain! Received: %s USDT (Tx: %s)', 'woocommerce-13c-gateway'),
                    isset($data['data']['received_amount']) ? $data['data']['received_amount'] : 'Full',
                    $tx_hash
                ));
            } elseif ($event === 'invoice.underpaid') {
                $order->add_order_note(sprintf(
                    __('13C Gateway WARNING: Underpayment received (%s of %s USDT). Awaiting full settlement.', 'woocommerce-13c-gateway'),
                    isset($data['data']['received_amount']) ? $data['data']['received_amount'] : 'Partial',
                    isset($data['data']['pay_amount']) ? $data['data']['pay_amount'] : 'Target'
                ));
            } elseif ($event === 'invoice.expired') {
                $order->update_status('cancelled', __('13C Gateway: Invoice countdown expired without on-chain payment.', 'woocommerce-13c-gateway'));
            }

            wp_send_json_success(array('status' => 'processed', 'event' => $event));
        }
    }
}

