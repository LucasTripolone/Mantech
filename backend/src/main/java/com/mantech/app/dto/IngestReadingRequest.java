package com.mantech.app.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Lo que envía la placa en cada ciclo. Va en lote: el ESP32 mide las tres
 * magnitudes a la vez y las manda juntas, así es un solo viaje de red.
 */
@Data
public class IngestReadingRequest {

    private String firmwareVersion;

    /** Segundos encendido; sirve para detectar reinicios del dispositivo. */
    private Long uptimeSeconds;

    @NotEmpty(message = "El envío no contiene lecturas.")
    @Valid
    private List<Sample> readings;

    @Data
    public static class Sample {
        @NotBlank(message = "Falta la magnitud medida.")
        private String metric;

        @NotNull(message = "Falta el valor medido.")
        private Double value;

        /** Opcional: si no viene, se usa la unidad canónica de la magnitud. */
        private String unit;
    }
}
