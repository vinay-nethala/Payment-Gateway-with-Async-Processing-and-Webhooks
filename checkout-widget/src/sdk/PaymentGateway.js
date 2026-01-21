/**
 * Payment Gateway SDK
 * Embeddable JavaScript SDK for accepting payments
 * 
 * Usage:
 * const checkout = new PaymentGateway({
 *   key: 'key_test_abc123',
 *   orderId: 'order_xyz',
 *   onSuccess: (response) => console.log('Success:', response),
 *   onFailure: (error) => console.log('Failed:', error),
 *   onClose: () => console.log('Closed')
 * });
 * checkout.open();
 */

(function (window) {
  'use strict';

  class PaymentGateway {
    constructor(options) {
      // Validate required options
      if (!options || !options.key) {
        throw new Error('PaymentGateway: API key is required');
      }
      if (!options.orderId) {
        throw new Error('PaymentGateway: orderId is required');
      }

      this.config = {
        key: options.key,
        orderId: options.orderId,
        checkoutUrl: options.checkoutUrl || 'http://localhost:3001',
        onSuccess: options.onSuccess || function () { },
        onFailure: options.onFailure || function () { },
        onClose: options.onClose || function () { }
      };

      this.modal = null;
      this.iframe = null;
      this.messageHandler = this._handleMessage.bind(this);
    }

    /**
     * Open payment modal
     */
    open() {
      if (this.modal) {
        console.warn('PaymentGateway: Modal is already open');
        return;
      }

      this._createModal();
      this._setupMessageListener();
    }

    /**
     * Close payment modal
     */
    close() {
      if (!this.modal) {
        return;
      }

      // Remove modal from DOM
      document.body.removeChild(this.modal);
      this.modal = null;
      this.iframe = null;

      // Remove message listener
      window.removeEventListener('message', this.messageHandler);

      // Call onClose callback
      this.config.onClose();
    }

    /**
     * Create modal overlay with iframe
     * @private
     */
    _createModal() {
      // Create modal container
      const modal = document.createElement('div');
      modal.id = 'payment-gateway-modal';
      modal.setAttribute('data-test-id', 'payment-modal');
      modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            `;

      // Create modal content wrapper
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      modalContent.style.cssText = `
                position: relative;
                width: 90%;
                max-width: 500px;
                height: 600px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                animation: slideUp 0.3s ease-out;
            `;

      // Create close button
      const closeButton = document.createElement('button');
      closeButton.setAttribute('data-test-id', 'close-modal-button');
      closeButton.innerHTML = '×';
      closeButton.style.cssText = `
                position: absolute;
                top: 16px;
                right: 16px;
                width: 32px;
                height: 32px;
                border: none;
                background: rgba(0, 0, 0, 0.1);
                color: #333;
                font-size: 24px;
                line-height: 1;
                border-radius: 50%;
                cursor: pointer;
                z-index: 10;
                transition: background 0.2s;
            `;
      closeButton.onmouseover = () => {
        closeButton.style.background = 'rgba(0, 0, 0, 0.2)';
      };
      closeButton.onmouseout = () => {
        closeButton.style.background = 'rgba(0, 0, 0, 0.1)';
      };
      closeButton.onclick = () => this.close();

      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.setAttribute('data-test-id', 'payment-iframe');
      const iframeUrl = `${this.config.checkoutUrl}?order_id=${this.config.orderId}&embedded=true&key=${this.config.key}`;
      iframe.src = iframeUrl;
      iframe.style.cssText = `
                width: 100%;
                height: 100%;
                border: none;
                display: block;
            `;
      iframe.setAttribute('allow', 'payment');

      // Assemble modal
      modalContent.appendChild(closeButton);
      modalContent.appendChild(iframe);
      modal.appendChild(modalContent);

      // Add animation keyframes
      if (!document.getElementById('payment-gateway-styles')) {
        const style = document.createElement('style');
        style.id = 'payment-gateway-styles';
        style.textContent = `
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(50px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `;
        document.head.appendChild(style);
      }

      // Add to DOM
      document.body.appendChild(modal);

      this.modal = modal;
      this.iframe = iframe;

      // Close on overlay click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.close();
        }
      });
    }

    /**
     * Setup postMessage listener for iframe communication
     * @private
     */
    _setupMessageListener() {
      window.addEventListener('message', this.messageHandler);
    }

    /**
     * Handle messages from iframe
     * @private
     */
    _handleMessage(event) {
      // Validate origin (in production, check against your domain)
      // if (event.origin !== this.config.checkoutUrl) return;

      const { type, data } = event.data;

      switch (type) {
        case 'payment_success':
          this.config.onSuccess(data);
          this.close();
          break;

        case 'payment_failed':
          this.config.onFailure(data);
          break;

        case 'close_modal':
          this.close();
          break;

        default:
          // Ignore unknown message types
          break;
      }
    }
  }

  // Expose globally
  window.PaymentGateway = PaymentGateway;

  // AMD support
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return PaymentGateway;
    });
  }

  // CommonJS support
  if (typeof module === 'object' && module.exports) {
    module.exports = PaymentGateway;
  }

})(typeof window !== 'undefined' ? window : this);
