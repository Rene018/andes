# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ANDES** is a data directory for managing production and delivery of 3D-printed educational and accessibility resources ("recursos didácticos") for institutions and individuals in Colombia. There is no application code — the repository consists entirely of CSV data files.

All numeric values use **comma as decimal separator** (Spanish locale, e.g., `4,2` = 4.2). Dates are `YYYY-MM-DD`.

## Data Files and Their Purpose

| File | ID Prefix | Description |
|---|---|---|
| `Inventario de Materiales.csv` | MAT-XXX | Raw filament/resin stock vs. min/max thresholds |
| `Catalogo de Recursos.csv` | RD-XXX | Master product catalog: 25 resources with cost, material, STL filename |
| `Tiempos de Produccion.csv` | RD-XXX | Print time, post-processing time, speed, piece count per resource |
| `Inventario de Productos.csv` | RD-XXX | Finished goods: produced / delivered / available / in-production / reserved |
| `Estados de Solicitudes.csv` | SOL-XXX | Production orders from institutions with pipeline status |
| `Satisfaccion de Instituciones.csv` | EVL-XXX | Institution satisfaction ratings (1–5) across 4 dimensions |
| `Satisfaccion de Clientes.csv` | CL-XXX | Individual client ratings (docentes, cuidadores, beneficiarios) |
| `Catalogo Modelos 3D.csv` | M-XXX | Commercial opportunity catalog (20 product lines, not yet in production) |

## Key Relationships

- `RD-XXX` IDs are shared across **Catalogo de Recursos**, **Tiempos de Produccion**, and **Inventario de Productos** — they are the primary product key.
- **Estados de Solicitudes** references resources by name (not ID); the `Recurso Solicitado` field matches `Nombre del Recurso` in the catalog.
- **Material types** in the resource catalog (`PLA`, `PLA+`, `PETG`, `TPU`, `ABS`, `Resina`) correspond to the `Tipo` field in **Inventario de Materiales**.
- Satisfaction files (EVL/CL) reference products by name, not by ID.

## Production Pipeline

Orders in **Estados de Solicitudes** flow through these states in order:

`Recibida` → `En Produccion` → `Revision de Calidad` → `Empaque y Transporte` → `Entregada`

## Product Categories

Resources are grouped into 6 categories used consistently across files:
- `Accesibilidad Visual` — braille tools, tactile rulers, etc.
- `Material Didactico` — maps, geometry sets, clocks, abacus
- `Comunicacion Aumentativa` — AAC boards
- `Accesibilidad Motriz` — pencil grips, book holders
- `Figuras Didacticas` — anatomical models, solar system, historical replicas
- `Accesorios de Accesibilidad` — wheelchair accessories, page turners

## Suppliers (Inventario de Materiales)

- Filamentos3D Colombia — PLA variants
- PrintMaster Bogota — PLA, ABS
- 3DXTech Colombia — PLA+, PETG
- NinjaTek Colombia — TPU
- Anycubic Colombia — Resina
