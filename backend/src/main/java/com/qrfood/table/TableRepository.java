package com.qrfood.table;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TableRepository extends JpaRepository<DiningTable, Long> {
    List<DiningTable> findByStatusOrderByCapacityAsc(TableStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from DiningTable t where t.status = :status and t.capacity >= :capacity order by t.capacity asc")
    List<DiningTable> findAvailableForPeopleWithLock(@Param("status") TableStatus status, @Param("capacity") Integer capacity);

    Optional<DiningTable> findByTableNumber(String tableNumber);
}
