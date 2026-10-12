package com.qrfood;

import com.qrfood.order.Order;
import com.qrfood.order.OrderRepository;
import com.qrfood.order.OrderStatus;
import com.qrfood.payment.*;
import com.qrfood.session.DiningSession;
import com.qrfood.session.SessionRepository;
import com.qrfood.session.SessionStatus;
import com.qrfood.table.DiningTable;
import com.qrfood.table.TableRepository;
import com.qrfood.table.TableStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.annotation.DirtiesContext;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class PaymentFlowIntegrationTest {
    @Autowired private PaymentService paymentService;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private SessionRepository sessionRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private TableRepository tableRepository;

    @Test
    void confirmsPaymentThenClosesSessionAndReleasesTable() {
        DiningTable table = tableRepository.save(DiningTable.builder()
                .tableNumber("PAY-01")
                .capacity(4)
                .status(TableStatus.OCCUPIED)
                .build());
        DiningSession session = sessionRepository.save(DiningSession.builder()
                .table(table)
                .numberOfPeople(2)
                .status(SessionStatus.ACTIVE)
                .startedAt(LocalDateTime.now())
                .build());
        orderRepository.save(Order.builder()
                .session(session)
                .status(OrderStatus.COMPLETED)
                .totalAmount(new BigDecimal("90000.00"))
                .completedAt(LocalDateTime.now())
                .build());

        PaymentRequest request = new PaymentRequest();
        request.setSessionId(session.getId());
        request.setMethod(PaymentMethod.QR);
        Payment payment = paymentService.requestPayment(request);

        assertThat(payment.getAmount()).isEqualByComparingTo("90000.00");
        assertThat(sessionRepository.findById(session.getId()).orElseThrow().getStatus())
                .isEqualTo(SessionStatus.WAITING_PAYMENT);

        paymentService.confirm(payment.getId());

        assertThat(paymentRepository.findById(payment.getId()).orElseThrow().getStatus())
                .isEqualTo(PaymentStatus.PAID);
        assertThat(sessionRepository.findById(session.getId()).orElseThrow().getStatus())
                .isEqualTo(SessionStatus.COMPLETED);
        assertThat(tableRepository.findById(table.getId()).orElseThrow().getStatus())
                .isEqualTo(TableStatus.AVAILABLE);
    }
}
