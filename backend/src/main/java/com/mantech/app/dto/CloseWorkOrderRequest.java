package com.mantech.app.dto;

import lombok.Data;

@Data
public class CloseWorkOrderRequest {

    private String resolutionNotes;

    // Firma digital simple: nombre de quien cierra la orden.
    private String signature;
}
