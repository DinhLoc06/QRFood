package com.qrfood.payment;

import com.qrfood.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> requestPayment(@Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment requested", toResponse(paymentService.requestPayment(request))));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getBySession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(ApiResponse.success(toResponse(paymentService.findBySessionId(sessionId))));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(paymentService.findAll().stream().map(this::toResponse).toList()));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Payment confirmed", toResponse(paymentService.confirm(id))));
    }

    private PaymentResponse toResponse(Payment payment) {
        String qrContent = payment.getMethod() == PaymentMethod.QR
                ? "QRFOOD|" + payment.getReferenceCode() + "|" + payment.getAmount().toPlainString()
                : null;
        return PaymentResponse.builder()
                .id(payment.getId())
                .sessionId(payment.getSession().getId())
                .tableNumber(payment.getSession().getTable().getTableNumber())
                .amount(payment.getAmount())
                .method(payment.getMethod().name())
                .status(payment.getStatus().name())
                .referenceCode(payment.getReferenceCode())
                .qrContent(qrContent)
                .createdAt(payment.getCreatedAt())
                .paidAt(payment.getPaidAt())
                .build();
    }
}
