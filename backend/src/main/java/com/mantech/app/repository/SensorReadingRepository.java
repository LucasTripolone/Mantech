package com.mantech.app.repository;

import com.mantech.app.domain.SensorReading;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    /** Últimas lecturas de una métrica para una máquina (para la serie del gráfico). */
    List<SensorReading> findByMachineIdAndMetricOrderByRecordedAtDesc(Long machineId, String metric, Pageable pageable);

    /** Últimas lecturas de un dispositivo, sin importar la métrica. */
    List<SensorReading> findByDeviceIdOrderByRecordedAtDesc(Long deviceId, Pageable pageable);

    /**
     * La última lectura de cada métrica para un dispositivo, en una sola
     * consulta: recorrer métrica por métrica sería N+1 sobre el camino más
     * caliente de la pantalla en vivo.
     */
    @Query("""
            SELECT r FROM SensorReading r
            WHERE r.device.id = :deviceId
              AND r.recordedAt = (
                  SELECT MAX(r2.recordedAt) FROM SensorReading r2
                  WHERE r2.device.id = :deviceId AND r2.metric = r.metric
              )
            """)
    List<SensorReading> findLatestPerMetricByDevice(@Param("deviceId") Long deviceId);

    /** Limpieza por antigüedad: un sensor a 10 s genera ~26 mil filas por día. */
    @Modifying
    @Query("DELETE FROM SensorReading r WHERE r.recordedAt < :cutoff")
    int deleteOlderThan(@Param("cutoff") LocalDateTime cutoff);

    long countByDeviceId(Long deviceId);
}
