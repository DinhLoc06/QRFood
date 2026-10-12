package com.qrfood.payment;

import com.qrfood.common.error.BusinessException;
import com.qrfood.common.error.ErrorCode;
import com.qrfood.order.Order;
import com.qrfood.order.OrderStatus;
import com.qrfood.session.DiningSession;
import com.qrfood.session.SessionService;
import com.qrfood.session.SessionStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final SessionService sessionService;

    @Transactional
    public Payment requestPayment(PaymentRequest request) {
        Payment existing = paymentRepository.findBySessionId(request.getSessionId()).orElse(null);
        if (existing != null) {
            if (existing.getStatus() == PaymentStatus.PENDING && existing.getMethod() != request.getMethod()) {
                existing.setMethod(request.getMethod());
                return paymentRepository.save(existing);
            }
            return existing;
        }

        DiningSession session = sessionService.findById(request.getSessionId());
        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.INVALID_PAYMENT_STATUS, "Session is not available for payment", HttpStatus.BAD_REQUEST);
        }
        if (session.getOrders().isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_PAYMENT_STATUS, "Session has no orders", HttpStatus.BAD_REQUEST);
        }
        boolean unfinished = session.getOrders().stream().anyMatch(order ->
                order.getStatus() != OrderStatus.COMPLETED && order.getStatus() != OrderStatus.CANCELLED);
        if (unfinished) {
            throw new BusinessException(ErrorCode.INVALID_PAYMENT_STATUS, "All orders must be completed before requesting payment", HttpStatus.BAD_REQUEST);
        }

        BigDecimal amount = session.getOrders().stream()
                .filter(order -> order.getStatus() != OrderStatus.CANCELLED)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (amount.signum() <= 0) {
            throw new BusinessException(ErrorCode.INVALID_PAYMENT_STATUS, "Payment amount must be positive", HttpStatus.BAD_REQUEST);
        }

        session.setStatus(SessionStatus.WAITING_PAYMENT);
        Payment payment = Payment.builder()
                .session(session)
                .amount(amount)
                .method(request.getMethod())
                .status(PaymentStatus.PENDING)
                .referenceCode("QRF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();
        return paymentRepository.save(payment);
    }

    public Payment findBySessionId(Long sessionId) {
        return paymentRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND, "Payment not found", HttpStatus.NOT_FOUND));
    }

    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    @Transactional
    public Payment confirm(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.PAYMENT_NOT_FOUND, "Payment not found", HttpStatus.NOT_FOUND));
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new BusinessException(ErrorCode.INVALID_PAYMENT_STATUS, "Only pending payments can be confirmed", HttpStatus.BAD_REQUEST);
        }
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        Payment saved = paymentRepository.save(payment);
        sessionService.closeSession(payment.getSession().getId());
        return saved;
    }
}
