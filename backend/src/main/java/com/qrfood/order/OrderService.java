package com.qrfood.order;

import com.qrfood.common.error.BusinessException;
import com.qrfood.common.error.ErrorCode;
import com.qrfood.product.Product;
import com.qrfood.product.ProductRepository;
import com.qrfood.session.DiningSession;
import com.qrfood.session.SessionService;
import com.qrfood.session.SessionStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final SessionService sessionService;

    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND, "Order not found", HttpStatus.NOT_FOUND));
    }

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    @Transactional
    public Order createOrder(OrderRequest request) {
        DiningSession session = sessionService.findById(request.getSessionId());
        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS, "Only active sessions may place an order", HttpStatus.BAD_REQUEST);
        }

        Order order = Order.builder()
                .session(session)
                .status(OrderStatus.PENDING)
                .note(request.getNote())
                .totalAmount(BigDecimal.ZERO)
                .build();

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_NOT_FOUND, "Product not found", HttpStatus.NOT_FOUND));
            if (!product.isAvailable()) {
                throw new BusinessException(ErrorCode.PRODUCT_OUT_OF_STOCK, "Product is currently unavailable", HttpStatus.BAD_REQUEST);
            }
            BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            total = total.add(subtotal);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(product.getPrice())
                    .subtotal(subtotal)
                    .note(itemRequest.getNote())
                    .build();
            items.add(item);
        }

        order.setItems(items);
        order.setTotalAmount(total);
        Order saved = orderRepository.save(order);
        for (OrderItem item : items) {
            item.setOrder(saved);
        }
        return orderRepository.save(saved);
    }

    @Transactional
    public Order confirmOrder(Long orderId) {
        Order order = findById(orderId);
        validateTransition(order.getStatus(), OrderStatus.CONFIRMED);
        order.setStatus(OrderStatus.CONFIRMED);
        order.setConfirmedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Transactional
    public Order rejectOrder(Long orderId, String reason) {
        Order order = findById(orderId);
        validateTransition(order.getStatus(), OrderStatus.CANCELLED);
        order.setStatus(OrderStatus.CANCELLED);
        order.setRejectedReason(reason == null || reason.isBlank() ? "Rejected by staff" : reason);
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateStatus(Long orderId, String statusValue) {
        Order order = findById(orderId);
        OrderStatus targetStatus = OrderStatus.valueOf(statusValue.toUpperCase());
        validateTransition(order.getStatus(), targetStatus);
        order.setStatus(targetStatus);
        if (targetStatus == OrderStatus.COMPLETED) {
            order.setCompletedAt(LocalDateTime.now());
        }
        return orderRepository.save(order);
    }

    private void validateTransition(OrderStatus current, OrderStatus next) {
        if (current == OrderStatus.PENDING && next == OrderStatus.CONFIRMED) return;
        if (current == OrderStatus.PENDING && next == OrderStatus.CANCELLED) return;
        if (current == OrderStatus.CONFIRMED && next == OrderStatus.PREPARING) return;
        if (current == OrderStatus.CONFIRMED && next == OrderStatus.CANCELLED) return;
        if (current == OrderStatus.PREPARING && next == OrderStatus.READY) return;
        if (current == OrderStatus.READY && next == OrderStatus.SERVED) return;
        if (current == OrderStatus.SERVED && next == OrderStatus.COMPLETED) return;
        throw new BusinessException(ErrorCode.INVALID_ORDER_STATUS, "Invalid order status transition: " + current + " -> " + next, HttpStatus.BAD_REQUEST);
    }
}
