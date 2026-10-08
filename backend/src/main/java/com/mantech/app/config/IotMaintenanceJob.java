package com.mantech.app.config;

import com.mantech.app.service.IotService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Limpieza periódica de lecturas de sensores.
 *
 * Una placa reportando cada 10 segundos escribe unas 26 mil filas por día y por
 * magnitud. Sin esto la tabla crece sin techo y la pantalla en vivo —que
 * consulta esa tabla— se degrada con el tiempo.
 */
@Component
@EnableScheduling
@RequiredArgsConstructor
public class IotMaintenanceJob {

    private final IotService iotService;

    /** Cada hora, arrancando una hora después del encendido. */
    @Scheduled(initialDelay = 3_600_000, fixedDelay = 3_600_000)
    public void purge() {
        iotService.purgeOldReadings();
    }
}
