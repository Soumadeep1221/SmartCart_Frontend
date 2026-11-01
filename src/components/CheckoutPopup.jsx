import axios, { getProductImageUrl } from '../axios';
import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { formatCurrency } from '../utils/formatters';
import unplugged from '../assets/unplugged.png';
import { useAuth } from '../Context/AuthContext';

const CheckoutPopup = ({ show, handleClose, cartItems, totalPrice, onOrderSuccess }) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const normalizeOrderErrors = (rawErrors) => {
    const normalized = {};

    if (!rawErrors || typeof rawErrors !== 'object' || Array.isArray(rawErrors)) {
      return normalized;
    }

    Object.entries(rawErrors).forEach(([fieldName, fieldError]) => {
      const rawMessage = Array.isArray(fieldError)
        ? fieldError.join(' ')
        : typeof fieldError === 'object' && fieldError !== null
          ? Object.values(fieldError).flat().join(' ')
          : fieldError;

      if (!rawMessage) return;

      const normalizedField = {
        customerName: 'name',
        customer_name: 'name',
        fullName: 'name',
        name: 'name'
      }[fieldName] || fieldName;

      normalized[normalizedField] = String(rawMessage);
    });

    return normalized;
  };

  const handleConfirm = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    const orderItems = cartItems.map(item => ({
      productId: item.id,
      quantity: item.quantity
    }));

    const data = {
      customerName: name,
      items: orderItems
    };

    try {
      const response = await axios.post(`/orders/place`, data);
      console.log(response, 'order placed');

      // Call the success callback with customer details
      onOrderSuccess(name);
      
      // Reset form
      setName('');
      setValidated(false);
      
    } catch (error) {
      console.log(error);

      if (error.response?.status === 400) {
        const payload = error.response?.data;
        const normalizedErrors = normalizeOrderErrors(payload);

        if (Object.keys(normalizedErrors).length > 0) {
          setFieldErrors(normalizedErrors);
          setError('');
          return;
        }

        const fallbackMessage = typeof payload === 'string'
          ? payload
          : payload?.message || payload?.detail || 'Please check the form and try again.';

        setFieldErrors({});
        setError(fallbackMessage);
        return;
      }

      // Handle 409 Conflict error (Insufficient stock)
      if (error.response?.status === 409) {
        const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Product is out of stock.';
        setFieldErrors({});
        setError(errorMessage.includes('Insufficient stock') ? errorMessage : 'Product is out of stock. Please check your cart.');
      } else {
        setFieldErrors({});
        setError('Failed to place order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (show && user?.name && !name) setName(user.name);
  }, [show, user, name]);

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      centered 
      size="lg"
      className="checkout-modal"
    >
      <Modal.Header 
        closeButton 
        className="border-0 pb-2"
        style={{ 
          backgroundColor: 'var(--gray-50)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0'
        }}
      >
        <Modal.Title className="fw-bold" style={{ color: 'var(--gray-900)' }}>
          <i className="bi bi-credit-card me-2" style={{ color: 'var(--primary-color)' }}></i>
          Checkout
        </Modal.Title>
      </Modal.Header>
      
      <Form noValidate validated={validated} onSubmit={handleConfirm}>
        <Modal.Body className="p-4">
          {error && (
            <div className="alert alert-danger animate-slideInUp" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {Object.keys(fieldErrors).length > 0 && (
            <div className="alert alert-danger animate-slideInUp" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <ul className="mb-0 ps-3">
                {Object.entries(fieldErrors).map(([fieldName, message]) => (
                  <li key={fieldName}>{fieldName === 'name' ? 'Full Name' : fieldName}: {message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Order Items */}
          <div className="checkout-items mb-4">
            <h5 className="mb-3 fw-semibold" style={{ color: 'var(--gray-900)' }}>
              Order Summary
            </h5>
            
            <div 
              className="border rounded-lg p-3 mb-4"
              style={{ 
                backgroundColor: 'var(--gray-50)',
                borderColor: 'var(--gray-200)',
                maxHeight: '300px',
                overflowY: 'auto'
              }}
            >
              {cartItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="d-flex align-items-center p-3 mb-3 bg-white rounded-lg animate-slideInUp"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    border: '1px solid var(--gray-200)'
                  }}
                >
                  <img
                    src={getProductImageUrl(item.id)}
                    alt={item.name}
                    className="me-3 rounded"
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      objectFit: 'cover',
                      border: '2px solid var(--gray-200)'
                    }}
                    onError={(e) => {
                      e.target.src = unplugged;
                    }}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1 fw-semibold" style={{ color: 'var(--gray-900)' }}>
                      {item.name}
                    </h6>
                    <p className="mb-1 text-muted small">by {item.brand}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">Qty: {item.quantity}</span>
                      <span className="fw-bold" style={{ color: 'var(--primary-color)' }}>
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div 
              className="d-flex justify-content-between align-items-center p-3 rounded-lg"
              style={{ backgroundColor: 'var(--primary-light)' }}
            >
              <h5 className="mb-0 fw-bold" style={{ color: 'var(--primary-color)' }}>
                Total Amount:
              </h5>
              <h4 className="mb-0 fw-bold" style={{ color: 'var(--primary-color)' }}>
                {formatCurrency(totalPrice)}
              </h4>
            </div>
          </div>

          {/* Customer Information */}
          <div className="customer-info">
            <h5 className="mb-3 fw-semibold" style={{ color: 'var(--gray-900)' }}>
              Customer Information
            </h5>
            
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label className="fw-medium" style={{ color: 'var(--gray-700)' }}>
                    Full Name *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                      if (fieldErrors.name) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.name;
                          return next;
                        });
                      }
                    }}
                    required
                    isInvalid={Boolean(fieldErrors.name) || (validated && !name)}
                    style={{
                      borderColor: 'var(--gray-300)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem'
                    }}
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.name || 'Please provide your full name.'}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
              
            </div>


          </div>
        </Modal.Body>
        
        <Modal.Footer 
          className="border-0 pt-0 px-4 pb-4"
          style={{ backgroundColor: 'white' }}
        >
          <div className="w-100 d-flex gap-3">
            <Button 
              variant="outline-secondary" 
              onClick={handleClose} 
              disabled={isSubmitting}
              className="flex-fill"
              style={{
                borderRadius: 'var(--radius-md)',
                fontWeight: '500',
                padding: '0.75rem'
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSubmitting}
              className="flex-fill"
              style={{
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                padding: '0.75rem'
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing Order...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Place Order
                </>
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Form>
      
      <style>{`
        .checkout-modal .modal-content {
          border: none;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
        }
      `}</style>
    </Modal>
  );
};

export default CheckoutPopup;