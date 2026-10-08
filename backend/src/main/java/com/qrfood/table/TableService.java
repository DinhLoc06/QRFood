package com.qrfood.table;

import com.qrfood.common.error.BusinessException;
import com.qrfood.common.error.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TableService {
    private final TableRepository tableRepository;

    public List<DiningTable> findAll() {
        return tableRepository.findAll();
    }

    public List<DiningTable> findAvailable() {
        return tableRepository.findByStatusOrderByCapacityAsc(TableStatus.AVAILABLE);
    }

    public DiningTable findById(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.TABLE_NOT_AVAILABLE, "Table not found", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public DiningTable assignForPeople(Integer numberOfPeople) {
        List<DiningTable> candidateTables = tableRepository.findAvailableForPeopleWithLock(TableStatus.AVAILABLE, numberOfPeople);
        if (candidateTables.isEmpty()) {
            throw new BusinessException(ErrorCode.NO_TABLE_AVAILABLE, "No suitable table is currently available.", HttpStatus.CONFLICT);
        }

        DiningTable table = candidateTables.get(0);
        table.setStatus(TableStatus.OCCUPIED);
        return tableRepository.save(table);
    }

    @Transactional
    public DiningTable release(Long tableId) {
        DiningTable table = findById(tableId);
        table.setStatus(TableStatus.AVAILABLE);
        return tableRepository.save(table);
    }

    @Transactional
    public DiningTable save(TableRequest request) {
        DiningTable table = DiningTable.builder()
                .tableNumber(request.getTableNumber())
                .capacity(request.getCapacity())
                .status(request.getStatus() == null ? TableStatus.AVAILABLE : request.getStatus())
                .build();
        return tableRepository.save(table);
    }
}
