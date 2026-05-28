# Plan — Logística, Envíos y Panel de Admin
**Grupo Lambea · Reunión 21 mayo 2026**

---

## ALERTA PREVIA — Mercancías peligrosas (leer primero)

Varios productos del catálogo tienen **restricciones de transporte** que los carriers estándar de e-commerce no admiten sin declaración especial:

| Producto | Problema |
|----------|---------|
| DESOXILAM | "Producto ácido — causa quemaduras" (código toxicología 180025/LAM) |
| DECALAM | Decapante gel, probablemente corrosivo |
| INYECLAM DIESEL/GASOLINA | Aditivo de combustible, potencialmente inflamable |
| MOTORLAM | Desengrasante, puede ser inflamable |

**Pregunta crítica para Francisco antes de hablar de transportistas:**
> "¿Cómo envías actualmente los productos? ¿Tu transportista sabe que son líquidos con código toxicológico? ¿Tienes algún acuerdo especial con ellos para esto?"

Si los envía hoy sin problema, su transportista actual ya lo gestiona. Ese es el transportista que queremos integrar, no uno nuevo.

---

## PREGUNTA PREVIA TAMBIÉN IMPORTANTE — ¿Qué formatos van online?

El catálogo tiene formatos hasta **25 litros (391€)**. Una garrafa de 25L pesa ~27kg con embalaje. Eso no es un paquete de Correos.

Hay que definir:
- **¿Los formatos grandes (5L, 25L) se venden en la web?** ¿O son venta directa a empresas por teléfono/email?
- **¿Hay pedido mínimo?** ¿O se puede comprar un bote de 125ml suelto?
- **¿Hay clientes B2B (empresas)?** (condiciones diferentes, facturación, etc.)

---

## 1. OPCIONES DE LOGÍSTICA — Qué ofrecerle a Francisco

### Opción A — Panel + gestión manual enriquecida (recomendado para arrancar)

**Cómo funciona:**
1. Cliente compra en la web → paga con Stripe
2. El panel de Francisco muestra el pedido automáticamente (nombre, dirección, productos, importe)
3. Francisco prepara el paquete y llama/programa recogida con su transportista de siempre (como hace hoy)
4. Francisco entra al panel → escribe el número de tracking → hace clic "Marcar como enviado"
5. El cliente recibe automáticamente un email: "Tu pedido está en camino" con el número de tracking y enlace al rastreador del carrier

**Qué desarrollamos:**
- Panel de pedidos (lista + detalle)
- Campo para introducir número de tracking
- Email automático al cliente cuando se marca como enviado
- Página pública de estado del pedido (opcional)

**Pros:** Rápido de construir (2 semanas), Francisco trabaja con su transportista actual, sin cambios en su forma de operar.  
**Contras:** Francisco tiene que copiar el número de tracking manualmente. No genera etiquetas desde el panel.

**Este es el MVP correcto.** Se puede mejorar después.

---

### Opción B — Integración con Sendcloud (multi-carrier)

**Cómo funciona:**
1. Francisco tiene cuenta en Sendcloud (sendcloud.com) — dashboard en español
2. Sendcloud conecta con SEUR, MRW, GLS, Correos Express, DHL, Nacex (todos con tarifas ya negociadas)
3. Cuando llega un pedido → aparece automáticamente en Sendcloud
4. Francisco entra a Sendcloud → elige carrier y tipo de servicio → hace clic "Crear envío"
5. Se genera la etiqueta → la imprime → la pega en el paquete
6. Sendcloud manda email automático al cliente con tracking en tiempo real

**Lo que integramos nosotros:**
- Webhook: pago confirmado en Stripe → pedido creado en Sendcloud (1 llamada a API)
- En el panel de Francisco: botón "Ver en Sendcloud" que abre el pedido directamente

**Precio Sendcloud:**
- Plan Starter: ~€25/mes (hasta 400 envíos)
- Plan Essential: ~€45/mes (funciones avanzadas, tracking personalizado)
- También tienen tarificación por envío si el volumen es bajo

**Pros:** Francisco compara precios entre carriers, genera etiquetas desde el ordenador, tracking automático sin tocar nada.  
**Contras:** €25/mes extra, Francisco aprende a usar otra plataforma, hay que confirmar que admiten los productos con restricciones toxicológicas.

**Recomendación:** Ofrecerle la Opción A de salida. Si en 3 meses el volumen justifica Sendcloud, lo añadimos. No complicar el lanzamiento.

---

### Opción C — Integración directa con un carrier (SEUR, MRW, etc.)

Solo tiene sentido si Francisco ya tiene contrato negociado con un carrier específico y quiere generar etiquetas desde el panel sin pasar por Sendcloud.

**Contras importantes:**
- Cada carrier tiene una API diferente y documentación variable
- Si quiere cambiar de carrier en el futuro, hay que reintegrar
- MRW y SEUR tienen APIs funcionales pero complejas; Correos Express tiene API más moderna
- Más semanas de desarrollo

**No recomendamos esta opción** salvo que Francisco insista en un carrier concreto con el que ya trabaja.

---

## 2. PARA PEDIR PRESUPUESTO A TRANSPORTISTAS

Si Francisco quiere negociar directamente antes de decidir, necesita estos datos para pedir tarifa:

**Lo que debe decirle al transportista:**

```
- Tipo de envío: paquetes de e-commerce, particulares
- Origen: Sant Jaume d'Enveja, Tarragona (CP 43877)
- Destinos principales: Península (80%), Baleares (20%)
- Peso medio por paquete: [Francisco lo sabe — preguntarle]
- Volumen mensual estimado: [Francisco lo sabe — preguntarle]
- Tipo de mercancía: productos de limpieza concentrados, algunos con código toxicológico
- ¿Admitís esta mercancía? ¿Hay recargo por mercancía peligrosa?
```

**Transportistas a contactar para presupuesto:**
1. **SEUR** — los más usados en e-commerce en España, buenos precios a partir de ~30 envíos/mes
2. **MRW** — muy buena atención a pymes, flexibles con mercancías especiales
3. **GLS** — precio muy competitivo para Península, menos conocidos en Baleares
4. **Correos Express** — opción económica si el volumen es bajo, pero más lento

**Sendcloud como alternativa a negociar:** Las tarifas que tiene Sendcloud negociadas por volumen agregado son normalmente mejores que las que consigue una pyme sola. Merece la pena comparar antes de firmar contrato con un carrier.

---

## 3. PANEL DE ADMINISTRACIÓN — Detalle de lo que incluye

### Acceso
- URL: `admin.grupolambea.com` (subdominio) o `/admin` en la misma web
- Login con email + contraseña (solo Francisco en V1)
- Diseño sencillo, letra grande — adaptado al usuario

### Módulo Pedidos

**Lista de pedidos:**
```
Nº pedido | Fecha | Cliente | Importe | Estado     | Acciones
#1042     | 21/05 | J. Gómez| €54,80  | Nuevo      | [Ver] [Marcar enviado]
#1041     | 20/05 | A. López| €37,50  | Enviado    | [Ver] [Ver tracking]
#1040     | 19/05 | M. Ruiz | €18,00  | Entregado  | [Ver]
```

**Estados del pedido:**
- Nuevo (pago confirmado, pendiente de preparar)
- Procesando (Francisco lo está preparando)
- Enviado (número de tracking introducido → email automático al cliente)
- Entregado (confirmado por el carrier)
- Cancelado / Reembolsado

**Detalle de cada pedido:**
- Datos del cliente (nombre, email, teléfono, dirección completa)
- Productos pedidos (nombre, formato, cantidad, precio)
- Subtotal, promo 3×2 aplicada, gastos de envío, total
- Campo para introducir número de seguimiento
- Botón "Enviar email al cliente" (para comunicaciones manuales si hace falta)
- Historial de estados con fecha y hora

### Módulo Productos

**Lo que Francisco puede editar sin tocar código:**
- Precio de cada formato
- Descripción del producto
- Activar / desactivar producto (desactivado = no aparece en la tienda, no se borra)
- Subir/cambiar foto principal
- Marcar como "Más vendido" (para destacarlo en la home)
- Texto de advertencia de seguridad

**Lo que NO puede editar sin que toquemos código:**
- Añadir nuevos formatos (ej. un formato nuevo que no existe)
- Añadir un producto nuevo de cero (requiere un pequeño trabajo de desarrollo — lo haríamos nosotros)

> Nota: Si Francisco quiere añadir productos él solo, podemos construir un formulario de "nuevo producto". Lo dejamos para V2 si el catálogo crece.

### Módulo Configuración

- **Toggle 3×2:** Activar o desactivar la promoción con un clic (con fecha de fin opcional)
- **Texto del banner promocional:** Editar el texto que aparece en la barra de la tienda
- **Gastos de envío:** Editar el precio de envío a Baleares si cambia
- **Datos de contacto:** Teléfono, email de la página de contacto

### Módulo Estadísticas (básico, V1)

No construimos analytics avanzado — eso ya está en el dashboard de Stripe. Pero sí mostramos:
- Total ventas este mes
- Nº pedidos esta semana
- Productos más vendidos (top 5)
- Pedidos pendientes de enviar (alerta si hay alguno sin gestionar)

---

## 4. FLUJO COMPLETO — De la compra al envío

```
CLIENTE                          WEB / BACKEND                    FRANCISCO
   |                                  |                                |
   | 1. Añade productos               |                                |
   |    al carrito                    |                                |
   |                                  |                                |
   | 2. Va al checkout                |                                |
   |    Introduce dirección           |                                |
   |                                  |                                |
   | 3. Paga con Stripe               |                                |
   |    (Visa / Apple Pay)            |                                |
   |                                  |                                |
   |                             4. Stripe confirma pago              |
   |                                Webhook → Supabase                |
   |                                Pedido creado en BD               |
   |                                                                   |
   | 5. Recibe email:                                                  |
   |    "Pedido #1042                                             6. Recibe email o
   |    recibido, gracias"                                            notificación:
   |                                                                  "Nuevo pedido #1042"
   |                                                                   |
   |                                                              7. Abre el panel
   |                                                                 Ve el pedido
   |                                                                 Prepara el paquete
   |                                                                   |
   |                                                              8. Llama al carrier /
   |                                                                 programa recogida
   |                                                                   |
   |                                                              9. Introduce nº tracking
   |                                                                 en el panel →
   |                                                                 Clic "Marcar enviado"
   |                                  |                                |
   | 10. Recibe email:                |                                |
   |     "Tu pedido está              |                                |
   |     en camino"                   |                                |
   |     + enlace tracking            |                                |
   |                                  |                                |
   | 11. Rastrea el envío             |                                |
   |     (enlace al carrier)          |                                |
```

---

## 5. ESTIMACIÓN DE TIEMPO — Panel + Logística

| Módulo | Semanas |
|--------|---------|
| Supabase + auth (base de datos y login Francisco) | 0,5 |
| Panel pedidos — lista + detalle + estados | 1,5 |
| Email automático al cliente (pedido recibido + enviado) | 0,5 |
| Panel productos — editar precio, foto, activar/desactivar | 1,5 |
| Panel configuración (3×2 toggle, textos) | 0,5 |
| Estadísticas básicas | 0,5 |
| **Total panel de admin** | **~5 semanas** |
| *(Opcional) Integración Sendcloud* | *+2 semanas* |
| *(Opcional) Integración carrier directo* | *+2-3 semanas* |

Esto se suma a las 5-6 semanas del frontend (tienda, fichas, carrito, checkout).

**Total estimado proyecto completo: 10-12 semanas** con Opción A de logística (manual enriquecido).

---

## 6. PREGUNTAS IMPRESCINDIBLES PARA LA REUNIÓN

### Sobre envíos y logística
1. **¿Cuántos pedidos al mes gestionas actualmente?** → define si Sendcloud vale la pena
2. **¿Con qué transportista trabajas ahora?** → ese es el que integramos primero
3. **¿Tu transportista admite los productos con código toxicológico?** → crítico, no asumir que sí
4. **¿Tienes impresora en el almacén?** ¿Impresora de etiquetas o imprime en A4?
5. **¿Quién prepara los paquetes?** ¿Solo tú? ¿Tienes ayuda?
6. **¿Los pedidos los recoge el carrier en tu almacén o los llevas tú?**
7. **¿Envías a Canarias o solo Península + Baleares?** ¿A Portugal? ¿Al resto de Europa?

### Sobre los productos y formatos
8. **¿Los formatos de 25L se venden online?** ¿O son para empresas por canal directo?
9. **¿Hay pedido mínimo?** ¿O se puede comprar un bote de 125ml suelto?
10. **¿Tienes clientes empresa (B2B)?** Si sí, ¿necesitan factura con CIF, condiciones especiales?

### Sobre devoluciones
11. **¿Cómo gestionas las devoluciones ahora?** ¿El cliente paga el envío de vuelta?
12. **¿Qué pasa con un producto que llega roto o en mal estado?** ¿Lo reenvías tú o Stripe hace el reembolso?

### Sobre el panel
13. **¿Usas más el ordenador o el móvil para gestionar el negocio?** → el panel tiene que funcionar bien en lo que usa Francisco
14. **¿Solo tú o habrá alguien más gestionando pedidos?** (esposa, empleado...)
15. **¿Qué email quieres para recibir las notificaciones de pedidos?** (¿francisco@grupolambea.com?)

---

## 7. RESUMEN — Qué le ofreces a Francisco

**Lo que construimos:**

✅ Tienda online con catálogo completo (50 productos, 3 líneas)  
✅ Carrito con promo 3×2 automática  
✅ Checkout con Stripe (Visa, Mastercard, Apple Pay)  
✅ Emails automáticos (confirmación de pedido + aviso de envío con tracking)  
✅ Panel de administración propio en español, letra grande, diseño sencillo  
✅ Gestión completa de pedidos (estados, tracking, historial)  
✅ Edición de productos sin tocar código (precio, foto, descripción, activar/desactivar)  
✅ Toggle 3×2 on/off desde el panel  
✅ SEO técnico: URLs limpias, schema markup, sitemap, redirecciones 301 desde la web actual  
✅ Velocidad y móvil: Next.js estático, Core Web Vitals verde  

**Lo que NO incluye (para no inflar el alcance):**
- Generación de etiquetas de envío (lo hace con su carrier de siempre, como ahora)
- ERP ni contabilidad
- App móvil (el panel es web responsive)
- Múltiples idiomas

**Opcional a añadir si quiere:**
- Integración Sendcloud (generación de etiquetas + multi-carrier): +2 semanas + ~25€/mes
- Blog con editor (para SEO de contenido a largo plazo)
- Importación de reseñas de Google My Business

---

*Documento interno — Adrià / Arismultimedia — 21 mayo 2026*
