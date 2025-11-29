import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVentasMes: 0,
    totalCobradoMes: 0,
    articulosMasVendidos: [],
    comerciosConMasVentas: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const now = new Date()
      const inicioMes = startOfMonth(now).toISOString()
      const finMes = endOfMonth(now).toISOString()

      // Total vendido en el mes
      const { data: visitasMes } = await supabase
        .from('visitas')
        .select('id, detalle_visitas(importe)')
        .gte('fecha_visita', inicioMes)
        .lte('fecha_visita', finMes)

      const totalVentasMes = visitasMes?.reduce((sum, visita) => {
        const importeVisita = visita.detalle_visitas?.reduce(
          (s, d) => s + parseFloat(d.importe || 0),
          0
        )
        return sum + importeVisita
      }, 0) || 0

      // Total cobrado en el mes
      const { data: cobrosMes } = await supabase
        .from('cobros')
        .select('monto')
        .gte('fecha_pago', inicioMes)
        .lte('fecha_pago', finMes)

      const totalCobradoMes = cobrosMes?.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0) || 0

      // Artículos más vendidos
      const { data: detalles } = await supabase
        .from('detalle_visitas')
        .select('articulo_id, ventas, articulos(nombre)')
        .gte('created_at', inicioMes)
        .lte('created_at', finMes)

      const articulosMap = {}
      detalles?.forEach((d) => {
        const id = d.articulo_id
        if (!articulosMap[id]) {
          articulosMap[id] = {
            nombre: d.articulos?.nombre || 'Sin nombre',
            totalVentas: 0,
          }
        }
        articulosMap[id].totalVentas += d.ventas || 0
      })

      const articulosMasVendidos = Object.values(articulosMap)
        .sort((a, b) => b.totalVentas - a.totalVentas)
        .slice(0, 5)

      // Comercios con más ventas
      const { data: visitasConComercio } = await supabase
        .from('visitas')
        .select('comercio_id, comercios(nombre), detalle_visitas(importe)')
        .gte('fecha_visita', inicioMes)
        .lte('fecha_visita', finMes)

      const comerciosMap = {}
      visitasConComercio?.forEach((v) => {
        const id = v.comercio_id
        const importe = v.detalle_visitas?.reduce((s, d) => s + parseFloat(d.importe || 0), 0) || 0

        if (!comerciosMap[id]) {
          comerciosMap[id] = {
            nombre: v.comercios?.nombre || 'Sin nombre',
            totalVentas: 0,
          }
        }
        comerciosMap[id].totalVentas += importe
      })

      const comerciosConMasVentas = Object.values(comerciosMap)
        .sort((a, b) => b.totalVentas - a.totalVentas)
        .slice(0, 5)

      setStats({
        totalVentasMes,
        totalCobradoMes,
        articulosMasVendidos,
        comerciosConMasVentas,
      })
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Resumen de ventas y estadísticas del mes actual
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Vendido (Mes)</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            ${stats.totalVentasMes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Cobrado (Mes)</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ${stats.totalCobradoMes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Saldo Pendiente</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            ${(stats.totalVentasMes - stats.totalCobradoMes).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Artículos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 Artículos Más Vendidos
          </h3>
          {stats.articulosMasVendidos.length > 0 ? (
            <div className="space-y-3">
              {stats.articulosMasVendidos.map((articulo, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{articulo.nombre}</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {articulo.totalVentas} unidades
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay datos disponibles</p>
          )}
        </div>

        {/* Top Comercios */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top 5 Comercios con Más Ventas
          </h3>
          {stats.comerciosConMasVentas.length > 0 ? (
            <div className="space-y-3">
              {stats.comerciosConMasVentas.map((comercio, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{comercio.nombre}</span>
                  <span className="text-sm font-semibold text-green-600">
                    ${comercio.totalVentas.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay datos disponibles</p>
          )}
        </div>
      </div>
    </div>
  )
}
