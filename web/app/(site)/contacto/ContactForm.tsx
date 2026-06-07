'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'

export function ContactForm() {
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <CheckCircle size={48} className="text-(--blue)" />
        <h3 className="font-(family-name:--font-lora) text-2xl font-bold text-(--ink)">
          Mensaje enviado
        </h3>
        <p className="text-(--ink-500)">
          Gracias por contactarnos. Te responderemos en menos de 24 horas laborables.
        </p>
      </div>
    )
  }

  const fieldClass =
    'w-full bg-white border border-(--line) rounded-(--r-sm) px-4 py-3 text-(--ink) text-[15px] focus:outline-none focus:border-(--blue) focus:ring-2 focus:ring-(--blue)/10 transition-colors placeholder:text-(--ink-400)'

  const labelClass = 'block text-[13px] font-semibold uppercase tracking-wide text-(--ink-500) mb-2'

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
      }}
      className="space-y-6"
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="nombre" className={labelClass}>Nombre *</label>
          <input id="nombre" name="nombre" type="text" required className={fieldClass} placeholder="Tu nombre" />
        </div>
        <div>
          <label htmlFor="telefono" className={labelClass}>Teléfono</label>
          <input id="telefono" name="telefono" type="tel" className={fieldClass} placeholder="+34 600 000 000" />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email *</label>
        <input id="email" name="email" type="email" required className={fieldClass} placeholder="tu@email.com" />
      </div>

      <div>
        <label htmlFor="asunto" className={labelClass}>Asunto *</label>
        <select id="asunto" name="asunto" required className={fieldClass}>
          <option value="">Selecciona un asunto</option>
          <option value="consulta">Consulta sobre un producto</option>
          <option value="pedido">Consulta sobre un pedido</option>
          <option value="presupuesto">Solicitar presupuesto</option>
          <option value="distribucion">Información distribución</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label htmlFor="mensaje" className={labelClass}>Mensaje *</label>
        <textarea
          id="mensaje"
          name="mensaje"
          required
          rows={5}
          className={`${fieldClass} resize-none`}
          placeholder="¿En qué podemos ayudarte?"
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-(--blue) hover:bg-(--blue-dark) text-white font-semibold py-4 rounded-(--r-pill) transition-colors text-base"
      >
        <Send size={18} />
        Enviar mensaje
      </button>

      <p className="text-xs text-(--ink-500) text-center">
        Respondemos en menos de 24 horas laborables
      </p>
    </form>
  )
}
