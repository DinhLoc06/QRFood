package com.qrfood.order;

import com.qrfood.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderRequest request) {
        Order order = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Order created", toResponse(order)));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(toResponse(orderService.findById(id))));
    }

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'KITCHEN')")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> listOrders() {
        List<OrderResponse> orders = orderService.findAll().stream().map(this::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PutMapping("/orders/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Order confirmed", toResponse(orderService.confirmOrder(id))));
    }

    @PutMapping("/orders/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<OrderResponse>> rejectOrder(@PathVariable Long id, @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.success("Order rejected", toResponse(orderService.rejectOrder(id, reason))));
    }

    @PutMapping("/orders/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or " +
            "(hasRole('KITCHEN') and (#status == 'PREPARING' or #status == 'READY')) or " +
            "(hasRole('STAFF') and (#status == 'SERVED' or #status == 'COMPLETED'))")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Order status updated", toResponse(orderService.updateStatus(id, status))));
    }

    private OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .sessionId(order.getSession().getId())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .rejectedReason(order.getRejectedReason())
                .items(order.getItems().stream().map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .note(item.getNote())
                        .build()).toList())
                .build();
    }
}
